// ChangeStreamBatcher.ts
import { Observable, Subject } from 'rxjs'
import { EntityTypable } from '../EntityTypable'
import { getEntityTypeName } from '../getEntityTypeName'
import MongoEntityManager from '../MongoEntityManager'

export class ChangeStreamBatcher {
  private changeStreams: Map<string, any> = new Map()
  private subjects: Map<string, Map<string, Subject<any>>> = new Map()
  private updateQueue: Map<string, Map<string, any>> = new Map()
  private updateTimer: any

  constructor(private readonly mongoEntityManager: MongoEntityManager) {}

  getMongoDBChangeStream(type: EntityTypable, options: { id: string }) {
    const entityType = getEntityTypeName(type)
    if (!this.changeStreams.has(entityType)) {
      this.initializeChangeStream(entityType)
    }

    if (!this.subjects.has(entityType)) {
      this.subjects.set(entityType, new Map())
    }

    let subjectsMap = this.subjects.get(entityType)

    if (!subjectsMap.has(options.id)) {
      const subject = new Subject<any>()
      subjectsMap.set(options.id, subject)
    }

    const subject = subjectsMap.get(options.id)

    return new Observable((observer) => {
      const subscription = subject.subscribe(observer)
      return () => {
        subscription.unsubscribe()
        if (subject.observers.length === 0) {
          subjectsMap.delete(options.id)
          if (subjectsMap.size === 0) {
            this.changeStreams.get(entityType)?.close()
            this.changeStreams.delete(entityType)
          }
        }
      }
    })
  }

  private lastUpdateTimestamps: Map<string, number> = new Map()
  private initializeChangeStream(entityType: string) {
    const collection = this.mongoEntityManager.getCollection(entityType)
    const changeStream = collection.watch()
    this.changeStreams.set(entityType, changeStream)

    changeStream.on('change', async (change) => {
      if ('documentKey' in change) {
        const id = change.documentKey?._id.toString()
        const subjectsMap = this.subjects.get(entityType)

        if (subjectsMap && subjectsMap.has(id)) {
          if ('updateDescription' in change) {
            if (subjectsMap && subjectsMap.has(id)) {
              try {
                const updatedFields =
                  change.updateDescription?.updatedFields || {}
                const removedFields =
                  change.updateDescription?.removedFields || []

                // Remove the removed fields from the updatedFields object
                for (const field of removedFields) {
                  delete updatedFields[field]
                }

                const entityQueueKey = `${entityType}-${id}`
                const now = Date.now()
                const lastUpdateTimestamp =
                  this.lastUpdateTimestamps.get(entityQueueKey) || 0
                const timeSinceLastUpdate = now - lastUpdateTimestamp
                const isFirstUpdate = timeSinceLastUpdate > 100 // Adjust the threshold value as needed

                // Add the updated fields to the update queue
                this.addToUpdateQueue(entityType, id, updatedFields)

                if (isFirstUpdate) {
                  // Send the first update immediately
                  this.processUpdateQueue()
                } else if (!this.updateTimer) {
                  // Start the update timer if it's not already running
                  this.updateTimer = setTimeout(() => {
                    this.processUpdateQueue()
                    this.updateTimer = null
                  }, 1000) // Adjust the timeout value as needed
                }

                // Update the last update timestamp
                this.lastUpdateTimestamps.set(entityQueueKey, now)
              } catch (e) {
                console.error(e)
              }
            }
          } else {
            try {
              subjectsMap
                .get(id)
                .next(await this.mongoEntityManager.read(entityType, id))
            } catch (e) {
              console.error(e)
            }
          }
        }
      }
    })

    changeStream.on('error', (error) => {
      console.error(`changeStream error: ${JSON.stringify(error)}`)
    })

    changeStream.on('end', () => {
      console.debug(`changeStream end`)
    })
  }

  private addToUpdateQueue(entityType: string, id: string, updatedFields: any) {
    if (!this.updateQueue.has(entityType)) {
      this.updateQueue.set(entityType, new Map())
    }

    const entityQueue = this.updateQueue.get(entityType)

    if (!entityQueue.has(id)) {
      entityQueue.set(id, {})
    }

    const currentUpdates = entityQueue.get(id)

    // Merge the new updates with the existing updates in the queue
    Object.assign(currentUpdates, updatedFields)
  }

  private processUpdateQueue() {
    for (const [entityType, entityQueue] of this.updateQueue.entries()) {
      for (const [id, updatedFields] of entityQueue.entries()) {
        const subjectsMap = this.subjects.get(entityType)

        if (subjectsMap && subjectsMap.has(id)) {
          // Send the accumulated updates to the observers
          subjectsMap.get(id).next(updatedFields)
        }

        // Clear the update queue for this entity and ID
        entityQueue.delete(id)
      }
    }
  }
}
