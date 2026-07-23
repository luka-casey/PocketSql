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
import RefreshIcon from "@mui/icons-material/Refresh";
import { GetAllFiles } from "../clients/SqlFileClient";
import { GetSchema } from "../clients/SqlQueryClient";
import type { GetFileRequest } from "../Interfaces";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import StorageIcon from "@mui/icons-material/Storage";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TableRowsIcon from "@mui/icons-material/TableRows";

export interface FileIdentifier {
  databaseName: string;
  id: number;
  fileName: string;
  fileType?: string | null;
}

interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  isFile?: boolean;
  databaseName?: string;
  fileId?: number;
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
      const schema = databaseName ? await GetSchema(databaseName) : [];
      const filteredFiles = databaseName ? files.filter((file) => file.databaseName === databaseName) : files;

      const dbMap: Record<string, TreeNode> = {};
      filteredFiles.forEach((file) => {
        if (!dbMap[file.databaseName]) {
          dbMap[file.databaseName] = {
            id: file.databaseName,
            name: file.databaseName,
            children: [],
          };
        }

        const databaseNode = dbMap[file.databaseName];
        const normalizedFileType = file.fileType?.trim().toLowerCase();
        let parentNode: TreeNode | undefined;

        if (normalizedFileType === "view") {
          parentNode = databaseNode.children?.find((child) => child.name === "Views" && !child.isFile);
          if (!parentNode) {
            parentNode = {
              id: `${file.databaseName}-Views`,
              name: "Views",
              children: [],
            };
            databaseNode.children!.push(parentNode);
          }
        } else if (normalizedFileType === "proc") {
          parentNode = databaseNode.children?.find((child) => child.name === "Stored Procs" && !child.isFile);
          if (!parentNode) {
            parentNode = {
              id: `${file.databaseName}-Stored Procs`,
              name: "Stored Procs",
              children: [],
            };
            databaseNode.children!.push(parentNode);
          }
        }

        const targetNode = parentNode ?? databaseNode;
        targetNode.children!.push({
          id: `${file.databaseName}-${file.id}`,
          name: file.fileName,
          isFile: true,
          databaseName: file.databaseName,
          fileId: file.id,
        });
      });

      if (databaseName) {
        if (!dbMap[databaseName]) {
          dbMap[databaseName] = {
            id: databaseName,
            name: databaseName,
            children: [],
          };
        }

        const databaseNode = dbMap[databaseName];
        const tablesNode: TreeNode = {
          id: `${databaseName}-Tables`,
          name: "Tables",
          children: schema.map((table) => ({
            id: `${databaseName}-Table-${table.table}`,
            name: table.table,
            children: table.columns.map((column) => ({
              id: `${databaseName}-Table-${table.table}-Column-${column.columnName}`,
              name: `${column.columnName} (${column.dataType})`,
            })),
          })),
        };

        if (tablesNode.children?.length) {
          databaseNode.children!.push(tablesNode);
        }
      }

      const sortNode = (node: TreeNode) => {
        if (!node.children) return;
        node.children.sort((a, b) => a.name.localeCompare(b.name));
        node.children.forEach(sortNode);
      };

      const sortedTree = Object.values(dbMap);
      sortedTree.sort((a, b) => a.name.localeCompare(b.name));
      sortedTree.forEach(sortNode);
      setTreeData(sortedTree);
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
              } else if (node.fileId !== undefined && node.databaseName) {
                const request = {
                  databaseName: node.databaseName,
                  id: node.fileId,
                };
                onFileClick(request);
              }
            }}
            sx={{ pl: 1 + level * 1.5, py: 0.3, minHeight: 24 }}
          >
            <ListItemIcon sx={{ minWidth: 20, color: "white", mr: 0.5 }}>
              {hasChildren ? (
                node.name === "Views" ? (
                  <VisibilityIcon fontSize="small" />
                ) : node.name === "Stored Procs" ? (
                  <SettingsApplicationsIcon fontSize="small" />
                ) : node.name === "Tables" ? (
                  <TableRowsIcon fontSize="small" />
                ) : (
                  <StorageIcon fontSize="small" />
                )
              ) : (
                <InsertDriveFileIcon fontSize="small" />
              )}
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
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
              <MenuIcon sx={{ fontSize: 25, color: "white" }} />
            </IconButton>
            {!collapsed && (
              <Typography variant="subtitle2" sx={{ ml: 1, color: "white" }}>
                Object Explorer
              </Typography>
            )}
          </Box>
          {!collapsed && (
            <IconButton size="small" onClick={() => void fetchFiles()} sx={{ color: "white" }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {!collapsed && <List>{treeData.map((node) => renderNode(node))}</List>}
      </div>
    );
  }
);

export default CollapsibleTreeWithIcons;
