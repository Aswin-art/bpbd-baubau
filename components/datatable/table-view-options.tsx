"use client";

import { Table } from "@tanstack/react-table";
import { Settings2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const columns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && column.getCanHide(),
    );

  if (columns.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="lg" className="ml-auto h-8 flex">
          <Settings2 className="mr-2 h-4 w-4" />
          Custom View
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-0">
        <div className="p-2">
          <p className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            Toggle columns
          </p>
        </div>
        <div className="border-t">
          <div className="p-1">
            {columns.map((column) => {
              const isVisible = column.getIsVisible();
              return (
                <button
                  key={column.id}
                  onClick={() => column.toggleVisibility(!isVisible)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 cursor-pointer py-1.5 text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border transition-colors",
                      isVisible
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/25",
                    )}
                  >
                    {isVisible && <Check className="h-3 w-3" />}
                  </div>
                  <span className="capitalize">{column.id}</span>
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
