const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const fetchAPI = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      defaultOptions.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // We rely on HTTP-only cookies and Authorization headers for authentication, so include credentials
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    credentials: "include",
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error("API Request Error:", error);
    return { status: 500, data: { success: false, message: "Network error" } };
  }
};
