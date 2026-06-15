import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast"; // Optional: replace with react-hot-toast or your UI framework

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  timeout: 15000, // Best Practice: Prevents requests from hanging indefinitely
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Handle Response Errors (Server responded with status outside 2xx)
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.message || "Something went wrong";

      switch (status) {
        case 401: {
          useAuthStore.getState().logout();
          
          // Check if the current path is already the root/login page to prevent loops
          const isAtRoot = typeof window !== "undefined" && window.location.pathname === "/";
          const isAuthMe = error.config?.url?.includes("/auth/me");
          
          if (!isAuthMe && !isAtRoot && typeof window !== "undefined") {
            window.location.href = "/";
          }
          break;
        }

        case 403:
          toast.error("Access Denied: You do not have permission.");
          break;

        case 404:
          toast.error("Requested resource not found.");
          break;

        case 422:
          // Often used for validation errors (forms)
          toast.error(errorMessage || "Validation failed.");
          break;

        case 500:
          toast.error("Server Error: Please try again later.");
          break;

        default:
          toast.error(errorMessage);
          break;
      }
    } 
    // 2. Handle Network/Timeout Errors (Server didn't respond)
    else if (error.request) {
      if (error.code === "ECONNABORTED") {
        toast.error("Request timed out. Please check your connection.");
      } else {
        toast.error("Network error. Unable to connect to the server.");
      }
    } 
    // 3. Handle Request Setup Errors
    else {
      console.error("API Setup Error:", error.message);
    }

    // Always return rejected promise so calling functions can use local try/catch if needed
    return Promise.reject(error);
  }
);