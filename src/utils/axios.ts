import { message } from 'ant-design-vue';
import axios, { AxiosError } from 'axios';

import router from '@/router';
import useAuthStore from '@/stores/auth';

export interface ResponseData<T = any> {
    success: boolean;
    message?: string;
    data: T;
}

const BASE_URL = import.meta.env.VITE_BASE;

const axiosInstance = axios.create({
    baseURL: BASE_URL + '/api',
    timeout: 10000
});

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
    (error: AxiosError<ResponseData>) => {
        message.error(error.response?.data.message ?? error.message);
        if (error.response?.status === 401) {
            router.push('/auth');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
