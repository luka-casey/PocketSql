import React from "react";
import { Toolbar as MUIToolbar, Button } from "@mui/material";
import DatabaseDropdown from "./DatabaseDropdown";
import type * as monaco from "monaco-editor";
import UploadIcon from '@mui/icons-material/Upload';

export interface ToolbarProps {
  selectedDb: string;
  setSelectedDb?: React.Dispatch<React.SetStateAction<string>>;
  databases: string[];
  setDatabases: React.Dispatch<React.SetStateAction<string[]>>;
  editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor | null>;
  sqlValue: string; // add this
  executeUpload: (payload: { Sql: string; DatabaseName: string }) => Promise<any>;
}

export function Toolbar({
  selectedDb,
  setSelectedDb,
  databases,
  setDatabases,
  editorRef,
  sqlValue,
  executeUpload,
}: ToolbarProps) {
  return (
    <MUIToolbar
      sx={{ backgroundColor: "#262626", gap: 1, minHeight: "40px", paddingX: "8px" }}
    >
      <DatabaseDropdown
        selectedDb={selectedDb}
        handleChange={(e) => setSelectedDb && setSelectedDb(e.target.value)}
        databases={databases}
        setDatabases={setDatabases}
        setSelectedDb={setSelectedDb}
      />
      <Button
        variant="contained"
        color="primary"
        size="small"
        sx={{ minWidth: "auto", width: "28px", padding: 0 }}
        disabled={!selectedDb || !sqlValue} // <-- use state instead of editorRef
        onClick={async () => {
          if (!editorRef.current) return;
          try {
            await executeUpload({ Sql: sqlValue, DatabaseName: selectedDb });
            alert("SQL uploaded successfully");
          } catch {
            alert("Failed to upload SQL");
          }
        }}
      >
        <UploadIcon fontSize="small" sx={{ color: "white" }} />
      </Button>
    </MUIToolbar>
  );
}


export default Toolbar;
