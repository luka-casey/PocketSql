export interface ColumnInfo {
  columnName: string;
  dataType: string;
}

export interface TableSchema {
  table: string;
  columns: ColumnInfo[];
}

export interface ExecuteQueryErrorResponse {
  error: string;
  errorCode: number;
}


//Api Request Payloads
export interface ExecuteQueryRequest {
  databaseName: string;
  sqlQuery: string;
}

export interface UploadFileRequest {
  sql: string;
  fileName: string;
  databaseName: string;
}
