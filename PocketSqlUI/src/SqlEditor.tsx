import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import type { TableSchema } from "./Interfaces";
import { fetchSchema, executeQuery } from "./Clients";
import { Box, Paper, Typography } from "@mui/material";
import DataTable, { type TableColumn } from "react-data-table-component";

export function SqlEditor() {
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const schemaRef = useRef<TableSchema[]>([]);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const dataTableRef = useRef<HTMLDivElement | null>(null);
  const [sqlValue, setSqlValue] = useState("SELECT * FROM ");
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [columns, setColumns] = useState<TableColumn<any>[]>([]);

  useEffect(() => {
    fetchSchema()
      .then((data) => {
        setSchema(data);
        schemaRef.current = data;
      })
      .catch((error) => console.error("Error fetching schema:", error));
  }, []);

  useEffect(() => {
    if (results.length > 0) {
      const dynamicColumns: TableColumn<any>[] = Object.keys(results[0]).map(
        (key) => ({
          name: key,
          selector: (row: any) => row[key],
          sortable: true,
          wrap: true,
        })
      );
      setColumns(dynamicColumns);
    } else {
      setColumns([]);
    }
  }, [results]);

  const handleRunClick = async () => {
    if (!editorRef.current) return;

    const currentSql = editorRef.current.getValue();
    setSqlValue(currentSql);
    setLoading(true);
    setError(null);

    try {
      const data = await executeQuery({ Sql: currentSql });
      console.log("SQL Results:", data);

      const freshRows = data.map((row: any) => ({ ...row }));
      setResults(freshRows);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

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

    editor.addCommand(
      monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.Enter,
      () => {
        handleRunClick();
      }
    );

    editor.onKeyDown((e) => {
      if (e.shiftKey && e.browserEvent.key === "Tab") {
        e.preventDefault();
        dataTableRef.current?.focus();
      }
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
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
          gap: 1,
          overflow: "hidden",
        }}
      >
        <Paper
          elevation={3}
          sx={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <Editor
            defaultLanguage="sql"
            defaultValue={sqlValue}
            theme="vs-dark"
            onMount={handleEditorMount}
            height="100%"
            options={{
              wordWrap: "on",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
            }}
          />
        </Paper>

        {/* Keyboard shortcut info */}
        <Typography
          variant="body2"
          color="grey.400"
          sx={{ mt: 1, userSelect: "none", fontStyle: "italic" }}
        >
          Use <code>Shift+Enter</code> to run the
          query. Use <code>Shift+Tab</code> to switch focus between editor and
          results.
        </Typography>
      </Box>

      {/* RIGHT COLUMN - Results */}
      <Box
        ref={dataTableRef}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.shiftKey && e.key === "Tab") {
            e.preventDefault();
            editorRef.current?.focus();
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
        {error && (
          <Typography color="error" variant="body2">
            Error: {error}
          </Typography>
        )}

        {results.length > 0 ? (
          <Paper elevation={3} sx={{ flex: 1 }}>
            <DataTable columns={columns} data={results} responsive striped />
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
            <Typography variant="body1">No results yet. Run a query!</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
