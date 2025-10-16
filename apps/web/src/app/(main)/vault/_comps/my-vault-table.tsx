import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PoolManageWrapper, useGetPoolPageListApiOptions } from '@/services/api/trade-core/hooks/follow-manage/pool-list'
import { cn } from '@/utils/cn'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef, flexRender, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'

export const vaultTablecolumns: ColumnDef<PoolManageWrapper>[] = [
  {
    accessorKey: 'id',
    header: () => <div className="text-main-h5 text-gray">#</div>
  },
  {
    accessorKey: 'name',
    header: () => '金库',
    cell: ({ row }) => {
      // return <PairNameCell row={row} />
      return <div>金库</div>
    }
  },
  {
    accessorKey: '创建者',
    header: () => '创建者',
    cell: ({ row }) => {
      return <div className={cn('text-main-paragraph text-black')}>{/* {row.original.volume24H} */}-</div>
    }
  },
  {
    accessorKey: '年利率',
    header: () => '年利率',
    cell: ({ row }) => {
      return <div className={cn('text-main-paragraph text-black')}>{/* {row.original.volume7D} */}-</div>
    }
  },
  {
    accessorKey: 'tvl',
    header: () => 'TVL(总锁定价值)',
    cell: ({ row }) => {
      return <div className={cn('text-main-paragraph text-black')}>{/* {row.original.fee24H} */}-</div>
    }
  },

  {
    accessorKey: 'balance',
    header: () => '您的存款',
    cell: ({ row }) => {
      return <div className="text-main-paragraph text-black">{/* {row.original.liquidity} */}-</div>
    }
  },
  {
    accessorKey: 'day',
    header: () => '时间(天)',
    cell: ({ row }) => {
      return <div className="text-main-paragraph text-black">{/* {row.original.feeApy} */}</div>
    }
  },

  {
    accessorKey: 'Snapshot',
    header: () => '快照',
    cell: ({ row }) => {
      return <div className="text-main-paragraph text-black">{/* {row.original.feeApy} */}-</div>
    }
  }
]

const TABLE_COMMON_PAGE_SIZE = 10

export function MyVaultTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: TABLE_COMMON_PAGE_SIZE
  })

  const { getPoolPageListApiOptions } = useGetPoolPageListApiOptions({
    current: pagination.pageIndex,
    size: pagination.pageSize
  })

  const { data: pageData } = useQuery(getPoolPageListApiOptions)
  console.log(pageData)

  // const pageData = {
  //   records: payments,
  //   total: 100,
  //   size: 10,
  //   current: pagination.pageIndex,
  //   pages: 10
  // }
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
            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
  )
}
