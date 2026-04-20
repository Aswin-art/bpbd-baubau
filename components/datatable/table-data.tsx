"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search, Loader2 } from "lucide-react";
import { useQueryState, parseAsInteger } from "nuqs";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect, useState } from "react";
import { DataTableViewOptions } from "./table-view-options";
import { PaginationControl } from "@/components/pagination-control";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Server- or parent-controlled pagination (must match URL / fetch in parent). */
  page: number;
  limit: number;
  onPageChange: (page: number) => void | Promise<unknown>;
  onLimitChange: (limit: number) => void | Promise<unknown>;
  searchKey?: string;
  pageCount?: number;
  rowCount?: number;
  isLoading?: boolean;
  withSearch?: boolean;
  withPagination?: boolean;
  filter?: React.ReactNode;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (value: any) => void;
  withViewOptions?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  page,
  limit,
  onPageChange,
  onLimitChange,
  searchKey = "name",
  pageCount = 1,
  isLoading = false,
  withSearch = true,
  withPagination = true,
  filter,
  rowSelection,
  onRowSelectionChange,
  withViewOptions = false,
}: DataTableProps<TData, TValue>) {
  const [searchQuery, setSearchQuery] = useQueryState("q", {
    defaultValue: "",
  });

  // Local state for immediate input feedback
  const [inputValue, setInputValue] = useState(searchQuery);
  const debouncedInputValue = useDebounce(inputValue, 500);

  // Sync debounced value to URL
  useEffect(() => {
    setSearchQuery(debouncedInputValue || null);
    if (debouncedInputValue !== searchQuery) {
      void Promise.resolve(onPageChange(1));
    }
  }, [debouncedInputValue, setSearchQuery, onPageChange, searchQuery]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [localRowSelection, setLocalRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: rowSelection ?? localRowSelection,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    manualPagination: true,
    manualFiltering: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: onRowSelectionChange ?? setLocalRowSelection,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex: page - 1,
          pageSize: limit,
        });
        void Promise.resolve(onPageChange(newState.pageIndex + 1));
        void Promise.resolve(onLimitChange(newState.pageSize));
      } else {
        void Promise.resolve(onPageChange(updater.pageIndex + 1));
        void Promise.resolve(onLimitChange(updater.pageSize));
      }
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          {withSearch && (
            <div className="relative w-full lg:w-auto">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Cari ${searchKey}...`}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                className="pl-8 w-full lg:w-96"
              />
            </div>
          )}
          {filter}
        </div>
        <div className="flex items-center gap-2">
          {withViewOptions && <DataTableViewOptions table={table} />}
          {withPagination && (
            <div className="flex items-center gap-2">
              <p className="hidden text-sm font-medium lg:block">
                Baris per halaman
              </p>
              <Select
                value={`${limit}`}
                onValueChange={(value) => {
                  const next = Number(value);
                  void Promise.resolve(onLimitChange(next));
                  void Promise.resolve(onPageChange(1));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={limit} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
      <Card className="rounded-md border bg-card relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      {withPagination && (
        <PaginationControl
          currentPage={page}
          totalPages={pageCount}
          onPageChange={(p) => void Promise.resolve(onPageChange(p))}
          showSelectionInfo
          selectionInfo={{
            selectedCount: table.getFilteredSelectedRowModel().rows.length,
            totalCount: table.getFilteredRowModel().rows.length,
          }}
        />
      )}
    </div>
  );
}
