import * as monaco from "monaco-editor";
import { Box, Paper, Typography } from "@mui/material";
import DataTable, { type TableColumn } from "react-data-table-component";

interface SqlResultsProps {
  columns: TableColumn<Record<string, any>>[];     
  error: string | null;                            
  editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor | null>;  
  results: Record<string, any>[];                  
}

export function SqlResults(props: SqlResultsProps) {
  return (
      <Box
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.shiftKey && e.key === "Tab") {
            e.preventDefault();
            props.editorRef.current?.focus();
          }
        }}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: 2,
          gap: 2,
          overflow: "hidden",
          outline: "none",
        }}
      >
        {props.error && (
          <Typography color="error" variant="body2">
            Error: {props.error}
          </Typography>
        )}

        {props.results.length > 0 ? (
          <Paper
            elevation={3}
            sx={{
              flex: 1,
              overflowY: "auto",
              maxHeight: "calc(100vh - 100px)",
            }}
          >
            <DataTable columns={props.columns} data={props.results} responsive striped dense />
          </Paper>
        ) : (
          <Paper
            elevation={3}
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              opacity: 0.6,
            }}
          >
            <Typography variant="body1" sx={{ color: "#ccc" }}>
              No results yet. Run a query!
            </Typography>
          </Paper>
        )}
      </Box>
  );
}
