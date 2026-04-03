import axios from "axios";

const api = axios.create({
  baseURL: "https://skillzone-gblf.onrender.com/api",
 
});

// ✅ ALWAYS attach token properly
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;