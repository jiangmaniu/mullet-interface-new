import loadingStore, { NAMESPACE_SEP } from './loadingStore'

// lowercase the first
function lowerCaseFirst(str: string) {
  if (str === null) {
    return ''
  }

  str = String(str)

  return str.charAt(0).toLowerCase() + str.substr(1)
}

/**
 * execute action
 * @param names [model, action]
 * @param func
 * @param scope
 * @returns {function(): *}
 */
function executeAction(names: string[], func: (...args: any[]) => Promise<any>, scope?: any) {
  return function (this: any, ...args: any[]) {
    const [model, action] = names

    loadingStore.change(model, action, true)

    const promise = func.apply(scope || this, args)

    // hope is a promise object
    if (typeof promise === 'object' && typeof promise.finally === 'function') {
      promise.finally(() => {
        loadingStore.change(model, action, false)
      })
    } else {
      loadingStore.change(model, action, false)
    }

    return promise
  }
}

function actionDecorator(this: any, target: any, prop: string, descriptor: PropertyDescriptor, name?: string | string[]) {
  let names: any[]
  if (typeof name === 'undefined' && target.constructor && typeof target.constructor.name === 'string') {
    if (target.namespace) {
      name = target.namespace
      prop = lowerCaseFirst(prop)
    } else {
      name = lowerCaseFirst(target.constructor.name)
      prop = lowerCaseFirst(prop)
    }

    names = [name, lowerCaseFirst(`${name}${NAMESPACE_SEP}${prop}`)]
  } else if (Array.isArray(name)) {
    names = [name[0], name.length > 1 ? name.join(NAMESPACE_SEP) : null]
  } else {
    name = String(name).split(NAMESPACE_SEP)

    names = [name[0], name.length > 1 ? name.join(NAMESPACE_SEP) : null]
  }

  if (descriptor) {
    // @ts-ignore
    if (process.env.NODE_ENV !== 'production' && descriptor.get !== undefined) {
      throw new Error('@loading cannot be used with getters')
    }
    // babel / typescript
    // @action method() { }
    if (descriptor.value) {
      // typescript
      return {
        value: executeAction(names, descriptor.value),
        enumerable: false,
        configurable: true, // See #1477
        writable: true // for typescript, this must be writable, otherwise it cannot inherit :/ (see inheritable actions test)
      }
    }

    // babel only: @action method = () => {}
    const initializer = (descriptor as any).initializer

    return {
      enumerable: false,
      configurable: true, // See #1477
      writable: true, // See #1398
      initializer() {
        // N.B: we can't immediately invoke initializer; this would be wrong
        return executeAction(names, initializer.call(this))
      }
    }
  }

  // bound loadingStore methods
  return fieldActionDecorator(names).call(this, target, prop, descriptor)
}

function fieldActionDecorator(name: string[]) {
  // Simple property that writes on first invocation to the current loadingStore
  return function (target: any, prop: string, descriptor: PropertyDescriptor) {
    Object.defineProperty(target, prop, {
      configurable: true,
      enumerable: false,
      get() {
        return undefined
      },
      set(value) {
        // 待实现
      }
    })
  }
}

export default function loading(this: any, ...args: any[]): any {
  if (args.length === 1) {
    return function (target: any, prop: string, descriptor: PropertyDescriptor) {
      return actionDecorator(target, prop, descriptor, args[0])
    }
  } else {
    const [target, prop, descriptor, name] = args
    return actionDecorator.call(this, target, prop, descriptor, name)
  }
}
