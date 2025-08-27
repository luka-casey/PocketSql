// SqlResults.tsx
import * as monaco from "monaco-editor";
import { Box, Paper, Typography } from "@mui/material";
import DataTable, { type TableColumn } from "react-data-table-component";
import React, { useEffect, useRef } from "react";

interface SqlResultsProps {
  columns: TableColumn<Record<string, any>>[];
  error: string | null;
  editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor | null>;
  results: Record<string, any>[];
  dataTableRef?: React.RefObject<HTMLDivElement | null>; // optional wrapper ref from parent
}

export function SqlResults(props: SqlResultsProps) {
  // The element that will receive key events and is a good fallback to scroll
  const scrollableRef = useRef<HTMLDivElement | null>(null);

  // The wrapper (outer container) — either provided by parent or local
  const wrapperRef = props.dataTableRef ?? useRef<HTMLDivElement | null>(null);

  // Helper: find first descendant (or root) that can scroll horizontally (scrollWidth > clientWidth)
  const findHorizScrollable = (root: HTMLElement | null): HTMLElement | null => {
    if (!root) return null;
    // search root first, then children
    const nodes: HTMLElement[] = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
    for (const el of nodes) {
      try {
        const style = window.getComputedStyle(el);
        const overflowX = style.overflowX;
        // treat 'auto', 'scroll', 'overlay' as scrollable candidates
        if ((overflowX === "auto" || overflowX === "scroll" || overflowX === "overlay") && el.scrollWidth > el.clientWidth + 1) {
          return el;
        }
        // if overflowX is visible but element still larger than container, it might still scroll on ancestor;
        // we prefer explicit overflow declarations first.
      } catch {
        // ignore cross-origin or other read errors
      }
    }
    // fallback: use provided scrollableRef
    return scrollableRef.current ?? null;
  };

  // Helper: find first descendant that can scroll vertically
  const findVertScrollable = (root: HTMLElement | null): HTMLElement | null => {
    if (!root) return null;
    const nodes: HTMLElement[] = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
    for (const el of nodes) {
      try {
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        if ((overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") && el.scrollHeight > el.clientHeight + 1) {
          return el;
        }
      } catch {}
    }
    return scrollableRef.current ?? null;
  };

  useEffect(() => {
    // Attach listener to the wrapper (outer container) so we capture key events from its subtree.
    const listenerRoot = wrapperRef.current ?? scrollableRef.current;
    if (!listenerRoot) return;

    // Ensure at least the primary scrollable element is focusable
    if (scrollableRef.current) scrollableRef.current.tabIndex = 0;

    const V_SCROLL_STEP = 40;  // vertical step
    const H_SCROLL_STEP = 80;  // horizontal step

    const onKeyDown = (e: KeyboardEvent) => {
      // Return focus to editor with Ctrl+Enter
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        props.editorRef.current?.focus();
        return;
      }

      // Identify actual scroll targets at time of key press
      const horizTarget = findHorizScrollable(listenerRoot as HTMLElement);
      const vertTarget = findVertScrollable(listenerRoot as HTMLElement);

      switch (e.key) {
        // Horizontal
        case "ArrowRight": {
          e.preventDefault();
          const target = horizTarget ?? vertTarget ?? listenerRoot;
          target?.scrollBy({ left: H_SCROLL_STEP, behavior: "auto" });
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          const target = horizTarget ?? vertTarget ?? listenerRoot;
          target?.scrollBy({ left: -H_SCROLL_STEP, behavior: "auto" });
          break;
        }

        // Vertical
        case "ArrowDown": {
          e.preventDefault();
          const target = vertTarget ?? horizTarget ?? listenerRoot;
          target?.scrollBy({ top: V_SCROLL_STEP, behavior: "auto" });
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const target = vertTarget ?? horizTarget ?? listenerRoot;
          target?.scrollBy({ top: -V_SCROLL_STEP, behavior: "auto" });
          break;
        }
        case "PageDown": {
          e.preventDefault();
          const target = vertTarget ?? horizTarget ?? listenerRoot;
          target?.scrollBy({ top: (target as HTMLElement).clientHeight, behavior: "auto" });
          break;
        }
        case "PageUp": {
          e.preventDefault();
          const target = vertTarget ?? horizTarget ?? listenerRoot;
          target?.scrollBy({ top: -(target as HTMLElement).clientHeight, behavior: "auto" });
          break;
        }
        case "Home": {
          e.preventDefault();
          // If Ctrl held, treat as horizontal jump; otherwise vertical top
          if (e.ctrlKey) {
            const target = horizTarget ?? scrollableRef.current ?? listenerRoot;
            if (target) target.scrollLeft = 0;
          } else {
            const target = vertTarget ?? scrollableRef.current ?? listenerRoot;
            if (target) target.scrollTop = 0;
          }
          break;
        }
        case "End": {
          e.preventDefault();
          if (e.ctrlKey) {
            const target = horizTarget ?? scrollableRef.current ?? listenerRoot;
            if (target) (target as HTMLElement).scrollLeft = (target as HTMLElement).scrollWidth;
          } else {
            const target = vertTarget ?? scrollableRef.current ?? listenerRoot;
            if (target) (target as HTMLElement).scrollTop = (target as HTMLElement).scrollHeight;
          }
          break;
        }
        default:
          break;
      }
    };

    // Use capture so we see events before potential stopPropagation in children
    listenerRoot.addEventListener("keydown", onKeyDown, { capture: true });
    return () => listenerRoot.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [props.editorRef, wrapperRef, scrollableRef]);

  return (
    <Box
      ref={wrapperRef}
      tabIndex={-1}
      sx={{
        width: "42%",
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
        // Keep Shift+Tab behavior to return to editor
        if (e.shiftKey && e.key === "Tab") {
          e.preventDefault();
          props.editorRef.current?.focus();
        }
      }}
    >
      {props.error && (
        <Typography color="error" variant="body2">
          Error: {props.error}
        </Typography>
      )}

      <Paper
        ref={scrollableRef}
        tabIndex={0}
        elevation={3}
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "auto", // allow horizontal scrolling
          //maxHeight: "calc(100vh - 140px)",
        }}
      >
        {props.results.length > 0 ? (
          <DataTable
            columns={props.columns}
            data={props.results}
            responsive
            striped
            dense
          />
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
    </Box>
  );
}

export default SqlResults;
