import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Box } from "@mui/material";
import type { TableColumn } from "react-data-table-component";
import { GetSchema, ExecuteQuery } from "../clients/SqlQueryClient";
import type {
	TableSchema,
	ColumnInfo,
	ExecuteQueryErrorResponse,
	ExecuteQueryRequest,
	UploadFileRequest,
	GetFileRequest,
	SqlFileValueData,
	EditFileRequest
} from "../Interfaces";
import { SqlResults } from "./SqlResults";
import Toolbar from "./Toolbar";
import CollapsibleTreeWithIcons from "./FileExporer";
import { EditFile, GetFile, UploadFile } from "../clients/SqlFileClient";
import { confirm } from '@tauri-apps/plugin-dialog'

export function SqlEditor() {
	const schemaRef = useRef<TableSchema[]>([]);
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const dataTableRef = useRef<HTMLDivElement | null>(null);
	const explorerRef = useRef<{ refresh: () => void }>(null); // 👈 ref for explorer

	const [sqlValue, setSqlValue] = useState<string>("SELECT * FROM ");
	const [results, setResults] = useState<Record<string, any>[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [databases, setDatabases] = useState<string[]>([]);
	const [selectedDb, setSelectedDb] = useState<string>("");
	const selectedDbRef = useRef<string>("");
	const [columns, setColumns] = useState<TableColumn<Record<string, any>>[]>([]);
	const [currentFile, setCurrentFile] = useState<SqlFileValueData | undefined>(undefined);
    const [togglePagination, setTogglePagination] = useState<boolean>(true); 
    const [toggleResultsPane, setToggleResultsPane] = useState<boolean>(true); 
    const [toggleEditor, setToggleEditor] = useState<boolean>(true); 

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

		const request: ExecuteQueryRequest = {
			databaseName: selectedDbRef.current,
			sqlQuery: currentSql
		};

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

    try { monacoInstance.languages.register({ id: "mysql" }); } catch { }

    monacoInstance.languages.registerCompletionItemProvider("mysql", {
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

    // Run query on Shift+Enter
    editor.addCommand(monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.Enter, () => {
        handleRunClick();
    });

    // Focus results table on Shift+Tab
    editor.addCommand(monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.Tab, () => {
        setTimeout(() => {
            const wrapper = dataTableRef.current;
            if (!wrapper) return;
            const focusable = wrapper.querySelector('[tabindex="0"]') as HTMLElement | null;
            if (focusable) focusable.focus();
            else wrapper.focus();
        }, 0);
    });

    // --- NEW: Toggle boolean with Ctrl+E / Cmd+E ---
    // editor.addCommand(
    //     monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyR,
    //     () => {
    //         setToggleResultsPane(prev => !prev);
    //     }
    // );
};


    const createNewFile = async () => {
        console.log(sqlValue)
        console.log(currentFile?.sqlText)

        if (sqlValue === "SELECT * FROM ")
        {
            

        } else if (sqlValue === currentFile?.sqlText) {
            setSqlValue("SELECT * FROM ")
            setResults([])
            setCurrentFile(undefined)
        }
        else {
            const proceed = await confirm(`Are you sure you want to create a new file? Any unsaved changes will be deleted?`,
            { title: 'Confirm', kind: 'warning' }
  )
            //const proceed = window.confirm(`Are you sure you want to create a new file? Any unsaved changes will be deleted?`);
            if (!proceed) return;
            
            setSqlValue("SELECT * FROM ")
            setResults([])
            setCurrentFile(undefined)
        }
    }

	const executeDelete = async () => {
		let request: ExecuteQueryRequest | undefined = undefined;

		if (currentFile !== undefined) {

            const proceed = await confirm(`Are you sure you want to delete ${currentFile.fileName}`,
            { title: 'Confirm Delete', kind: 'warning' })

            //const proceed = window.confirm(`Are you sure you want to delete ${currentFile.fileName}`);
            if (!proceed) return;

			request = {
				databaseName: selectedDbRef.current,
				sqlQuery: `DELETE FROM SqlFiles WHERE Id = ${currentFile.id}` //currentSql
			};

			try {
                const data = await ExecuteQuery(request);
				const freshRows = Array.isArray(data) ? data.map((r: Record<string, any>) => ({ ...r })) : [];
				setResults(freshRows);
                setCurrentFile(undefined);
                setSqlValue("SELECT * FROM ")
                loadSchema(selectedDbRef.current)

			} catch (err: any) {
				console.error("executeQuery error:", err);
				if (err && typeof err === "object" && "error" in err) setError((err as ExecuteQueryErrorResponse).error);
				else setError(err?.message ?? "Unknown error");
			}
		} 
	}

	const executeUpload = async (request: UploadFileRequest) => {
		try {
			let data: SqlFileValueData;

			if (currentFile === undefined) {
				data = await UploadFile(request);
			} else {
				let editFileRequest: EditFileRequest = {
					databaseName: currentFile.databaseName,
					id: currentFile.id,
					sql: sqlValue,
					fileName: request.fileName
				};
				data = await EditFile(editFileRequest);
			}

			// ✅ Ensure fileName exists (fallback to request.fileName)
			const updatedFile: SqlFileValueData = {
				...data,
				fileName: request.fileName,
			};

			setCurrentFile(updatedFile);

			// ✅ Refresh explorer
			explorerRef.current?.refresh();

			return updatedFile;
		} catch (err: any) {
			console.error("executeUpload error:", err);
			if (err && typeof err === "object" && "error" in err) {
				setError((err as ExecuteQueryErrorResponse).error);
			} else {
				setError(err?.message ?? "Unknown error");
			}
			throw err;
		}
	};



	const handleFileClick = async (request: GetFileRequest) => {
		try {
			console.log(sqlValue)

			if (sqlValue !== "SELECT * FROM " && currentFile?.sqlText === undefined) {
                const proceed = await confirm(`You've made changes without saving. Are you sure you want to switch files?`,
                { title: 'Confirm', kind: 'warning' })
				// const proceed = window.confirm(
				// 	"You've made changes without saving. Are you sure you want to switch files?"
				// );
				if (!proceed) return;
			}
			else if (currentFile?.sqlText !== undefined && sqlValue !== currentFile?.sqlText) {
                const proceed = await confirm(`You've made changes without saving. Are you sure you want to switch files?`,
                { title: 'Confirm', kind: 'warning' })
				// const proceed = window.confirm(
				// 	"You've made changes without saving. Are you sure you want to switch files?"
				// );
				if (!proceed) return;
			}

			const file: SqlFileValueData = await GetFile(request);
			setCurrentFile(file);

			setSqlValue(file.sqlText ?? "");
			if (editorRef.current) {
				editorRef.current.setValue(file.sqlText ?? "");
			}

			setSelectedDb(file.databaseName); // auto-select DB
		} catch {
			setError("Failed to load file");
		}
	};

	return (
        <div style={{height: "100vh", overflow: "hidden"}}>
                <Toolbar
                    selectedDb={selectedDb}
                    setSelectedDb={setSelectedDb}
                    databases={databases}
                    setDatabases={setDatabases}
                    editorRef={editorRef}
                    sqlValue={sqlValue}
                    executeUpload={executeUpload}
                    existingFileName={currentFile?.fileName}
                    executeDelete={executeDelete}
                    createNewFile={createNewFile}
                    togglePagination={togglePagination}
                    setTogglePagination={setTogglePagination}
                    toggleResultsPane={toggleResultsPane}
                    setToggleResultsPane={setToggleResultsPane}
                    toggleEditor={toggleEditor}
                    setToggleEditor={setToggleEditor}
                />
            <Box sx={{ display: "flex", height: "90vh", flexDirection: "row", bgcolor: "#121212", color: "white" }}>

                <div style={{ display: "flex" }}>
                    <CollapsibleTreeWithIcons
                        ref={explorerRef}
                        onFileClick={handleFileClick}
                        databaseName={currentFile?.databaseName}
                    />
                </div>

                {(toggleEditor &&
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2, overflow: "hidden" }}>
                    <div
                        style={{
                            backgroundColor: "#373737ff",
                            padding: "5px",
                            width: "fit-content",
                        }}
                        >
                        <p
                            style={{
                            margin: "0px",
                            color: "#52a6ffff",
                            fontFamily: "Consolas, Menlo, Monaco, monospace",
                            fontSize: "12px",
                            }}
                        >
                            {currentFile?.fileName ? `${currentFile.fileName}.sql` : "SQLQuery.sql"}
                        </p>
                    </div>
                    
                    <Editor
                        value={sqlValue}
                        onChange={(val) => setSqlValue(val ?? "")}
                        language="mysql"
                        theme="vs-dark"
                        onMount={handleEditorMount}
                        height="100%"
                        options={{ wordWrap: "on", minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 14 }}
                    />
                    
                </Box>
                )}

                {toggleResultsPane && (
                <SqlResults
                    columns={columns}
                    error={error}
                    editorRef={editorRef}
                    results={results}
                    dataTableRef={dataTableRef}
                    togglePagination={togglePagination}
                />
                )}
            </Box>
        </div>
	);
}

export default SqlEditor;
