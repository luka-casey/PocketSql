import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Box, Paper, Typography } from "@mui/material";
import type { TableColumn } from "react-data-table-component";
import { fetchSchema, executeQuery } from "../Clients";
import type { TableSchema, ColumnInfo, SqlQueryRequest, ExecuteQueryErrorResponse } from "../Interfaces";
import { SqlResults } from "./SqlResults";
import { DatabaseDropdown } from "./DatabaseDropdown";

export function SqlEditor() {
  const schemaRef = useRef<TableSchema[]>([]);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const dataTableRef = useRef<HTMLDivElement | null>(null);

  const [sqlValue, setSqlValue] = useState<string>("SELECT * FROM ");
  const [results, setResults] = useState<Record<string, any>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [databases, setDatabases] = useState<string[]>([]);
  const [selectedDb, setSelectedDb] = useState<string>("");
  const selectedDbRef = useRef<string>("");
  const [columns, setColumns] = useState<TableColumn<Record<string, any>>[]>([]);

  useEffect(() => {
    selectedDbRef.current = selectedDb;
    if (selectedDb) loadSchema(selectedDb);
    else schemaRef.current = [];
  }, [selectedDb]);

  const loadSchema = async (dbName: string) => {
    try {
      const data = await fetchSchema(dbName);
      schemaRef.current = data ?? [];
    } catch (err) {
      console.error("fetchSchema failed", err);
      schemaRef.current = [];
    }
  };

  useEffect(() => {
    if (results.length > 0) {
      const dynamic: TableColumn<Record<string, any>>[] = Object.keys(results[0]).map((k) => ({
        name: k,
        selector: (r: Record<string, any>) => r[k],
        sortable: true,
        wrap: true,
      }));
      setColumns(dynamic);
    } else {
      setColumns([]);
    }
  }, [results]);

  const handleRunClick = async () => {
    if (!editorRef.current) return;
    const currentSql = editorRef.current.getValue();
    setSqlValue(currentSql);
    setError(null);

    if (!selectedDbRef.current) {
      setError("Please select a database before running the query.");
      return;
    }

    const request: SqlQueryRequest = { Sql: currentSql, DatabaseName: selectedDbRef.current };
    console.log("Executing SQL request payload:", request);

    try {
      const data = await executeQuery(request);
      const freshRows = Array.isArray(data) ? data.map((r: Record<string, any>) => ({ ...r })) : [];
      setResults(freshRows);
    } catch (err: any) {
      console.error("executeQuery error:", err);
      if (err && typeof err === "object" && "error" in err) setError((err as ExecuteQueryErrorResponse).error);
      else setError(err?.message ?? "Unknown error");
    }
  };

  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    editor.focus();

    try { monacoInstance.languages.register({ id: "sql" }); } catch {}

    monacoInstance.languages.registerCompletionItemProvider("sql", {
      triggerCharacters: [" ", "."],
      provideCompletionItems: (model, position) => {
        if (!schemaRef.current.length) return { suggestions: [] };
        const word = model.getWordUntilPosition(position);
        const range: monaco.IRange = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const suggestions: monaco.languages.CompletionItem[] = [];
        schemaRef.current.forEach((table) => {
          suggestions.push({
            label: table.table,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: table.table,
            detail: "Table",
            documentation: `Table: ${table.table}`,
            range,
          });
          table.columns.forEach((col: ColumnInfo) => {
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

    // Shift + Enter => run query
    editor.addCommand(monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.Enter, () => {
      handleRunClick();
    });

    // Shift + Tab => move focus to results container
    editor.addCommand(monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.Tab, () => {
      try { editor.blur(); } catch {}
      // small timeout to let blur settle in some browsers
      setTimeout(() => dataTableRef.current?.focus(), 0);
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "row", height: "100vh", bgcolor: "#121212", color: "white" }}>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2, gap: 1, overflow: "hidden" }}>
        <DatabaseDropdown
          selectedDb={selectedDb}
          handleChange={(e) => setSelectedDb(e.target.value)}
          databases={databases}
          setDatabases={setDatabases}
          setSelectedDb={setSelectedDb}
        />

        <Paper elevation={3} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Editor
            value={sqlValue}
            onChange={(val) => setSqlValue(val ?? "")}
            language="sql"
            theme="vs-dark"
            onMount={handleEditorMount}
            height="100%"
            options={{ wordWrap: "on", minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 14 }}
          />
        </Paper>

        <Typography variant="body2" color="grey.400" sx={{ mt: 1, userSelect: "none", fontStyle: "italic" }}>
          Use <code>Shift+Enter</code> to run the query. Use <code>Shift+Tab</code> to switch focus between editor and results.
        </Typography>
      </Box>

      <SqlResults
        columns={columns}
        error={error}
        editorRef={editorRef}
        results={results}
        dataTableRef={dataTableRef} // <-- pass the ref so editor can focus it
      />
    </Box>
  );
}

export default SqlEditor;
