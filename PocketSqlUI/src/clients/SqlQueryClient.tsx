import axios from "axios";
import type { ExecuteQueryRequest, TableSchema } from "../Interfaces";

const API_BASE = "http://localhost:5270/api/sqlquery";

export async function ExecuteQuery(request: ExecuteQueryRequest): Promise<any> {
  try {
    const response = await axios.post(`${API_BASE}/ExecuteQuery`, request, {
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

export async function GetSchema(Database: string): Promise<TableSchema[]> {
  const response = await axios.get<TableSchema[]>(`${API_BASE}/GetSchema`, {
    params: { database: Database }
  });
  return response.data;
}

export async function GetDatabases(): Promise<string[]> {
  const response = await axios.get<string[]>(`${API_BASE}/GetDatabases`, {
    params: {}
  });
  return response.data;
}

//TODO Add get stored procs client 