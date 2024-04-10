import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const id = ref(Date.now().toString());
    const token = ref('');

    return { id, token };
});
