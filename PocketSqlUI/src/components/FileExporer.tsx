import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { GetAllFiles } from "../clients/SqlFileClient";
import type { GetFileRequest } from "../Interfaces";
import StorageIcon from "@mui/icons-material/Storage";

export interface FileIdentifier {
  databaseName: string;
  id: number;
  fileName: string;
}

interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  isFile?: boolean;
}

interface CollapsibleTreeWithIconsProps {
  onFileClick: (request: GetFileRequest) => void;
  databaseName: string | undefined;
}

//TODO Sort alphabetically 

const CollapsibleTreeWithIcons = forwardRef<{ refresh: () => void }, CollapsibleTreeWithIconsProps>(
  ({ onFileClick, databaseName }, ref) => {
    const [openIds, setOpenIds] = useState<Set<string>>(new Set());
    const [collapsed, setCollapsed] = useState(true);
    const [treeData, setTreeData] = useState<TreeNode[]>([]);

    const fetchFiles = async () => {
      const files = await GetAllFiles();

      const dbMap: Record<string, TreeNode> = {};
      files.forEach((file) => {
        if (!dbMap[file.databaseName]) {
          dbMap[file.databaseName] = {
            id: file.databaseName,
            name: file.databaseName,
            children: [],
          };
        }
        dbMap[file.databaseName].children!.push({
          id: `${file.databaseName}-${file.id}`,
          name: file.fileName,
          isFile: true,
        });
      });

      setTreeData(Object.values(dbMap));
    };

    useEffect(() => {
      fetchFiles();
    }, [databaseName]);

    useImperativeHandle(ref, () => ({
      refresh: fetchFiles,
    }));

    const toggleNode = (id: string) => {
      const newSet = new Set(openIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setOpenIds(newSet);
    };

    //TODO: implement delete file functionality 

    const renderNode = (node: TreeNode, level = 0) => {
      const hasChildren = node.children && node.children.length > 0;

      return (
        <div key={node.id}>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                toggleNode(node.id);
              } else {
                const request = { 
                  databaseName: node.id.split("-")[0], 
                  id: parseInt(node.id.split("-")[1]) 
                };

                onFileClick(request);
              }
            }}
            sx={{ pl: 1 + level * 1.5, py: 0.3, minHeight: 24 }}
          >
            <ListItemIcon sx={{ minWidth: 20, color: "white", mr: 0.5 }}>
              {hasChildren
                ? <StorageIcon fontSize="small" />
                : <InsertDriveFileIcon fontSize="small" />}
            </ListItemIcon>

            <ListItemText
              primary={node.name}
              sx={{ color: "white", "& .MuiTypography-root": { fontSize: "0.85rem" } }}
            />

            {hasChildren &&
              (openIds.has(node.id)
                ? <ExpandMoreIcon sx={{ color: "white", fontSize: "1rem" }} />
                : <ChevronRightIcon sx={{ color: "white", fontSize: "1rem" }} />)}
          </ListItemButton>

          {hasChildren && (
            <Collapse in={openIds.has(node.id)} timeout="auto" unmountOnExit>
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
          width: collapsed ? "20px" : "240px",
          backgroundColor: "#121212",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
            <MenuIcon sx={{ fontSize: 25, color: "white" }} />
          </IconButton>
          {!collapsed && (
            <Typography variant="subtitle2" sx={{ ml: 1, color: "white" }}>
              Object Explorer
            </Typography>
          )}
        </Box>

        {!collapsed && <List>{treeData.map((node) => renderNode(node))}</List>}
      </div>
    );
  }
);

export default CollapsibleTreeWithIcons;
