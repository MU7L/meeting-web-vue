import { useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';

import type { User } from '@/types';
import type { ResponseData } from '@/utils/axios';
import axiosInstance from '@/utils/axios';

const useAuthStore = defineStore('auth', {
    state: () => {
        return {
            id: useLocalStorage('id', ''),
            token: useLocalStorage('token', ''),
            profile: {
                _id: useLocalStorage('id', ''),
                name: '',
                avatar: '',
                email: ''
            }
        };
    },

    getters: {
        logged: ({ id, token }) => id !== '' && token !== ''
    },

    actions: {
        async getProfile() {
            const res = await axiosInstance.get<ResponseData<User>>('/users/' + this.id);
            this.profile = { ...this.profile, ...res.data.data };
        }
    }
});

export default useAuthStore;
