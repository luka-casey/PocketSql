import React, { useState } from "react";
import { Toolbar as MUIToolbar, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import DatabaseDropdown from "./DatabaseDropdown";
import type * as monaco from "monaco-editor";
import UploadIcon from '@mui/icons-material/Upload';
import type { UploadFileRequest } from "../Interfaces";

export interface ToolbarProps {
  selectedDb: string;
  setSelectedDb?: React.Dispatch<React.SetStateAction<string>>;
  databases: string[];
  setDatabases: React.Dispatch<React.SetStateAction<string[]>>;
  editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor | null>;
  sqlValue: string;
  executeUpload: (payload: UploadFileRequest) => Promise<any>;
  existingFileName: string | undefined;
}

export function Toolbar({
  selectedDb,
  setSelectedDb,
  databases,
  setDatabases,
  editorRef,
  sqlValue,
  executeUpload,
  existingFileName
}: ToolbarProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleUploadClick = () => {
    if (!editorRef.current) return;
    setOpenDialog(true);
  };

  const handleConfirm = async () => {
    if (!fileName) return; // Don't upload if empty
    try {

      let request: UploadFileRequest = { sql: sqlValue, databaseName: selectedDb, fileName: fileName };
      await executeUpload(request);
      alert("SQL uploaded successfully");
    } catch {
      alert("Failed to upload SQL");
    } finally {
      setOpenDialog(false);
      setFileName("");
    }
  };

  const handleCancel = () => {
    setOpenDialog(false);
    setFileName("");
  };

  return (
    <>
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
          disabled={!selectedDb || !sqlValue}
          onClick={handleUploadClick}
        >
          <UploadIcon fontSize="small" sx={{ color: "white" }} />
        </Button>
      </MUIToolbar>

      <Dialog open={openDialog} onClose={handleCancel}>
        <DialogTitle>Enter Filename</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Filename"
            type="text"
            fullWidth
            variant="standard"
            value={existingFileName}
            onChange={(e) => setFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && fileName) handleConfirm(); // Submit on Enter
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!fileName}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Toolbar;
