import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8000/api", // change to your API
  withCredentials: true, // so cookies like HttpOnly JWT are sent
});

export default axiosClient;
