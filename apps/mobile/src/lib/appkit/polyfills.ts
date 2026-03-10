// 必须放在最前面，处理 polyfills
import 'text-encoding' // needed for @solana/web3.js to work
import '@walletconnect/react-native-compat'

// // Polyfill document for @reown/appkit-react-native
// // 某些 Web3 库可能会检查 document 对象的存在性
// if (typeof document === 'undefined') {
//   const noop = () => {}
//   const noopElement: any = {
//     addEventListener: noop,
//     removeEventListener: noop,
//     dispatchEvent: noop,
//     setAttribute: noop,
//     getAttribute: () => null,
//     removeAttribute: noop,
//     appendChild: noop,
//     removeChild: noop,
//     style: {},
//   }

//   // @ts-ignore - React Native 环境下的最小化 document mock
//   global.document = {
//     createElement: () => noopElement,
//     createElementNS: () => noopElement,
//     getElementById: () => null,
//     querySelector: () => null,
//     querySelectorAll: () => [],
//     getElementsByTagName: () => [],
//     getElementsByClassName: () => [],
//     addEventListener: noop,
//     removeEventListener: noop,
//     dispatchEvent: noop,
//     body: noopElement,
//     head: noopElement,
//     documentElement: noopElement,
//   } as any
// }

// // Polyfill window (React Native 环境下可能不存在)
// if (typeof window === 'undefined') {
//   // @ts-ignore
//   global.window = global as any
// }

// // Polyfill window 事件方法
// if (typeof window !== 'undefined') {
//   const noop = () => {}

//   if (!window.addEventListener) {
//     // @ts-ignore
//     window.addEventListener = noop
//   }
//   if (!window.removeEventListener) {
//     // @ts-ignore
//     window.removeEventListener = noop
//   }
//   if (!window.dispatchEvent) {
//     // @ts-ignore
//     window.dispatchEvent = noop
//   }
// }

// // Polyfill window.location (某些库可能需要)
// if (typeof window !== 'undefined' && !window.location) {
//   // @ts-ignore - React Native 环境下的最小化 location mock
//   window.location = {
//     href: '',
//     origin: '',
//     protocol: '',
//     host: '',
//     hostname: '',
//     port: '',
//     pathname: '',
//     search: '',
//     hash: '',
//   } as any
// }
