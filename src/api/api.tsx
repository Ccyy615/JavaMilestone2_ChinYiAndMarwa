import axios from "axios";
const BASE = "http://localhost:8080"; 

export async function apiGet(path: string) {
 try {
 const response = await axios.get(`${BASE}${path}`);
 return response.data; // JavaScript object from API
 } catch (error) {
 console.error("GET request failed:", error);
 throw error; // re-throw so React can handle it
 }
}

export async function apiGetById(path: string, idFlight:number,path2: string) {
 try {
 const response = await axios.get(`${BASE}${path}/${idFlight}${path2}`);
 return response.data; 
 } catch (error) {
 console.error("GET request failed:", error);
 throw error; 
 }
}

export async function apiPost(path: string, data?: any) {
 try {
 const response = await axios.post(`${BASE}${path}`, data);
 return response.data;
 } catch (error) {
 console.error("POST request failed:", error);
 throw error;
 }
} 

export async function apiPut(path: string, data?: any) {
 try {
 const response = await axios.put(`${BASE}${path}`, data);
 return response.data;
 } catch (error) {
 console.error("PUT request failed:", error);
 throw error;
 }
}

export async function apiDelete(path: string) {
 try {
 const response = await axios.delete(`${BASE}${path}`);
 return response.data;
 } catch (error) {
 console.error("DELETE request failed:", error);
 throw error;
 }
} 
