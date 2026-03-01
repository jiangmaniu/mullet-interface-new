import Reactotron from 'reactotron-react-native'

declare global {
  interface Console {
    tron: typeof Reactotron
  }
}

const reactotron = Reactotron.configure({
  name: 'Mullet',
})
  .useReactNative({
    networking: {
      ignoreUrls: /symbolicate|127\.0\.0\.1|localhost/,
    },
  })
  .connect()

// 挂载到 console 方便全局使用
console.tron = reactotron

export default reactotron
