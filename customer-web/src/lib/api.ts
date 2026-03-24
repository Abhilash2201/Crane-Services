import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080";
console.log("Backend URL:", baseURL);

export const api = axios.create({
  baseURL,
});
