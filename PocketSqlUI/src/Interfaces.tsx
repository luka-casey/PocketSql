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

export interface SqlFileValueData {
  id: number;
  sqlText: string;
  fileName: string;
  databaseName: string;
  createdDateTime: string; // or Date if you parse it
  modifiedDateTime: string | null; // or Date | null
}


// ** Api Request Payloads **
export interface ExecuteQueryRequest {
  databaseName: string;
  sqlQuery: string;
}

export interface UploadFileRequest {
  sql: string;
  fileName: string;
  databaseName: string;
}

export interface GetFileRequest {
  databaseName: string;
  id: number;
}

export interface EditFileRequest {
  databaseName: string;
  id: number;
  sql: string;
  fileName: string;
}
