import { TablePagination } from '@/components/table/table-pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PoolManageWrapper, useGetPoolPageListApiOptions } from '@/services/api/trade-core/hooks/follow-manage/pool-list'
import { cn } from '@/utils/cn'
import { push } from '@/utils/navigator'
import { formatAddress } from '@/utils/web3'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef, flexRender, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'

export const vaultTablecolumns: ColumnDef<PoolManageWrapper>[] = [
  {
    accessorKey: 'name',
    header: () => '金库',
    cell: ({ row }) => {
      return <div>{row.original.followPoolName}</div>
    }
  },
  {
    accessorKey: '创建者',
    header: () => '创建者',
    cell: ({ row }) => {
      return <div className={cn('')}>{formatAddress(row.original.pdaAddress) || '-'}</div>
    }
  },
  {
    accessorKey: '年利率',
    header: () => '年利率',
    cell: ({ row }) => {
      return <div className={cn('')}> {row.original.apr}</div>
    }
  },
  {
    accessorKey: 'tvl',
    header: () => 'TVL(总锁定价值)',
    cell: ({ row }) => {
      return <div className={cn('')}>{row.original.totalPurchaseMoney}</div>
    }
  },

  {
    accessorKey: 'balance',
    header: () => '您的存款',
    cell: ({ row }) => {
      return <div className="">{/* {row.original.liquidity} */}-</div>
    }
  },
  {
    accessorKey: 'day',
    header: () => '时间(天)',
    cell: ({ row }) => {
      return <div className="">{/* {row.original.feeApy} */}</div>
    }
  },

  {
    accessorKey: 'Snapshot',
    header: () => '快照',
    cell: ({ row }) => {
      return <div className="">{/* {row.original.feeApy} */}-</div>
    }
  }
]

const TABLE_COMMON_PAGE_SIZE = 10

export function PopularVaultTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: TABLE_COMMON_PAGE_SIZE
  })

  const { getPoolPageListApiOptions } = useGetPoolPageListApiOptions({
    current: pagination.pageIndex + 1,
    size: pagination.pageSize
  })

  const { data: pageData } = useQuery(getPoolPageListApiOptions)
  console.log(pageData)

  const data = pageData?.records || []
  const table = useReactTable({
    data,
    columns: vaultTablecolumns,
    pageCount: pageData?.pages,
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
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="cursor-pointer hover:bg-[#ccc]/5"
                onClick={() => {
                  push(`/vault/${row.original.id}`)
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={vaultTablecolumns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination className="py-4" table={table} pageData={pageData} />
    </div>
  )
}
