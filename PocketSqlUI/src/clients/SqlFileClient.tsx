import axios from "axios";
import type { EditFileRequest, GetFileRequest, SqlFileValueData, UploadFileRequest } from "../Interfaces";
import type { FileIdentifier } from "../components/FileExporer";

const API_BASE = "http://localhost:5270/api/sqlfile";


export async function UploadFile(request: UploadFileRequest): Promise<any> {
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

export async function GetFile(request: GetFileRequest): Promise<SqlFileValueData> {
  try {
    const response = await axios.get<SqlFileValueData>(`${API_BASE}/getFile`, {
      params: request,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching file:", error);
    throw error;
  }
}

export async function GetAllFiles(): Promise<FileIdentifier[]> {
  try {
    const response = await axios.get<FileIdentifier[]>(`${API_BASE}/getAllFiles`);
    return response.data;
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
}

export async function EditFile(request: EditFileRequest): Promise<any> {
  try {
    const response = await axios.patch<any>(`${API_BASE}/editFile`, request);
    return response.data;
  } catch (error: any) {
    console.error("Error editing file:", error.response?.data || error.message);
    throw error;
  }
}

//TODO Implement GetStoredProcs

