import axios from "axios";

const API_BASE = "http://localhost:5270/api/sqlfile";

export async function UploadFile(request: { Sql: string,  FileName: string, DatabaseName: string }): Promise<any> {
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