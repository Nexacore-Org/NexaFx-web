import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages || totalPages === 0;

  const buttonBaseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-neutral-100 hover:text-neutral-900 h-10 px-4 py-2";
  const iconButtonClasses = "h-10 w-10 p-0";

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex w-full items-center justify-center space-x-6 sm:justify-end">
        <div className="flex items-center justify-center text-sm font-medium">
          Page {currentPage} of {Math.max(totalPages, 1)}
        </div>
        <div className="flex items-center space-x-2">
          <button
            className={cn(buttonBaseClasses, iconButtonClasses)}
            onClick={() => onPageChange(1)}
            disabled={isFirstPage}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            className={cn(buttonBaseClasses, iconButtonClasses)}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={isFirstPage}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className={cn(buttonBaseClasses, iconButtonClasses)}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isLastPage}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            className={cn(buttonBaseClasses, iconButtonClasses)}
            onClick={() => onPageChange(totalPages)}
            disabled={isLastPage}
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
