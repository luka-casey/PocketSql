// CollapsibleTreeWithIcons.tsx
import React, { useState } from "react";
import { List, ListItemButton, ListItemIcon, ListItemText, Collapse, IconButton, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  isFile?: boolean;
}

interface CollapsibleTreeProps {
  data: TreeNode[];
}

//TODO Need to hook up to Client
const CollapsibleTreeWithIcons: React.FC<CollapsibleTreeProps> = ({ data }) => {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState(true); // sidebar collapsed

  const toggleNode = (id: string) => {
    const newSet = new Set(openIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setOpenIds(newSet);
  };

  const renderNode = (node: TreeNode, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id}>
        <ListItemButton
          onClick={() => hasChildren && toggleNode(node.id)}
          sx={{
            pl: 1 + level * 1.5,
            py: 0.3,
            minHeight: 24,
          }}
        >
          <ListItemIcon sx={{ minWidth: 20, color: "white", mr: 0.5 }}>
            {hasChildren
              ? openIds.has(node.id)
                ? <FolderOpenIcon fontSize="small" />
                : <FolderIcon fontSize="small" />
              : <InsertDriveFileIcon fontSize="small" />}
          </ListItemIcon>

          {!collapsed && (
            <ListItemText
              primary={node.name}
              sx={{ color: "white", "& .MuiTypography-root": { fontSize: "0.85rem" } }}
            />
          )}

          {hasChildren && !collapsed && (
            openIds.has(node.id)
              ? <ExpandMoreIcon sx={{ color: "white", fontSize: "1rem" }} />
              : <ChevronRightIcon sx={{ color: "white", fontSize: "1rem" }} />
          )}
        </ListItemButton>

        {hasChildren && (
          <Collapse in={openIds.has(node.id) && !collapsed} timeout="auto" unmountOnExit>
            <List disablePadding>
              {node.children!.map((child) => renderNode(child, level + 1))}
            </List>
          </Collapse>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        padding: "10px",
        width: collapsed ? "25px" : "150px",
        transition: "width 0.3s",
        backgroundColor: "#121212",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
          <MenuIcon sx={{ fontSize: 18, color: "white" }} />
        </IconButton>
        {!collapsed && (
          <h4 style={{ fontFamily: "sans-serif", fontSize: "12px", margin: 0, marginLeft: 4 }}>
            Object Explorer
          </h4>
        )}
      </Box>

      <List>{data.map((node) => renderNode(node))}</List>
    </div>
  );
};

export default CollapsibleTreeWithIcons;
