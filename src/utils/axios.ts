import { message } from 'ant-design-vue';
import axios from 'axios';

import useAuthStore from '@/stores/auth';

const axiosInstance = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    timeout: 10000,
    responseType: 'json',
});

axiosInstance.interceptors.request.use(
    config => {
        const { token } = useAuthStore();
        if (token.length > 0) {
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
    error => {
        message.error(error.message);
        console.error(error.message);
        return Promise.reject(error);
    },
);

export default axiosInstance;
