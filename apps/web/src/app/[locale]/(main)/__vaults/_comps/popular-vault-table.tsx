import { useQuery } from '@tanstack/react-query'
import { ColumnDef, flexRender, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { isNil, isUndefined } from 'lodash-es'
import { useRouter } from 'next/navigation'

import { CommonTableBody } from '@/components/table/common-table'
import { TablePagination } from '@/components/table/table-pagination'
import {
  useGetVaultListApiOptions,
  VaultListItemWrapper,
} from '@/services/api/trade-core/hooks/follow-manage/vault-page-list'
import { cn } from '@mullet/ui/lib/utils'
import { Table, TableCell, TableHead, TableHeader, TableRow } from '@mullet/ui/table'
import { dayjs } from '@mullet/utils/dayjs'
// import { useStores } from '@/context/mobxProvider'
import { renderFallback } from '@mullet/utils/fallback'
import { formatAddress } from '@mullet/utils/format'
import { BNumber } from '@mullet/utils/number'

import { useVaultListContext } from './list'

export const vaultListTableColumns: ColumnDef<VaultListItemWrapper>[] = [
  {
    accessorKey: 'name',
    header: () => '金库',
    cell: ({ row }) => {
      return <div>{row.original.vaultName}</div>
    },
  },
  {
    accessorKey: '创建者',
    header: () => '创建者',
    cell: ({ row }) => {
      return (
        <div className={cn('')}>
          {renderFallback(formatAddress(row.original.creator), { verify: !isNil(row.original.creator) })}
        </div>
      )
    },
  },
  {
    accessorKey: '年利率',
    header: () => '年利率',
    cell: ({ row }) => {
      return <div className={cn('')}> {BNumber.toFormatPercent(row.original.interestRate)}</div>
    },
  },
  {
    accessorKey: 'tvl',
    header: () => 'TVL(总锁定价值)',
    cell: ({ row }) => {
      return <div className={cn('')}>{BNumber.toFormatNumber(row.original.tvl)}</div>
    },
  },

  {
    accessorKey: 'mySharesValue',
    header: () => '您的存款',
    cell: ({ row }) => {
      return <div className="">{BNumber.toFormatNumber(row.original.mySharesValue)}</div>
    },
  },
  {
    accessorKey: 'day',
    header: () => '时间(天)',
    cell: ({ row }) => {
      const diffDay = dayjs().diff(dayjs(row.original.createTime), 'day')
      return <div className="">{renderFallback(`${diffDay}天`, { verify: !isUndefined(diffDay) })}</div>
    },
  },

  {
    accessorKey: 'Snapshot',
    header: () => '快照',
    cell: ({ row }) => {
      return <div className="">{/* {row.original.feeApy} */}-</div>
    },
  },
]

const TABLE_COMMON_PAGE_SIZE = 10

export function PopularVaultTable() {
  // const { trade } = useStores()
  // const currentAccountInfo = trade.currentAccountInfo
  const { push } = useRouter()
  const currentAccountInfo = {} as any
  const { debouncedSearchParam } = useVaultListContext()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: TABLE_COMMON_PAGE_SIZE,
  })

  // 当搜索参数变化时，重置分页到第一页
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [debouncedSearchParam])

  const { getVaultListApiOptions } = useGetVaultListApiOptions({
    current: pagination.pageIndex + 1,
    size: pagination.pageSize,
    searchParam: debouncedSearchParam,
    myTradeAccountId: currentAccountInfo.id,
  })

  const { data: pageData, isLoading } = useQuery(getVaultListApiOptions)
  console.log(pageData)

  const data = pageData?.records || []
  const table = useReactTable({
    data,
    columns: vaultListTableColumns,
    pageCount: pageData?.pages,
    rowCount: pageData?.records?.length,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    state: {
      pagination,
    },
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
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="cursor-pointer hover:bg-[#ccc]/5"
                onClick={() => {
                  push(`/vaults/${row.original.id}`)
                }}
              >
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
