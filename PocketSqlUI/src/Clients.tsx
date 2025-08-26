import axios from "axios";
import type { TableSchema } from "./Interfaces";

const API_BASE = "http://localhost:5270/api/sqlquery";

export async function executeQuery(request: { Sql: string, DatabaseName: string }): Promise<any> {
  try {
    const response = await axios.post(`${API_BASE}/execute`, request, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      const errData = error.response.data;
      throw new Error(
        `Error ${errData.errorCode}: ${errData.error || "Unknown error"}`
      );
    }
    throw error;
  }
}

export async function fetchSchema(Database: string): Promise<TableSchema[]> {
  const response = await axios.get<TableSchema[]>(`${API_BASE}/schema`, {
    params: { database: Database }
  });
  return response.data;
}

export async function getDatabases(): Promise<string[]> {
  const response = await axios.get<string[]>(`${API_BASE}/databases`, {
    params: {}
  });
  return response.data;
}

export async function UploadFile(request: { Sql: string, DatabaseName: string }): Promise<any> {
  try {
    const response = await axios.post(`${API_BASE}/uploadFile`, request, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      const errData = error.response.data;
      throw new Error(
        `Error ${errData.errorCode}: ${errData.error || "Unknown error"}`
      );
    }
    throw error;
  }
}