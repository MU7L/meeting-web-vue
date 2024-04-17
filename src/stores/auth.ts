import { useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';

const useAuthStore = defineStore('auth', {
    state: () => ({
        id: useLocalStorage('id', ''),
        token: useLocalStorage('token', ''),
    }),

    getters: {
        logged: ({id, token}) => id !== '' && token !== '',
    }
});

export default useAuthStore;
