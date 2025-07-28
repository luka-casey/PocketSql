import { type GridRowsProp, type GridColDef, type GridPaginationModel, DataGrid } from "@mui/x-data-grid";
import { useRef } from "react";
import { type KeyboardEvent } from "react";

interface ScrollableDataGridProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  getRowId?: (row: any) => string | number;
  rowHeight?: number;
}

export function ScrollableDataGrid({
  rows,
  columns,
  paginationModel,
  onPaginationModelChange,
  getRowId,
  rowHeight = 24,
}: ScrollableDataGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

   console.log("ScrollableDataGrid rows INSIDE:", rows); // <-- Add this line

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const scrollAmount = 40;

    if (event.key === "ArrowRight") {
      containerRef.current.scrollLeft += scrollAmount;
      event.preventDefault();
    } else if (event.key === "ArrowLeft") {
      containerRef.current.scrollLeft -= scrollAmount;
      event.preventDefault();
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ overflowX: "auto", outline: "none" }}
    >
      <DataGrid
  key={JSON.stringify(rows)}   // force remount when rows change
  rows={[...rows]}             // new reference each time
  columns={columns}
  paginationModel={paginationModel}
  onPaginationModelChange={onPaginationModelChange}
  pagination
  getRowId={getRowId}
  getRowHeight={() => rowHeight}
/>


    </div>
  );
}
