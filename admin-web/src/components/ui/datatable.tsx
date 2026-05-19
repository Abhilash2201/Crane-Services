import { DataTable as PrDataTable } from "primereact/datatable";
import type { DataTableRowClickEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import type { ColumnBodyOptions } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Skeleton } from "primereact/skeleton";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import styled from "styled-components";

export interface ColumnDef<T = any> {
  field: string;
  header: string;
  body?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

interface AppDataTableProps<T = any> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Fields used for built-in search. Defaults to all column fields. */
  searchFields?: string[];
  /** Page-specific filter controls rendered beside the search bar */
  filters?: ReactNode;
  /** Right-side toolbar slot (export button, add button, etc.) */
  actions?: ReactNode;
  emptyMessage?: string;
  paginate?: boolean;
  pageSize?: number;
  dataKey?: string;
}

const Toolbar = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  padding-bottom: 12px;
`;

const SearchWrap = styled.span`
  flex: 1;
  min-width: 180px;
  max-width: 300px;
  display: flex;
  align-items: center;
  position: relative;

  .pi-search {
    position: absolute;
    left: 10px;
    font-size: 13px;
    color: #94a3b8;
    pointer-events: none;
  }

  .p-inputtext {
    padding-left: 2.2rem !important;
    min-height: 40px;
    border-radius: 10px;
    width: 100%;
  }
`;

// Varying widths create a natural-looking skeleton (avoids uniform blocks)
const SK_WIDTHS = [72, 58, 85, 63, 78, 50, 90, 66];

const SKELETON_ROW_COUNT = 7;

export function AppDataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  onRowClick,
  searchable = true,
  searchPlaceholder = "Search...",
  searchFields,
  filters: filtersSlot,
  actions,
  emptyMessage = "No records found.",
  paginate = true,
  pageSize = 10,
  dataKey = "id",
}: AppDataTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState("");

  const filterFields = searchFields ?? columns.map((c) => c.field);

  // Skeleton placeholder rows — have just enough structure to satisfy dataKey
  const skeletonRows = useMemo(
    () =>
      Array.from({ length: SKELETON_ROW_COUNT }, (_, i) => ({
        [dataKey]: `__sk_${i}`,
      })) as T[],
    [dataKey],
  );

  // During loading: swap in skeleton body renderers and disable sort
  const resolvedColumns = useMemo(
    () =>
      columns.map((col, colIdx) => ({
        ...col,
        sortable: loading ? false : (col.sortable ?? false),
        body: loading
          ? (_row: T, opts: ColumnBodyOptions) => (
              <Skeleton
                height="0.85rem"
                width={`${SK_WIDTHS[(colIdx + opts.rowIndex * 2) % SK_WIDTHS.length]}%`}
                borderRadius="6px"
              />
            )
          : col.body,
      })),
    [columns, loading],
  );

  const displayData = loading ? skeletonRows : data;

  const header = (
    <Toolbar>
      {searchable && (
        <SearchWrap className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => !loading && setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            disabled={loading}
            style={{ opacity: loading ? 0.5 : 1 }}
          />
        </SearchWrap>
      )}
      {filtersSlot}
      {actions ? <div style={{ marginLeft: "auto" }}>{actions}</div> : null}
    </Toolbar>
  );

  return (
    <PrDataTable
      value={displayData}
      dataKey={dataKey}
      globalFilter={!loading ? (globalFilter || undefined) : undefined}
      globalFilterFields={filterFields}
      emptyMessage={emptyMessage}
      paginator={paginate && !loading}
      rows={pageSize}
      rowsPerPageOptions={[10, 25, 50]}
      sortMode="multiple"
      removableSort
      onRowClick={
        onRowClick && !loading
          ? (e: DataTableRowClickEvent) => onRowClick(e.data as T)
          : undefined
      }
      rowHover={Boolean(onRowClick) && !loading}
      header={header}
      size="small"
      stripedRows
    >
      {resolvedColumns.map((col) => (
        <Column
          key={col.field}
          field={col.field}
          header={col.header}
          body={col.body as any}
          sortable={col.sortable}
          style={{ width: col.width, textAlign: col.align ?? "left" }}
          headerStyle={{ textAlign: col.align ?? "left" }}
        />
      ))}
    </PrDataTable>
  );
}
