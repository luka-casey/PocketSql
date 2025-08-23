import * as monaco from "monaco-editor";
import { Box, Paper, Typography } from "@mui/material";
import DataTable, { type TableColumn } from "react-data-table-component";
import React, { useEffect, useRef } from "react";

interface SqlResultsProps {
  columns: TableColumn<Record<string, any>>[];
  error: string | null;
  editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor | null>;
  results: Record<string, any>[];
  dataTableRef?: React.RefObject<HTMLDivElement | null>; // optional if you still pass it
}

export function SqlResults(props: SqlResultsProps) {
  // This is the actual scrollable area inside the panel (the Paper wrapper)
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = props.dataTableRef ?? useRef<HTMLDivElement | null>(null);

  // Keyboard handler for wrapper: arrow keys + page/home/end scroll the results
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const scrollable = scrollableRef.current;
    if (!wrapper || !scrollable) return;

    const SCROLL_STEP = 40; // pixels per ArrowUp/ArrowDown press — tweak to taste

    const onKeyDown = (e: KeyboardEvent) => {
      // Return focus to editor with Ctrl+Enter
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        props.editorRef.current?.focus();
        return;
      }

      // Only handle navigation keys when wrapper is focused
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          scrollable.scrollBy({ top: SCROLL_STEP, behavior: "auto" });
          break;
        case "ArrowUp":
          e.preventDefault();
          scrollable.scrollBy({ top: -SCROLL_STEP, behavior: "auto" });
          break;
        case "PageDown":
          e.preventDefault();
          scrollable.scrollBy({ top: scrollable.clientHeight, behavior: "auto" });
          break;
        case "PageUp":
          e.preventDefault();
          scrollable.scrollBy({ top: -scrollable.clientHeight, behavior: "auto" });
          break;
        case "Home":
          e.preventDefault();
          scrollable.scrollTop = 0;
          break;
        case "End":
          e.preventDefault();
          scrollable.scrollTop = scrollable.scrollHeight;
          break;
        default:
          // don't interfere with other keys (e.g., letters, Ctrl combos)
          break;
      }
    };

    wrapper.addEventListener("keydown", onKeyDown);
    return () => wrapper.removeEventListener("keydown", onKeyDown);
  }, [wrapperRef, scrollableRef, props.editorRef]);

  // Small helper to ensure focus outline styling is handled by MUI sx (we set outline none here)
  return (
    <Box
      ref={wrapperRef}
      tabIndex={0}
      sx={{
        width: 520,
        maxWidth: "40%",
        flex: "0 0 520px",
        display: "flex",
        flexDirection: "column",
        p: 2,
        gap: 2,
        overflow: "hidden",
        outline: "none",
        bgcolor: "#0f0f0f",
        color: "white",
      }}
      aria-label="SQL results"
      onKeyDown={(e) => {
        // Keep this so Shift+Tab can still return to editor quickly if needed.
        if (e.shiftKey && e.key === "Tab") {
          e.preventDefault();
          props.editorRef.current?.focus();
        }
      }}
    >
      <Typography variant="h6">Results</Typography>

      {props.error && (
        <Typography color="error" variant="body2">
          Error: {props.error}
        </Typography>
      )}

      {/* This is the scrollable area (we attach scrollableRef here) */}
      <Paper
        ref={scrollableRef}
        elevation={3}
        sx={{ flex: 1, overflowY: "auto", maxHeight: "calc(100vh - 140px)" }}
      >
        {props.results.length > 0 ? (
          <DataTable columns={props.columns} data={props.results} responsive striped dense />
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              opacity: 0.6,
              p: 2,
            }}
          >
            <Typography variant="body1" sx={{ color: "#ccc" }}>
              No results yet. Run a query!
            </Typography>
          </Box>
        )}
      </Paper>

      <Typography variant="caption" sx={{ display: "block", mt: 1, color: "grey.500" }}>
        Tip: press <code>Shift+Enter</code> in the editor to run. Click the results panel or press <code>Shift+Tab</code> in the editor
        to move focus here, then use <code>↑ ↓</code> or <code>PageUp / PageDown</code> to scroll. <code>Ctrl+Enter</code> returns to editor.
      </Typography>
    </Box>
  );
}

export default SqlResults;
