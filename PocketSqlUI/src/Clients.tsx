import axios from "axios";
import type { TableSchema } from "./Interfaces";

const API_BASE = "http://localhost:5270/api/sqlquery";

export async function fetchSchema(): Promise<TableSchema[]> {
  const response = await axios.get<TableSchema[]>(`${API_BASE}/schema`);
  return response.data;
}

export async function executeQuery(request: { Sql: string }): Promise<any> {
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