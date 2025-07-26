namespace PocketSqlApi.Models;

public class TableSchema
{
    public string Table { get; set; } = string.Empty;
    public List<ColumnInfo> Columns { get; set; } = new();
}