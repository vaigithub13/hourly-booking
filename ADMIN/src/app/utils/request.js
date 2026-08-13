import axios from "axios";
import {
  toast
} from "react-toastify";

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export const checkLoginError = (err, router) => {
  if (err.message === "Request timed out") {
    router?.push("/500");
  } else if (
    err?.response?.data?.message === "admin.response.mismatch" ||
    err?.response?.data?.message === "admin.response.Notfound"
  ) {
    toast.error("Enter valid email or password!!");
    return;
  } else if (err?.response?.data?.message === "banners.response.notFound") {
    toast.error("Unable to change banner order!!");
  } else if (err?.response?.data?.message === "Bad Request") {
    toast.error("Unable to process the request at this time");
  } else {
    toast.error(
      typeof err?.response?.data?.message === "string" ?
      err?.response?.data?.message :
      "Something went wrong on our side"
    );
  }
};

const axiosInstance = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL}`
});

axiosInstance.interceptors.request.use(
  (request) => {
    const accessToken = getAccessToken();
    request.headers["x-lang"] = "en";
    request.headers["Content-Type"] =
      request.data instanceof FormData ? "multipart/form-data" : "application/json";

    if (accessToken) {
      request.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return request;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response or request config, just reject
    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Use base axios (not axiosInstance)
        const res = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/admin/refresh-token`, {
            refreshToken
          }, {
            headers: {
              "x-lang": "en",
              "Content-Type": "application/json"
            }
          }
        );

        const {
          accessToken,
          refreshToken: newRefreshToken
        } = res?.data?.data;

        // Save tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Update header for retry
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${accessToken}`
        };

        // Retry with new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("🔴 Token refresh failed:", refreshError);
        localStorage.clear();
        window.location.href = "/session/signin";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// 🧠 Shared Abort Logic
// =========================
const TIMEOUT = 10000; // 10 seconds

const withTimeout = async (axiosCall) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const res = await axiosCall(controller);
    clearTimeout(timeoutId);
    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    // ✅ Axios-specific timeout cancellation check
    if (
      error.code === "ERR_CANCELED" ||
      error.message === "canceled" ||
      error.message === "Request timed out"
    ) {
      console.error("❌ Request was aborted due to timeout");
      throw new Error("Request timed out");
    }
    // 🚨 Log other errors as usual
    console.error("🔴 Axios error:", error);
    throw error;
    throw error;
  }
};
export const getRequest = async (endpoint, router) => {
  try {
    const res = await withTimeout((controller) =>
      axiosInstance.get(endpoint, {
        signal: controller.signal
      })
    );

    if (res?.data?.statusCode === 200) {
      return res?.data;
    }
  } catch (error) {
    checkLoginError(error, router);

    console.error(error);
  }
};

export const UploadFiles = async (file) => {
  try {
    let form = new FormData();
    form.append("files", file);
    const res = await axiosInstance.post("/upload/", form);

    if (res?.data?.statusCode === 200) {
      return res?.data?.data[0];
    }
  } catch (error) {
    checkLoginError(error);
    console.error(error);
    return false;
  }
};

export const UploadMultiple = async (files) => {
  const uploadedFiles = [...files];

  for (let i = 0; i < uploadedFiles.length; i++) {
    const file = uploadedFiles[i];
    if (typeof file === "object" && file !== null) {
      try {
        const url = await UploadFiles(file);
        uploadedFiles[i] = url;
      } catch (error) {
        console.error(`Failed to upload ${file.path}`, error);
      }
    } else {
      console.log(`File ${file} is already uploaded. Skipping...`);
    }
  }
  return uploadedFiles;
};

export const postRequest = async (endpoint, data, router) => {
  try {
    console.log('endpointp---', endpoint);
    const res = await withTimeout((controller) =>
      axiosInstance.post(endpoint, data, {
        signal: controller.signal
      })
    );

    if (res?.data?.statusCode === 200) {
      return res?.data;
    }
  } catch (error) {
    checkLoginError(error, router);

    console.error(error);
  }
};

export const putRequest = async (endpoint, data, router) => {
  try {
    const res = await withTimeout((controller) =>
      axiosInstance.put(endpoint, data, {
        signal: controller.signal
      })
    );

    if (res?.data?.statusCode === 200) {
      return res?.data;
    }
  } catch (error) {
    checkLoginError(error, router);
    console.error(error);
  }
};

export const patchRequest = async (endpoint, data, router) => {
  try {
    const res = await withTimeout((controller) =>
      axiosInstance.patch(endpoint, data, {
        signal: controller.signal
      })
    );

    if (res?.data?.statusCode === 200) {
      return res?.data;
    }
  } catch (error) {
    checkLoginError(error, router);
    console.error(error);
  }
};

export const deleteRequest = async (endpoint, data, router) => {
  try {
    const res = await withTimeout((controller) =>
      axiosInstance.delete(endpoint, {
        data,
        signal: controller.signal
      })
    );

    if (res?.data?.statusCode === 200) {
      return res?.data;
    }
    return false;
  } catch (error) {
    checkLoginError(error, router);
    console.error(error);
  }
};