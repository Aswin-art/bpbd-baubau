"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface PaginationControlProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Maximum visible page numbers before showing ellipsis (default: 5) */
  maxVisiblePages?: number;
  /** Optional className for the pagination container */
  className?: string;
  /** Optional selection info to display (e.g., for data tables) */
  selectionInfo?: {
    selectedCount: number;
    totalCount: number;
  };
  /** Show selection info text (default: false) */
  showSelectionInfo?: boolean;
}

/**
 * Unified Pagination Component
 *
 * A flexible pagination component that can be used across the application.
 * Supports smart ellipsis truncation for large page counts and optional
 * row selection info for data tables.
 *
 * @example
 * // Basic usage
 * <PaginationControl
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={(page) => setPage(page)}
 * />
 *
 * @example
 * // With selection info (for data tables)
 * <PaginationControl
 *   currentPage={page}
 *   totalPages={pageCount}
 *   onPageChange={setPage}
 *   showSelectionInfo
 *   selectionInfo={{
 *     selectedCount: selectedRows.length,
 *     totalCount: totalRows
 *   }}
 * />
 */
export function PaginationControl({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  className,
  selectionInfo,
  showSelectionInfo = false,
}: PaginationControlProps) {
  /**
   * Generates page numbers with smart ellipsis placement
   * Returns an array of page numbers or "..." for ellipsis
   */
  const renderPaginationItems = () => {
    const siblingCount = 1;
    const totalPageNumbers = siblingCount + 5;

    // Helper to generate range
    const range = (start: number, end: number) => {
      let length = end - start + 1;
      return Array.from({ length }, (_, idx) => idx + start);
    };

    // Case 1: Total pages is less than page numbers we want to show
    if (totalPages <= totalPageNumbers) {
      const items = range(1, totalPages);
      return items.map((item) => renderPageLink(item));
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    let items: (number | "...")[] = [];

    // Case 2: No left dots, right dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      items = [...leftRange, "...", totalPages];
    }
    // Case 3: Left dots, no right dots
    else if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      items = [firstPageIndex, "...", ...rightRange];
    }
    // Case 4: Dots on both sides
    else {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      items = [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
    }

    return items.map((item, index) => {
      if (item === "...") {
        return (
          <PaginationItem key={`ellipsis-${index}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      return renderPageLink(item as number);
    });
  };

  const renderPageLink = (item: number) => (
    <PaginationItem key={item}>
      <PaginationLink
        href="#"
        isActive={currentPage === item}
        onClick={(e) => {
          e.preventDefault();
          onPageChange(item);
        }}
        className={cn(
          "cursor-pointer transition-colors duration-200",
          currentPage === item
            ? "border-primary text-primary hover:bg-transparent hover:text-primary"
            : "hover:bg-transparent hover:text-primary",
        )}
      >
        {item}
      </PaginationLink>
    </PaginationItem>
  );

  return (
    <div
      className={cn(
        "flex items-center",
        showSelectionInfo ? "justify-between" : "justify-end",
        className,
      )}
    >
      {/* Selection Info (optional) */}
      {showSelectionInfo && selectionInfo && (
        <div className="flex-1 text-sm text-muted-foreground">
          {selectionInfo.selectedCount} of {selectionInfo.totalCount} row(s)
          selected.
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination className="justify-end w-auto mx-0">
        <PaginationContent>
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={cn(
                "transition-opacity duration-200",
                currentPage <= 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer hover:bg-transparent hover:text-primary",
              )}
            />
          </PaginationItem>

          {/* Page Numbers */}
          {renderPaginationItems()}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              className={cn(
                "transition-opacity duration-200",
                currentPage >= totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer hover:bg-transparent hover:text-primary",
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
