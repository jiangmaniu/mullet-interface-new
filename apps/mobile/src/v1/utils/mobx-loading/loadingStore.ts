import { action, makeAutoObservable, observable } from 'mobx'

export const NAMESPACE_SEP = '/'

interface Counter {
  models: Record<string, number>
  actions: Record<string, number>
}

const counter: Counter = {
  models: {},
  actions: {}
}

function modelCount(model: string, state: boolean): boolean {
  if (typeof counter.models[model] === 'undefined') {
    counter.models[model] = 0
  }

  if (state === true) {
    counter.models[model] += 1
  } else if (state === false) {
    counter.models[model] = Math.max(counter.models[model] - 1, 0)
  }
  return counter.models[model] > 0
}

function actionCount(action: string, state: boolean): boolean {
  if (typeof counter.actions[action] === 'undefined') {
    counter.actions[action] = 0
  }

  if (state === true) {
    counter.actions[action] += 1
  } else if (state === false) {
    counter.actions[action] = Math.max(counter.actions[action] - 1, 0)
  }

  return counter.actions[action] > 0
}

// reference https://github.com/mobxjs/mobx/blob/master/src/api/actiondecorator.ts
class LoadingStore {
  constructor() {
    makeAutoObservable(this) // 让数据发生变化可响应
  }
  // global loading state
  @observable global = false

  // load status of each model
  @observable models: Record<string, boolean> = {}

  // load status of each action
  @observable actions: Record<string, boolean> = {}

  // change load status
  @action.bound
  async change(model: string, action: string | undefined, state: boolean) {
    if (action) {
      this.actions[action] = actionCount(action, state)
    }
    if (state === true) {
      this.models[model] = modelCount(model, state)
      this.global = true
    } else {
      this.models[model] = Object.keys(this.actions)
        .filter((key) => {
          return key && key.startsWith(`${model}${NAMESPACE_SEP}`)
        })
        .some((key) => {
          return this.actions[key]
        })

      this.global = Object.keys(this.models).some((key) => {
        return this.models[key]
      })
    }
  }
}

export default new LoadingStore()
