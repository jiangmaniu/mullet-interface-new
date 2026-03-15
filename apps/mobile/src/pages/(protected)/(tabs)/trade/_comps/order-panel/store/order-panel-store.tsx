import { create, createStore } from 'zustand'

export interface OrderPanelProps {
  // symbol: string
}

type OrderPanelState = {
  /** 限价价格 */
  limintPrice: string
  /** 手数 */
  orderLots: string
} & OrderPanelProps

type OrderPanelActions = {
  setOrderPrice: (price: string) => void
  setOrderVolume: (volume: string) => void
}

export type OrderPanelStateAll = OrderPanelState & OrderPanelActions

// export type OrderPanelStore = ReturnType<typeof createOrderPanelStore>

// export const createOrderPanelStore = ({ symbol }: OrderPanelProps) => {
//   const orderPanelState: OrderPanelState = {
//     symbol,
//     limintPrice: '',
//     orderLots: '',
//   }

//   const store = createStore<OrderPanelStateAll>((set) => {
//     const actionsPanelState: OrderPanelActions = {
//       setOrderPrice: (price: string) => {
//         set({ limintPrice: price })
//       },
//       setOrderVolume: (volume: string) => {
//         set({ orderLots: volume })
//       },
//     }
//     return {
//       ...orderPanelState,
//       ...actionsPanelState,
//     }
//   })

//   return store
// }

export const useOrderPanelStore = create<OrderPanelStateAll>((set) => {
  const orderPanelState: OrderPanelState = {
    limintPrice: '',
    orderLots: '',
  }

  const actionsPanelActions: OrderPanelActions = {
    setOrderPrice: (price: string) => {
      set({ limintPrice: price })
    },
    setOrderVolume: (volume: string) => {
      set({ orderLots: volume })
    },
  }

  return {
    ...orderPanelState,
    ...actionsPanelActions,
  }
})

export const limitPriceSelector = (state: OrderPanelStateAll) => state.limintPrice

export const orderVolumeSelector = (state: OrderPanelStateAll) => state.orderLots
