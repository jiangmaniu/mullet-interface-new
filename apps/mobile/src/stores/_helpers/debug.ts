// debug/wrapSet.ts
export const wrapSet = (set: any) => {
  let setCount = 0

  if (__DEV__) {
    setInterval(() => {
      console.log('[perf] set/s:', setCount)
      setCount = 0
    }, 1000)
  }

  return (...args: any[]) => {
    setCount++
    return set(...args)
  }
}

let selectorCount = 0

export const countSelector = <T>(fn: (state: any) => T) => {
  return (state: any) => {
    selectorCount++
    return fn(state)
  }
}

// 每秒打印
if (__DEV__) {
  setInterval(() => {
    console.log('[perf] selector/s:', selectorCount)
    selectorCount = 0
  }, 1000)
}
