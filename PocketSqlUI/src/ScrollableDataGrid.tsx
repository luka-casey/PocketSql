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
        rows={rows}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pagination
        getRowId={getRowId}
        getRowHeight={() => rowHeight}
        sx={{
          fontFamily: 'Consolas, "Courier New", monospace',
          fontSize: 12,
          "--MuiDataGrid-rowHeight": `${rowHeight}px`,
          "& .MuiDataGrid-cell": {
            padding: "0 6px",
            lineHeight: "20px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          },
          "& .MuiDataGrid-cellContent": {
            paddingTop: 0,
            paddingBottom: 0,
            lineHeight: "20px",
            minHeight: 0,
          },
          "& .MuiDataGrid-columnHeaders": {
            fontSize: 12,
            minHeight: rowHeight,
            maxHeight: rowHeight,
            lineHeight: 1.1,
            padding: 0,
          },
          "& .MuiDataGrid-columnHeader": {
            padding: "0 6px",
          },
        }}
      />
    </div>
  );
}
