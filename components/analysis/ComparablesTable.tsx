'use client'

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

interface Comparable {
  ba_reference: string
  full_address: string
  postcode: string
  rateable_value: number | null
  total_area: number | null
  rv_per_m2: number | null
  primary_description_code: string
}

interface Props {
  comparables: Comparable[]
  userRvPerM2: number
}

export function ComparablesTable({ comparables, userRvPerM2 }: Props) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<Comparable>[] = [
    {
      accessorKey: 'full_address',
      header: 'Address',
      cell: ({ getValue }) => {
        const value = getValue()
        return (
          <span className="text-sm text-gray-900">
            {value ? String(value) : 'Address not available'}
          </span>
        )
      },
    },
    {
      accessorKey: 'postcode',
      header: 'Postcode',
      cell: ({ getValue }) => {
        const value = getValue()
        return (
          <span className="font-mono text-sm text-gray-500">
            {value ? String(value) : 'N/A'}
          </span>
        )
      },
    },
    {
      accessorKey: 'rateable_value',
      header: 'RV (£)',
      cell: ({ getValue }) => {
        const value = getValue()
        const numValue = typeof value === 'number' ? value : parseFloat(String(value))
        return (
          <span className="font-mono text-sm text-right block text-gray-900">
            {isNaN(numValue) ? 'N/A' : `£${numValue.toLocaleString('en-GB')}`}
          </span>
        )
      },
    },
    {
      accessorKey: 'total_area',
      header: 'Area (m²)',
      cell: ({ getValue }) => {
        const value = getValue()
        const numValue = typeof value === 'number' ? value : parseFloat(String(value))
        return (
          <span className="font-mono text-sm text-right block text-gray-500">
            {isNaN(numValue) ? 'N/A' : numValue.toFixed(0)}
          </span>
        )
      },
    },
    {
      accessorKey: 'rv_per_m2',
      header: '£ / m²',
      cell: ({ getValue }) => {
        const value = getValue()
        const numValue = typeof value === 'number' ? value : parseFloat(String(value))
        const isHigher = !isNaN(numValue) && numValue > userRvPerM2 * 1.05
        const isLower = !isNaN(numValue) && numValue < userRvPerM2 * 0.95
        
        if (isNaN(numValue)) {
          return <span className="font-mono text-sm text-right block text-gray-400">N/A</span>
        }
        
        return (
          <span
            className={`font-mono text-sm text-right block font-medium ${
              isLower ? 'text-green-600' : isHigher ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            £{numValue.toFixed(2)}
          </span>
        )
      },
    },
  ]

  const table = useReactTable({
    data: comparables,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {table.getFlatHeaders().map((header) => {
                const sorted = header.column.getIsSorted()
                return (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer select-none whitespace-nowrap hover:text-gray-700"
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span className="text-gray-400">
                        {sorted === 'asc' ? (
                          <ChevronUp size={12} />
                        ) : sorted === 'desc' ? (
                          <ChevronDown size={12} />
                        ) : (
                          <ChevronsUpDown size={12} />
                        )}
                      </span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50 ${
                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}