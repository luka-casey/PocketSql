import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import type { TableSchema, ColumnInfo, SqlQueryRequest, ExecuteQueryErrorResponse } from "../Interfaces";
import { fetchSchema, executeQuery } from "../Clients";
import { Box, Paper, Typography } from "@mui/material";
import { type TableColumn } from "react-data-table-component";
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
  const [selectedDb, setSelectedDb] = useState<string>(databases[0]);
  const selectedDbRef = useRef<string>(databases[0]);
  const [columns, setColumns] = useState<TableColumn<Record<string, any>>[]>([]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const newDb = event.target.value;
    setSelectedDb(newDb);
    selectedDbRef.current = newDb;
  };

  const loadSchema = async (dbName: string): Promise<void> => {
    try {
      const data: TableSchema[] = await fetchSchema(dbName);
      schemaRef.current = data;
    } catch (error) {
      console.error("Error fetching schema:", error);
    }
  };

  useEffect(() => {
    selectedDbRef.current = selectedDb;
    loadSchema(selectedDb);
  }, [selectedDb]);

  const updateColumnsFromResults = (rows: Record<string, any>[]): void => {
    if (rows.length > 0) {
      const dynamicColumns: TableColumn<Record<string, any>>[] = Object.keys(rows[0]).map(
        (key) => ({
          name: key,
          selector: (row: Record<string, any>) => row[key],
          sortable: true,
          wrap: true,
        })
      );
      setColumns(dynamicColumns);
    } else {
      setColumns([]);
    }
  };

  useEffect(() => {
    updateColumnsFromResults(results);
  }, [results]);

  const handleRunClick = async (): Promise<void> => {
    if (!editorRef.current) return;

    const currentSql: string = editorRef.current.getValue();

    console.log(currentSql);

    setSqlValue(currentSql);
    setError(null);

    const request: SqlQueryRequest = {
      Sql: currentSql,
      DatabaseName: selectedDbRef.current,
    };

    try {
      const data = await executeQuery(request);
      // If executeQuery can throw or return error, handle accordingly
      // Assume it returns array or throws; adjust if executeQuery returns error object instead
      const freshRows = Array.isArray(data) ? data.map((row: Record<string, any>) => ({ ...row })) : [];
      setResults(freshRows);
    } catch (err: any) {
      // Check if err matches your ExecuteQueryErrorResponse structure
      if (err && typeof err === "object" && "error" in err) {
        setError((err as ExecuteQueryErrorResponse).error);
      } else {
        setError(err.message || "Unknown error");
      }
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
        if (!schemaRef.current.length) return { suggestions: [] };

        const word = model.getWordUntilPosition(position);
        const range: monaco.IRange = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions: monaco.languages.CompletionItem[] = [];

        schemaRef.current.forEach((table: TableSchema) => {
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
        <DatabaseDropdown selectedDb={selectedDb} handleChange={handleChange} databases={databases} setDatabases={setDatabases} />

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
          Use <code>Shift+Enter</code> to run the query. Use <code>Shift+Tab</code> to switch focus between editor and results.
        </Typography>
      </Box>
        <SqlResults 
          columns={columns} 
          error={error} 
          editorRef={editorRef} 
          results={results}
        />
    </Box>
  );
}
