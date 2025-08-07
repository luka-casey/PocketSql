import { useEffect, useState } from "react";
import { fetchSchema } from "./Clients";
import type { TableSchema } from "./Interfaces";

interface SchemaViewerProps {
  database: string;
}

export function SchemaViewer({ database }: SchemaViewerProps) {
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSchema() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSchema(database);
        setSchema(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (database) {
      loadSchema();
    }
  }, [database]);

  //if (loading) return <p>Loading schema...</p>;
  //if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div>
      {/* <h2>Database Schema: {database}</h2>
      {schema.map((table) => (
        <div key={table.table} style={{ marginBottom: "1rem" }}>
          <h3>{table.table}</h3>
          <ul>
            {table.columns.map((col) => (
              <li key={col.columnName}>
                {col.columnName} <em>({col.dataType})</em>
              </li>
            ))}
          </ul>
        </div>
      ))} */}
    </div>
  );
}
