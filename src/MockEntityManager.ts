import { Observable } from "rxjs";
import { IEntityManager } from "./IEntityManager";

export class MockEntityManager implements IEntityManager {
  create(entityType: any, entity: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  read(entityType: any, id: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  update(entityType: any, id: any, updates: any, revisionNumber?: number): Promise<any> {
    // throw new Error("Method not implemented.");
    return null
  }
  delete(entityType: any, id: any): Promise<any> {
    // throw new Error("Method not implemented.");
    return null
  }
  find(entityType: any, query: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  watch(entityType: any, opts: { id: string; }): Observable<any> {
    throw new Error("Method not implemented.");
  }
  call(entityType: any, id: any, method: any, args: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  id: string;

}