import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import type { TableSchema } from "./Interfaces";
import { fetchSchema, executeQuery } from "./Clients";
import { type GridPaginationModel } from "@mui/x-data-grid";
import { Box, Button, Paper, Typography } from "@mui/material";
import { ScrollableDataGrid } from "./ScrollableDataGrid";


export function SqlEditor() {
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const schemaRef = useRef<TableSchema[]>([]);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [sqlValue, setSqlValue] = useState("SELECT * FROM ");
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


// inside your component:

const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
  page: 0,
  pageSize: 5,
});

  useEffect(() => {
    fetchSchema()
      .then((data) => {
        setSchema(data);
        schemaRef.current = data;
      })
      .catch((error) => {
        console.error("Error fetching schema:", error);
      });
  }, []);

  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    if (!monacoInstance) return;

    try {
      monacoInstance.languages.register({ id: "sql" });
    } catch {}

    monacoInstance.languages.registerCompletionItemProvider("sql", {
      triggerCharacters: [" ", "."],
      provideCompletionItems: (model, position) => {
        const suggestions: monaco.languages.CompletionItem[] = [];
        const word = model.getWordUntilPosition(position);
        const range: monaco.IRange = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        schemaRef.current.forEach((table) => {
          suggestions.push({
            label: table.table,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: table.table,
            detail: "Table",
            range,
          });

          table.columns.forEach((col) => {
            suggestions.push({
              label: `${table.table}.${col.columnName}`,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: col.columnName,
              detail: `${col.dataType} (Column of ${table.table})`,
              range,
            });
          });
        });

        return { suggestions };
      },
    });
  };

  const handleRunClick = async () => {
    if (!editorRef.current) return;

    const currentSql = editorRef.current.getValue();
    setSqlValue(currentSql);
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const data = await executeQuery({ Sql: currentSql });
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Prepare columns dynamically from the first result object keys
  const columns: GridColDef[] = results.length > 0
    ? Object.keys(results[0]).map((key) => ({
        field: key,
        headerName: key,
        width: 150,
      }))
    : [];


return (
  <Box
    sx={{
      display: "flex",
      flexDirection: "row",
      height: "100vh",       // FULL height of the page
      bgcolor: "#121212",
      color: "white",
    }}
  >
    {/* LEFT COLUMN - SQL Editor */}
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        p: 2,
        gap: 2,
        overflow: "hidden"
      }}
    >
      <Paper elevation={3} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" sx={{ p: 1 }}>SQL Query Editor</Typography>
        <Editor
          defaultLanguage="sql"
          defaultValue={sqlValue}
          theme="vs-dark"
          onMount={handleEditorMount}
          height="100%"      // fill available space
          options={{ fontSize: 20 }}  // set font size in pixels here
        />
      </Paper>

      {/* Run Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleRunClick}
        disabled={loading}
        sx={{ alignSelf: "flex-start" }}
      >
        {loading ? "Running..." : "Run Query"}
      </Button>
    </Box>

    {/* RIGHT COLUMN - Results */}
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        p: 2,
        gap: 2,
        overflow: "hidden"
      }}
    >
      {error && (
        <Typography color="error" variant="body2">
          Error: {error}
        </Typography>
      )}

      {results.length > 0 ? (
        <Paper elevation={3} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Typography variant="h6" sx={{ p: 1 }}>Query Results</Typography>
          <Box sx={{ flex: 1 }}>
            <ScrollableDataGrid 
            rows={results}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            getRowId={(row) => row.Id ?? JSON.stringify(row)}
            
            />

          </Box>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", opacity: 0.6 }}>
          <Typography variant="body1">No results yet. Run a query!</Typography>
        </Paper>
      )}
    </Box>
  </Box>
);

}
