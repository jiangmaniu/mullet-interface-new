import { CommonTableBody } from '@/components/table/common-table'
import { TablePagination } from '@/components/table/table-pagination'
import { Table, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useSolExploreUrl } from '@/hooks/web3/use-sol-explore-url'
import { SharesRecordWrapper, useGetSharesRecordListApiOptions } from '@/services/api/trade-core/hooks/follow-manage/shares-record-list'
import { cn } from '@/utils/cn'
import { dayjs, TimeFormatEnum } from '@/utils/dayjs'
import { renderFallback } from '@/utils/format/fallback'
import { formatAddress } from '@/utils/web3'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef, flexRender, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'
import { useVaultDetail } from '../../_hooks/use-vault-detail'

export const vaultDepositsAndWithdrawalsTablecolumns: ColumnDef<SharesRecordWrapper>[] = [
  {
    accessorKey: 'time',
    header: () => '时间',
    cell: ({ row }) => {
      return <div className="max-w-[150px]">{dayjs(row.original.createTime).format(TimeFormatEnum.default)}</div>
    }
  },
  {
    accessorKey: 'type ',
    header: () => '类型',
    cell: ({ row }) => {
      return <div className={cn('')}>{row.original.type}</div>
    }
  },
  {
    accessorKey: 'amount',
    header: () => '金额',
    cell: ({ row }) => {
      return <div className={cn('')}> {row.original.moneyAmount}</div>
    }
  },
  {
    accessorKey: 'balance',
    header: () => '余额',
    cell: ({ row }) => {
      return <div className={cn('')}>{row.original.newShares}</div>
    }
  },

  {
    accessorKey: 'change before',
    header: () => ' 变动前',
    cell: ({ row }) => {
      return <div className="">{row.original.oldShares}</div>
    }
  },
  {
    accessorKey: 'tx',
    header: () => '交易签名',
    cell: ({ row }) => {
      return (
        <div className="">
          <TxCell txHash={row?.original?.signature} />
        </div>
      )
    }
  }
]

const TxCell = ({ txHash }: { txHash?: string }) => {
  const { getSolExplorerUrl } = useSolExploreUrl()
  return renderFallback(
    <a href={getSolExplorerUrl(txHash!)} className="text-[#1C66FF]" target="_blank">
      {formatAddress(txHash)}
    </a>,
    { verify: !!txHash }
  )
}

export const VaultDepositsAndWithdrawalsRecords = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 10
  })

  const { vaultDetail } = useVaultDetail()

  const { getSharesRecordListApiOptions } = useGetSharesRecordListApiOptions({
    current: pagination.pageIndex,
    size: pagination.pageSize,
    followManageId: vaultDetail?.id!
  })

  const { data: pageData, isLoading } = useQuery({
    ...getSharesRecordListApiOptions,
    enabled: !!vaultDetail?.id
  })
  console.log(pageData)

  const data = pageData?.records || []
  const table = useReactTable({
    data,
    columns: vaultDepositsAndWithdrawalsTablecolumns,
    pageCount: pageData?.current,
    rowCount: pageData?.records?.length,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    state: {
      pagination
    }
  })

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <CommonTableBody table={table} loading={isLoading}>
          {(row) => {
            return (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            )
          }}
        </CommonTableBody>
      </Table>

      <TablePagination className="py-4" table={table} pageData={pageData} />
    </div>
  )
}
