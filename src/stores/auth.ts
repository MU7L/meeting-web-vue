import { useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';

import type { ResponseData } from '@/utils/axios';
import axiosInstance from '@/utils/axios';

const useAuthStore = defineStore('auth', {
    state: () => {
        return {
            id: useLocalStorage('id', ''),
            token: useLocalStorage('token', ''),
            profile: {
                name: '',
                avatar: '',
                email: '',
            },
        };
    },

    getters: {
        logged: ({ id, token }) => id !== '' && token !== '',
    },

    actions: {
        async getProfile() {
            const res = await axiosInstance.get<
                ResponseData<{ name: string; avatar: string; email: string }>
            >('/users/' + this.id);
            this.profile = res.data.data;
        },
    },
});

export default useAuthStore;
