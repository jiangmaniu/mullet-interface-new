import { BNumber, BNumberValue } from '@mullet/utils/number'

export enum RiseAndFallTypeEnum {
  Rise = 'rise',
  Fall = 'fall',
  Same = 'same',
}

export interface RiseAndFallInfo {
  type: RiseAndFallTypeEnum
  isRise: boolean
  isFall: boolean
  isSame: boolean
}

export const parseRiseAndFallInfo = (priceDiff?: BNumberValue) => {
  const bPriceDiff = BNumber.from(priceDiff)
  const type = bPriceDiff?.gt(0)
    ? RiseAndFallTypeEnum.Rise
    : bPriceDiff?.lt(0)
      ? RiseAndFallTypeEnum.Fall
      : RiseAndFallTypeEnum.Same

  const info: RiseAndFallInfo = {
    type,
    isRise: type === RiseAndFallTypeEnum.Rise,
    isFall: type === RiseAndFallTypeEnum.Fall,
    isSame: type === RiseAndFallTypeEnum.Same,
  }

  return info
}
