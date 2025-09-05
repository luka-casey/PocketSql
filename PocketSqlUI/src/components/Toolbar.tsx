import React, { useState } from "react";
import {
  Toolbar as MUIToolbar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from "@mui/material";
import DatabaseDropdown from "./DatabaseDropdown";
import type * as monaco from "monaco-editor";
import Save from "@mui/icons-material/SaveSharp";
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
    setFileName(existingFileName || ""); // Prefill filename
    setOpenDialog(true);
  };

  const handleConfirm = async () => {
    if (!fileName) return; // Don't upload if empty
    try {
      const request: UploadFileRequest = {
        sql: sqlValue,
        databaseName: selectedDb,
        fileName: fileName
      };
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
    <div>
      <MUIToolbar
        sx={{
          backgroundColor: "#262626",
          gap: 1,
          minHeight: "40px",
          paddingX: "8px",
          marginBottom: "10px"
        }}
      >
        <DatabaseDropdown
          selectedDb={selectedDb}
          handleChange={(e) => setSelectedDb && setSelectedDb(e.target.value)}
          databases={databases}
          setDatabases={setDatabases}
          setSelectedDb={setSelectedDb}
        />
        <Button
          variant="text"
          color="primary"
          size="medium"
          sx={{
            minWidth: 28,
            padding: 0,
            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" }
          }}
          disabled={!selectedDb || !sqlValue}
          onClick={handleUploadClick}
        >
          <Save fontSize="small" sx={{ color: "white" }} />
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
            value={fileName} // controlled by state
            onChange={(e) => setFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && fileName) handleConfirm();
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
    </div>
  );
}

export default Toolbar;
