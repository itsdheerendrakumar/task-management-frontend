import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

type QueueItem = {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: any | null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(api(p.config));
  });
  failedQueue = [];
};

api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error: AxiosError & { config?: AxiosRequestConfig }) {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      isRefreshing = true;

      return new Promise((resolve, reject) => {
        axios
          .get(`${api.defaults.baseURL}/auth/refresh`, { withCredentials: true })
          .then(() => {
            isRefreshing = false;
            processQueue(null);
            resolve(api(originalRequest));
          })
          .catch((err) => {
            isRefreshing = false;
            processQueue(err);
            // If refresh also returned 401 => logout
            if (err && err.response && err.response.status === 401) {
               window.location.href = '/login';
            }
            reject(err);
          });
      });
    }

    return Promise.reject(error);
  }
);

export default api;