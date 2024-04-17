import { message } from 'ant-design-vue';
import axios, { AxiosError } from 'axios';

import useAuthStore from '@/stores/auth';

export interface ResponseData<T = any> {
    success: boolean;
    data: T;
}

const axiosInstance = axios.create({
    baseURL: '/api',
    timeout: 10000,
});

interface ErrorResponse {
    success: boolean;
    message: string;
}

axiosInstance.interceptors.request.use(
    config => {
        const { token, logged } = useAuthStore();
        if (logged && token !== '') {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        message.error(error.message);
        console.error(error.message);
        return Promise.reject(error);
    },
);

axiosInstance.interceptors.response.use(
    response => {
        if (!response.data.success) {
            throw new Error(response.data);
        }
        return response.data.data;
    },
    (error: AxiosError<ErrorResponse>) => {
        message.error(error.response?.data.message);
        console.error(error.response?.data.message);
        return Promise.reject(error);
    },
);

export default axiosInstance;
