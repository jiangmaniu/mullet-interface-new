import * as React from 'react'
import type { Row, Table as TableType } from '@tanstack/react-table'

import EmptyResultFallbackSvg from '@/assets/icons/fallback/empty-result-fallback.svg'
import { cn } from '@mullet/ui/lib/utils'
import { Spinner } from '@mullet/ui/spinner'
import * as Table from '@mullet/ui/table'

type TableBodyProps<TData> = Omit<React.ComponentPropsWithoutRef<typeof Table.TableBody>, 'children'> & {
  loadingFallback?: () => React.ReactNode
  emptyResultFallback?: () => React.ReactNode
  emptyResultDescription?: React.ReactNode
  loading?: boolean
  children?: (row: Row<TData>) => React.ReactNode
  table: TableType<TData>
  getRowKey?: (row: Row<TData>) => React.Key | null | undefined
}

export const CommonTableBody = <TData,>({
  table,
  loadingFallback,
  loading,
  emptyResultFallback,
  emptyResultDescription = 'No results.',
  children,
  getRowKey,
  className,
  ...props
}: TableBodyProps<TData>) => {
  const rows = table.getRowModel().rows

  const LoadingContent =
    loadingFallback ??
    (() => {
      return (
        <tr className="h-full">
          <td colSpan={table.getAllColumns().length}>
            <div
              className={cn(
                'gap-medium bg-base-white p-medium py-large inset-0 z-10 flex h-full w-full flex-col text-center',
                {
                  absolute: table.getRowModel().rows.length,
                },
              )}
            >
              {/* <Skeleton className="h-4 w-1/2 shrink-0" />
                  <Skeleton className="h-4 shrink-0" />
                  <Skeleton className="h-4 w-3/4 shrink-0" />
                  <Skeleton className="h-4 shrink-0" /> */}

              <Spinner className="size-6 animate-spin" />
            </div>
          </td>
        </tr>
      )
    })

  const EmptyResultContent =
    emptyResultFallback ??
    (() => {
      return (
        <tr className="">
          <td colSpan={table.getAllColumns().length}>
            <div className="flex h-full min-h-20 flex-col items-center justify-center py-10 text-center">
              <div className="relative">
                <EmptyResultFallbackSvg alt="empty-result" />
              </div>

              {emptyResultDescription && (
                <div className="mt-4 text-[12px] text-[#767783]">{emptyResultDescription}</div>
              )}
            </div>
          </td>
        </tr>
      )
    })

  return (
    <Table.TableBody className={cn('relative', className)} {...props}>
      {rows?.length ? (
        <>
          {rows?.map((row, index) => {
            const key = getRowKey?.(row) ?? row.id ?? index
            return <React.Fragment key={key}>{children?.(row)}</React.Fragment>
          })}
        </>
      ) : !loading ? (
        <EmptyResultContent />
      ) : null}

      {loading && <LoadingContent />}
    </Table.TableBody>
  )
}
