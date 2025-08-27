import React, { useEffect } from "react";
import { getDatabases } from "../Clients";

interface DatabaseDropdownProps {
  selectedDb: string;
  handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  databases: string[];
  setDatabases: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedDb?: React.Dispatch<React.SetStateAction<string>>;
}

export function DatabaseDropdown(props: DatabaseDropdownProps) {
  useEffect(() => {
    const fetchDatabases = async (): Promise<void> => {
      try {
        const data = await getDatabases();
        props.setDatabases(data ?? []);
        if (data && data.length > 0 && (!props.selectedDb || props.selectedDb.length === 0)) {
          props.setSelectedDb?.(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch databases:", err);
        props.setDatabases([]);
      }
    };

    fetchDatabases();
  }, []);

  return (
    <select
      id="db-select"
      value={props.selectedDb ?? ""}
      onChange={props.handleChange}
      style={{
        backgroundColor: "black",
        color: "white",
        padding: "6px 8px",
        borderRadius: 4,
        border: "1px solid white",
        width: "200px",
      }}
    >
      <option value="" disabled>
        Select a database
      </option>
      {props.databases.map((db) => (
        <option key={db} value={db}>
          {db}
        </option>
      ))}
    </select>
  );
}

export default DatabaseDropdown;
