import { useMemo } from 'react'
import useConnection from './useConnection'
import { appendTransactionMessageInstruction, BaseTransactionMessage, TransactionMessageWithFeePayer } from '@solana/kit'
import { estimateComputeUnitLimitFactory, getSetComputeUnitLimitInstruction } from '@solana-program/compute-budget'

function estimateAndSetComputeUnitLimitFactory(...params: Parameters<typeof estimateComputeUnitLimitFactory>) {
  const estimateComputeUnitLimit = estimateComputeUnitLimitFactory(...params)
  return async <T extends BaseTransactionMessage & TransactionMessageWithFeePayer>(transactionMessage: T) => {
    const computeUnitsEstimate = await estimateComputeUnitLimit(transactionMessage)
    return appendTransactionMessageInstruction(getSetComputeUnitLimitInstruction({ units: computeUnitsEstimate }), transactionMessage)
  }
}

export function useEstimateComputeUnitLimit() {
  const { rpc } = useConnection()

  const estimateComputeUnitLimit = useMemo(() => {
    return estimateAndSetComputeUnitLimitFactory({
      rpc
    })
  }, [rpc])

  return { estimateComputeUnitLimit }
}
