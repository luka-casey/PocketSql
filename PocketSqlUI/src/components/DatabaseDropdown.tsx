import { useEffect } from "react";
import { getDatabases } from "../Clients";

interface DatabaseDropdownProps {
    selectedDb: string
    handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    databases: string[];
    setDatabases: React.Dispatch<React.SetStateAction<string[]>>;
}

//Eventually needs to hit an API that retreaves a list of databases.
export function DatabaseDropdown(props: DatabaseDropdownProps) {
    useEffect(() => {
      const fetchDatabases = async (): Promise<void> => {
        const data: string[] = await getDatabases();
        props.setDatabases(data)
      }
      
      fetchDatabases();
    }, []);

  return (
    <select
        id="db-select"
        value={props.selectedDb}
        onChange={props.handleChange}
        style={{
        backgroundColor: "black",
        color: "white",
        padding: "6px 8px",
        borderRadius: 4,
        border: "1px solid white",
        width: "100%",
        marginBottom: 12,
        }}
    >
        {props.databases.map((db) => (
        <option key={db} value={db}>
            {db}
        </option>
        ))}
    </select>
  );
}
