import { Observable } from 'rxjs'
import { Constructor } from 'type-fest'

export interface IEntityManager {
  create(entityType, entity): Promise<any>
  read<T = any>(entityType: Constructor<T> | string, id): Promise<T>
  update(entityType, id, updates, revisionNumber?: number): Promise<any>
  delete(entityType, id): Promise<any>
  find<T = any>(entityType: Constructor<T> | string, query): Promise<T[]>
  watch(entityType, opts: { id: string }): Observable<any>
  call(entityType, id, method, args): Promise<any>
  id: string
}
