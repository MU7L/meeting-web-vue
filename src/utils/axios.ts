import router from '@/router';

import useAuthStore from '@/stores/auth';
import { message } from 'ant-design-vue';
import axios, { AxiosError } from 'axios';

export interface ResponseData<T = any> {
    success: boolean;
    message?: string;
    data: T;
}

const axiosInstance = axios.create({
    baseURL: '/api',
    timeout: 10000
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
        console.error(error);
        message.error(error.message);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    response => {
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        if (response.data.message) {
            message.success(response.data.message);
        }
        return response;
    },
    (error: AxiosError<ErrorResponse>) => {
        message.error(error.response?.data.message ?? error.message);
        if (error.response?.status === 401) {
            router.push('/auth');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
