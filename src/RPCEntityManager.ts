import RPCClient from 'modules/rpc-ws/client'
import { getPortForName } from 'modules/transport'
import { Observable, Subject, finalize, firstValueFrom, share } from 'rxjs'
import { Constructor } from 'type-fest'
import Entity from './Entity'
import { RemoteEntityManager } from './RemoteEntityManager'
import { getEntityTypeName } from './getEntityTypeName'

let nextId = 0

export class RPCEntityManager extends RemoteEntityManager {
  client: any
  public readonly isRPC = true
  constructor(
    protected entities: Constructor<Entity>[],
    protected name: string
  ) {
    super(entities)
    const port = getPortForName(name)
    this.client = new RPCClient(`ws://localhost:${port}`)
  }
  id: string = (++nextId).toString()

  obsToPromise<T>(obs: Observable<T>): Promise<T> {
    return firstValueFrom(obs)
  }

  call(
    entityType: string,
    id: string,
    method: string,
    args: any[]
  ): Promise<any> {
    // The idea is that calls are executed remotely, so no need for an implementation here
    throw new Error('Method not implemented.')
  }

  async executeRemote(
    entityType: string,
    id: string,
    method: string,
    args: any[]
  ): Promise<any> {
    // You can define how to call the remote method using the RPCClient instance (`this.client`)
    // For example, if the RPCClient has a "call" method:
    const result = await this.obsToPromise(
      this.client.call({ args: [entityType, id, method, args] })
    )
    return result
  }
  async create(entityType: string, entity: any): Promise<any> {
    const result = await this.obsToPromise(
      this.client.create({ args: [getEntityTypeName(entityType), entity] })
    )
    return this.createEntityInstance(entityType, result)
  }

  async read(entityType: string, id: string): Promise<any> {
    const result = await this.obsToPromise(
      this.client.read({ args: [entityType, id] })
    )
    return this.createEntityInstance(entityType, result)
  }

  async update(
    entityType: string,
    id: string,
    updates: any,
    revisionNumber: number
  ): Promise<any> {
    const result = await this.obsToPromise(
      this.client.update({ args: [entityType, id, updates, revisionNumber] })
    )
    return this.createEntityInstance(entityType, result)
  }

  async delete(entityType: string, id: string): Promise<any> {
    return this.obsToPromise(this.client.delete({ args: [entityType, id] }))
  }

  async find(entityType: string, query: any): Promise<any> {
    const results = await this.obsToPromise(
      this.client.find({ args: [entityType, query] })
    )
    return (results as any[]).map((result) =>
      this.createEntityInstance(entityType, result)
    )
  }

  private observablesMap: Map<string, Observable<any>> = new Map()

  watch(entityType: string, options: { id: string }): Observable<any> {
    const { id } = options

    if (!this.observablesMap.has(id)) {
      const subject = new Subject<any>()
      const observable = this.client
        .watch({ args: [entityType, options] })
        .pipe(
          finalize(() => {
            subject.unsubscribe()
            this.observablesMap.delete(id)
          }),
          share()
        )

      this.observablesMap.set(id, observable)
    }

    return this.observablesMap.get(id)!
  }
}
