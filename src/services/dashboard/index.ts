import api from "@/services/api";

export const getDashboardData = async () => {
    const response = await api.get("/task/metrics");
    return response.data;
};
export const getLastOneYearTaskCount = async () => {
    const response = await api.get("/task/last-one-year");
    return response.data;
};