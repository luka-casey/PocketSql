export interface ColumnInfo {
  columnName: string;
  dataType: string;
}

export interface TableSchema {
  table: string;
  columns: ColumnInfo[];
}

// export interface SqlQueryRequest {
//   Sql: string;  // must match casing exactly for your API
//   DatabaseName: string;
// }

export interface ExecuteQueryErrorResponse {
  error: string;
  errorCode: number;
}
