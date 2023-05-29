import { invariant } from 'modules/errors'
export enum EntityFieldMetadata {
  ENTITY_FIELD = 'entityField',
  ENTITY_FIELD_GETTER = 'entityFieldGetter',
  ENTITY_FIELD_BEFORE_SET = 'entityFieldSetter',
  STREAMABLE_FIELD = 'streamableField',
}

function EntityField<T>(options?: {
  streamable?: boolean
  get?: () => T
  beforeSet?: (value: T, opts: { entity: any }) => void
  defaultValue?: T
}) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(
      EntityFieldMetadata.ENTITY_FIELD,
      true,
      target,
      propertyKey
    )

    if (options?.streamable) {
      Reflect.defineMetadata(
        EntityFieldMetadata.STREAMABLE_FIELD,
        true,
        target,
        propertyKey
      )
    }

    if (options?.get) {
      // Assert no default value, won't take effect
      invariant(!options.defaultValue, '`get` will override `defaultValue`')
      Reflect.defineMetadata(
        EntityFieldMetadata.ENTITY_FIELD_GETTER,
        options.get,
        target,
        propertyKey
      )
    } else if (options?.defaultValue) {
      Reflect.defineMetadata(
        EntityFieldMetadata.ENTITY_FIELD_GETTER,
        ({ value }) => value ?? options.defaultValue,
        target,
        propertyKey
      )
    }

    if (options?.beforeSet) {
      Reflect.defineMetadata(
        EntityFieldMetadata.ENTITY_FIELD_BEFORE_SET,
        options.beforeSet,
        target,
        propertyKey
      )
    }
  }
}

export default EntityField
