import { defineStore } from 'pinia';
import { ref } from 'vue';

const useAuthStore = defineStore('auth', () => {
    const id = ref(Date.now().toString());
    const token = ref('');

    return { id, token };
});

export default useAuthStore;
