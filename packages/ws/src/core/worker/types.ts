import type { SubscriptionParams, SubscriptionType, UnsubscribeParams, WSClientConfig } from '../types'

export enum WSWorkerMessageType {
  INIT = 'init',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  CLOSE = 'close',
  GET_STATUS = 'getStatus',
}

export interface WSWorkerInitMessageData {
  type: WSWorkerMessageType.INIT
  config: WSClientConfig
}

export interface WSWorkerSubscribeMessageData {
  type: WSWorkerMessageType.SUBSCRIBE
  subscriptionType: SubscriptionType
  params: SubscriptionParams
}

export interface WSWorkerUnsubscribeMessageData {
  type: WSWorkerMessageType.UNSUBSCRIBE
  subscriptionType: SubscriptionType
  params: UnsubscribeParams
}

export interface WSWorkerGetStatusMessageData {
  type: WSWorkerMessageType.GET_STATUS
}

export interface WSWorkerCloseMessageData {
  type: WSWorkerMessageType.CLOSE
}

export type WSWorkerMessageData =
  | WSWorkerInitMessageData
  | WSWorkerSubscribeMessageData
  | WSWorkerUnsubscribeMessageData
  | WSWorkerGetStatusMessageData
  | WSWorkerCloseMessageData

export enum WSWorkerMessageResponseType {
  STATUS = 'status',
  CONNECTION_STATUS = 'connectionStatus',
  DATA = 'data',
  READY = 'ready',
}

export type WSWorkerMessageResponseData =
  | {
      type: WSWorkerMessageResponseType.READY
    }
  | {
      type: WSWorkerMessageResponseType.STATUS
      data: Record<string, Record<string, number>>
    }
  | {
      type: WSWorkerMessageResponseType.CONNECTION_STATUS
      connected: boolean
    }
  | {
      type: WSWorkerMessageResponseType.DATA
      subscriptionType: SubscriptionType
      data: string
    }
