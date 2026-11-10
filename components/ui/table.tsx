import * as React from "react"

import { cn } from "@/lib/utils"

/*
  Data table.
  - Wide screens: a normal table with a sand header row and roomy cells.
  - Below 640px (phones, or 200% zoom): each row becomes a card and each
    cell shows its column name. Give every <TableCell> a `data-label`
    matching its column header; cells without one (e.g. "No results")
    span the full card width. Styles live in `.table-stack` in globals.css.
  - Explicit ARIA roles keep table semantics when CSS changes `display`.
  - Right-align numbers with `className="text-right tabular-nums"`.
*/

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { label?: string }
>(({ className, label, ...props }, ref) => (
  // Focusable so keyboard users can scroll it if a wide table overflows.
  <div
    tabIndex={0}
    role="region"
    aria-label={label}
    className="table-stack-wrap relative w-full overflow-x-auto rounded-lg border border-border bg-card shadow-sm"
  >
    <table
      ref={ref}
      role="table"
      className={cn("table-stack w-full caption-bottom text-base", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    role="rowgroup"
    className={cn("bg-muted [&_tr]:border-b-2 [&_tr]:border-input [&_tr]:hover:bg-transparent", className)}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    role="rowgroup"
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    role="rowgroup"
    className={cn("border-t-2 border-input bg-muted font-bold [&>tr]:last:border-b-0", className)}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    role="row"
    className={cn(
      "border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-accent",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, scope = "col", ...props }, ref) => (
  <th
    ref={ref}
    role="columnheader"
    scope={scope}
    className={cn(
      "whitespace-nowrap px-4 py-3 text-left align-bottom text-base font-bold text-foreground",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    role="cell"
    className={cn("px-4 py-4 align-middle", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("px-4 py-3 text-left text-base text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
