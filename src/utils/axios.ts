import { message } from 'ant-design-vue';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'vue-router';

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
        console.error(error);
        message.error(error.message);
        return Promise.reject(error);
    },
);

axiosInstance.interceptors.response.use(
    response => {
        return response;
    },
    (error: AxiosError<ErrorResponse>) => {
        console.error(error);
        let errorMsg = error.message;
        if (error.response) {
            errorMsg = error.response.data.message;
        }
        message.error(errorMsg);
        if (error.response?.status === 401) {
            const router = useRouter();
            router.push('/auth');
        }
        return Promise.reject(error);
    },
);

export default axiosInstance;
