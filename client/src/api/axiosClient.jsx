import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8000/api", // change to your API
});

export default axiosClient;
