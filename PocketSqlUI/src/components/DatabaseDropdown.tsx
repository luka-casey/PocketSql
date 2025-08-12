interface DatabaseDropdownProps {
    selectedDb: string
    handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    databases: string[];
}

export function DatabaseDropdown(props: DatabaseDropdownProps) {
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
