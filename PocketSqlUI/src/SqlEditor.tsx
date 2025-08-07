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

  const databases = ["HR", "Production", "Sales", "Stats"];
  const [selectedDb, setSelectedDb] = useState(databases[0]);
  const selectedDbRef = useRef(databases[0]); // ✅ hold latest DB value for closures

  const [columns, setColumns] = useState<TableColumn<any>[]>([]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newDb = event.target.value;
    setSelectedDb(newDb);
    selectedDbRef.current = newDb; // ✅ update ref
  };

  useEffect(() => {
    fetchSchema(selectedDb)
      .then((data) => {
        setSchema(data);
        schemaRef.current = data;
      })
      .catch((error) => console.error("Error fetching schema:", error));

    selectedDbRef.current = selectedDb; // ✅ ensure it's always current
  }, [selectedDb]);

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

    console.log("Running query with selectedDb =", selectedDbRef.current); // ✅ always correct

    try {
      const data = await executeQuery({
        Sql: currentSql,
        DatabaseName: selectedDbRef.current,
      });

      const freshRows = Array.isArray(data) ? data.map((row: any) => ({ ...row })) : [];
      setResults(freshRows);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    editor.focus();

    if (!monacoInstance) return;

    try {
      monacoInstance.languages.register({ id: "sql" });
    } catch {}

    monacoInstance.languages.registerCompletionItemProvider("sql", {
      triggerCharacters: [" ", "."],
      provideCompletionItems: (model, position) => {
        const suggestions: monaco.languages.CompletionItem[] = [];

        if (!schemaRef.current || schemaRef.current.length === 0) {
          return { suggestions: [] };
        }

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
            documentation: `Table: ${table.table}`,
            range,
          });

          table.columns.forEach((col) => {
            suggestions.push({
              label: `${table.table}.${col.columnName}`,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: col.columnName,
              detail: `${col.dataType} (Column of ${table.table})`,
              documentation: `Column: ${col.columnName} (${col.dataType})`,
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
        handleRunClick(); // ✅ will always use latest selectedDbRef
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
      {/* LEFT COLUMN */}
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
        <label htmlFor="db-select" style={{ color: "white", marginBottom: 4 }}>
          Database
        </label>
        <select
          id="db-select"
          value={selectedDb}
          onChange={handleChange}
          style={{
            backgroundColor: "black",
            color: "white",
            padding: "6px 8px",
            borderRadius: 4,
            border: "1px solid white",
            width: "100%",
            marginBottom: 12,
          }}
        >
          {databases.map((db) => (
            <option key={db} value={db}>
              {db}
            </option>
          ))}
        </select>

        <Paper elevation={3} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Editor
            value={sqlValue}
            onChange={(value) => setSqlValue(value ?? "")}
            language="sql"
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

        <Typography
          variant="body2"
          color="grey.400"
          sx={{ mt: 1, userSelect: "none", fontStyle: "italic" }}
        >
          Use <code>Shift+Enter</code> to run the query. Use <code>Shift+Tab</code>{" "}
          to switch focus between editor and results.
        </Typography>

        <button
          onClick={handleRunClick}
          disabled={loading}
          style={{
            marginTop: 12,
            padding: "8px 16px",
            borderRadius: 4,
            border: "none",
            backgroundColor: "#1976d2",
            color: "white",
            cursor: "pointer",
            alignSelf: "flex-start",
            opacity: loading ? 0.6 : 1,
            pointerEvents: loading ? "none" : "auto",
          }}
        >
          {loading ? "Running..." : "Run Query"}
        </button>
      </Box>

      {/* RIGHT COLUMN */}
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
            <Typography variant="body1" sx={{ color: "#ccc" }}>
              No results yet. Run a query!
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
