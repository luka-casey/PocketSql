import React, { useState } from "react";
import {
    Toolbar as MUIToolbar,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    IconButton,
    Tooltip,
    Divider,
} from "@mui/material";
import DatabaseDropdown from "./DatabaseDropdown";
import type * as monaco from "monaco-editor";
import Save from "@mui/icons-material/SaveSharp";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import type { UploadFileRequest } from "../Interfaces";
import Delete from "@mui/icons-material/Delete";
import NoteAdd from "@mui/icons-material/NoteAdd";
import AutoStories from "@mui/icons-material/AutoStories";
import TableViewIcon from "@mui/icons-material/GridOff";
import NotesIcon from "@mui/icons-material/Notes";

export interface ToolbarProps {
    selectedDb: string;
    setSelectedDb?: React.Dispatch<React.SetStateAction<string>>;
    databases: string[];
    setDatabases: React.Dispatch<React.SetStateAction<string[]>>;
    editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor | null>;
    sqlValue: string;
    executeUpload: (payload: UploadFileRequest) => Promise<any>;
    existingFileName: string | undefined;
    executeDelete: () => Promise<any>;
    createNewFile: () => Promise<any>;
    togglePagination: boolean;
    setTogglePagination: React.Dispatch<React.SetStateAction<boolean>>;
    toggleResultsPane: boolean;
    setToggleResultsPane: React.Dispatch<React.SetStateAction<boolean>>;
    toggleEditor: boolean;
    setToggleEditor: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Toolbar({
    selectedDb,
    setSelectedDb,
    databases,
    setDatabases,
    editorRef,
    sqlValue,
    executeUpload,
    existingFileName,
    executeDelete,
    createNewFile,
    togglePagination,
    setTogglePagination,
    toggleResultsPane,
    setToggleResultsPane,
    toggleEditor,
    setToggleEditor,
}: ToolbarProps) {
    const [openDialog, setOpenDialog] = useState(false);
    const [fileName, setFileName] = useState("");

    const handleUploadClick = () => {
        if (!editorRef.current) return;
        setFileName(existingFileName || "");
        setOpenDialog(true);
    };

    const handleDeleteClick = async () => {
        if (!editorRef.current) return;
        setFileName(existingFileName || "");
        await executeDelete();
    };

    const handleConfirm = async () => {
        if (!fileName) return;

        try {
            const request: UploadFileRequest = {
                sql: sqlValue,
                databaseName: selectedDb,
                fileName: fileName,
            };
            console.log(request)
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
                    minHeight: "30px",
                    paddingX: "8px",
                }}
            >
                <DatabaseDropdown
                    selectedDb={selectedDb}
                    handleChange={(e) => setSelectedDb && setSelectedDb(e.target.value)}
                    databases={databases}
                    setDatabases={setDatabases}
                    setSelectedDb={setSelectedDb}
                />

                <Tooltip title={<div><b>Save</b></div>} arrow>
                    <Button
                        variant="text"
                        color="primary"
                        size="medium"
                        sx={{
                            minWidth: 28,
                            padding: 0,
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                        }}
                        disabled={!selectedDb || !sqlValue}
                        onClick={handleUploadClick}
                    >
                        <Save fontSize="small" sx={{ color: "white" }} />
                    </Button>
                </Tooltip>

                <Tooltip title={<div><b>Delete</b></div>} arrow>
                    <Button
                        variant="text"
                        color="primary"
                        size="medium"
                        sx={{
                            minWidth: 28,
                            padding: 0,
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                        }}
                        disabled={!selectedDb || !sqlValue}
                        onClick={handleDeleteClick}
                    >
                        <Delete fontSize="small" sx={{ color: "white" }} />
                    </Button>
                </Tooltip>

                <Tooltip title={<div><b>New file</b></div>} arrow>
                    <Button
                        variant="text"
                        size="medium"
                        sx={{
                            minWidth: 28,
                            padding: 0,
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                            color: "white",
                        }}
                        onClick={createNewFile}
                    >
                        <NoteAdd fontSize="small" />
                    </Button>
                </Tooltip>

                <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                        mx: 1,
                        borderColor: "#444",
                        height: 20,
                        alignSelf: "center",
                    }}
                />

                <Tooltip
                    title={
                        <div>
                            <div><b>Shift + Enter</b> → Search</div>
                            <div><b>Shift + Tab</b> → Toggle between sql editor & results window</div>
                        </div>
                    }
                    arrow
                >
                    <IconButton size="small" sx={{ color: "white" }}>
                        <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                        mx: 1,
                        borderColor: "#444",
                        height: 20,
                        alignSelf: "center",
                    }}
                />

                <Tooltip title={<div><b>Toggle editor</b></div>} arrow>
                    <Button
                        variant="text"
                        size="medium"
                        sx={{
                            minWidth: 28,
                            padding: 0,
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                            color: "white",
                        }}
                        onClick={() => setToggleEditor((prev) => !prev)}
                    >
                        {toggleEditor ? (
                            <NotesIcon fontSize="small" />
                        ) : (
                            <NotesIcon fontSize="small" sx={{ color: "#707070ff" }} />
                        )}
                    </Button>
                </Tooltip>

                <Tooltip title={<div><b>Toggle results pane</b></div>} arrow>
                    <Button
                        variant="text"
                        size="medium"
                        sx={{
                            minWidth: 28,
                            padding: 0,
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                            color: "white",
                        }}
                        onClick={() => setToggleResultsPane((prev) => !prev)}
                    >
                        {toggleResultsPane ? (
                            <TableViewIcon fontSize="small" />
                        ) : (
                            <TableViewIcon fontSize="small" sx={{ color: "#707070ff" }} />
                        )}
                    </Button>
                </Tooltip>

                <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                        mx: 1,
                        borderColor: "#444",
                        height: 20,
                        alignSelf: "center",
                    }}
                />

                <Tooltip title={<div><b>Toggle pagination</b></div>} arrow>
                    <Button
                        variant="text"
                        size="medium"
                        sx={{
                            minWidth: 28,
                            padding: 0,
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                            color: "white",
                        }}
                        onClick={() => setTogglePagination((prev) => !prev)}
                    >
                        {togglePagination ? (
                            <AutoStories fontSize="small" />
                        ) : (
                            <AutoStories fontSize="small" sx={{ color: "#707070ff" }} />
                        )}
                    </Button>
                </Tooltip>
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
                        value={fileName}
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
