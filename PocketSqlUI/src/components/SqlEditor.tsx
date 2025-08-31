import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Box, Paper } from "@mui/material";
import type { TableColumn } from "react-data-table-component";
import { GetSchema, ExecuteQuery } from "../clients/SqlQueryClient";
import type { TableSchema, ColumnInfo, ExecuteQueryErrorResponse } from "../Interfaces";
import { SqlResults } from "./SqlResults";
import Toolbar from "./Toolbar";
import CollapsibleTreeWithIcons from "./FileExporer";
import { UploadFile } from "../clients/SqlFileClient";

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
      const data = await GetSchema(dbName);
      schemaRef.current = data ?? [];
    } catch (err) {
      console.error("GetSchema failed", err);
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

    let sql: string = currentSql;
    let databaseName: string = selectedDbRef.current;

    const request = { DatabaseName: databaseName,  SqlQuery: sql,  };
    //console.log("Executing SQL request payload:", request);

    try {
      const data = await ExecuteQuery(request);
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

    // Shift + Tab => move focus to results container's focusable element (the scrollable Paper)
    editor.addCommand(monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.Tab, () => {
      setTimeout(() => {
        const wrapper = dataTableRef.current;
        if (!wrapper) return;

        // prefer focusing the inner element that has tabindex=0 (our scrollable Paper)
        const focusable = wrapper.querySelector('[tabindex="0"]') as HTMLElement | null;
        if (focusable) focusable.focus();
        else wrapper.focus();
      }, 0);
    });
  };

  const executeUpload = async(request: { Sql: string, DatabaseName: string, FileName: string }) => {
    try {
      const data = await UploadFile(request);
      console.log("UploadFile result:", data);
      return data;
    } catch (err: any) {
      console.error("executeUpload error:", err);
      if (err && typeof err === "object" && "error" in err) setError((err as ExecuteQueryErrorResponse).error);
      else setError(err?.message ?? "Unknown error");
      throw err;
    }
  }

  const treeData = [
  {
    id: "1",
    name: "src",
    children: [
      { id: "2", name: "index.tsx", isFile: true },
      { id: "3", name: "App.tsx", isFile: true },
      {
        id: "4",
        name: "components",
        children: [
          { id: "5", name: "Tree.tsx", isFile: true },
          { id: "6", name: "TreeWithIcons.tsx", isFile: true },
        ],
      },
    ],
  },
];

  return (
    <Box sx={{ display: "flex", flexDirection: "row", height: "100vh", bgcolor: "#121212", color: "white" }}>
      
      <div style={{ display: "flex" }}>
        <CollapsibleTreeWithIcons data={treeData} />
      </div>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2, gap: 1, overflow: "hidden" }}>
        <Toolbar
          selectedDb={selectedDb}
          setSelectedDb={setSelectedDb}
          databases={databases}
          setDatabases={setDatabases}
          editorRef={editorRef}
          sqlValue={sqlValue} 
          executeUpload={executeUpload}
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
      </Box>

      <SqlResults
        columns={columns}
        error={error}
        editorRef={editorRef}
        results={results}
        dataTableRef={dataTableRef} // <-- pass the wrapper ref so editor can find the inner focusable element
      />
    </Box>
  );
}

export default SqlEditor;
