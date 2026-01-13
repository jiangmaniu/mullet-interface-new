import { ColumnDef, flexRender, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'

import { CommonTableBody } from '@/components/table/common-table'
import {
  PoolManageWrapper,
  useGetPoolPageListApiOptions,
} from '@/services/api/trade-core/hooks/follow-manage/pool-list'
import { cn } from '@mullet/ui/lib/utils'
import { Table, TableCell, TableHead, TableHeader, TableRow } from '@mullet/ui/table'
import { formatAddress } from '@mullet/utils/format'

export const vaultWithdrawalTablecolumns: ColumnDef<PoolManageWrapper>[] = [
  {
    accessorKey: 'name',
    header: () => '金库',
    cell: ({ row }) => {
      return <div>{row.original.followPoolName}</div>
    },
  },
  {
    accessorKey: '订单ID',
    header: () => '订单ID',
    cell: ({ row }) => {
      return <div className={cn('')}>{formatAddress(row.original.pdaAddress) || '-'}</div>
    },
  },
  {
    accessorKey: '年利率',
    header: () => '数量(USDC)',
    cell: ({ row }) => {
      return <div className={cn('')}> {row.original.apr}</div>
    },
  },
  {
    accessorKey: 'tvl',
    header: () => '类型',
    cell: ({ row }) => {
      return <div className={cn('')}>{row.original.totalPurchaseMoney}</div>
    },
  },

  {
    accessorKey: 'balance',
    header: () => '状态',
    cell: ({ row }) => {
      return <div className="">{/* {row.original.liquidity} */}-</div>
    },
  },

  {
    accessorKey: 'time',
    header: () => '到账时间',
    cell: ({ row }) => {
      return <div className="">{/* {row.original.liquidity} */}-</div>
    },
  },

  {
    accessorKey: 'day',
    header: () => '存款时间',
    cell: ({ row }) => {
      return <div className="">{/* {row.original.feeApy} */}</div>
    },
  },
]

export const VaultWithdrawalRecords = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { getPoolPageListApiOptions } = useGetPoolPageListApiOptions({
    current: pagination.pageIndex + 1,
    size: pagination.pageSize,
  })

  // const { data: pageData } = useQuery(getPoolPageListApiOptions)

  // const data = pageData?.records || []
  const data = []
  const table = useReactTable({
    data,
    columns: vaultWithdrawalTablecolumns,
    // pageCount: pageData?.pages,
    // rowCount: pageData?.records?.length,
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
        <CommonTableBody table={table}>
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

      {/* <TablePagination className="py-4" table={table} pageData={pageData} /> */}
    </div>
  )
}
