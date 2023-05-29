import { Constructor } from 'type-fest'

export type EntityTypable<T = any> = string | Constructor<T>
