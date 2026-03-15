// import { createContext, PropsWithChildren, useContext, useState } from 'react'
// import { useStore } from 'zustand'

// import { createOrderPanelStore, OrderPanelProps, OrderPanelStore } from '../store/order-panel-store'

// const OrderPanelContext = createContext<OrderPanelStore>({} as OrderPanelStore)

// export const OrderPanelProvider = ({ children, ...props }: PropsWithChildren<OrderPanelProps>) => {
//   const [store] = useState(() => createOrderPanelStore(props))

//   return <OrderPanelContext.Provider value={store}>{children}</OrderPanelContext.Provider>
// }

// export function useOrderPanelStoreContext() {
//   const orderPanelStore = useContext(OrderPanelContext)
//   if (!orderPanelStore) throw new Error('Missing OrderPanelContext.Provider in the tree')

//   return orderPanelStore
// }

// export const useOrderPanelStore = () => {
//   const orderPanelStore = useOrderPanelStoreContext()
//   return useStore(orderPanelStore)
// }
