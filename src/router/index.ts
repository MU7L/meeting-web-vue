import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/home/HomeView.vue')
        },
        {
            path: '/about',
            name: 'about',
            component: () => import('@/views/about/AboutView.vue')
        },
        {
            path: '/meeting/:meetingId',
            name: 'meeting',
            component: () => import('@/views/meeting/MeetingView.vue')
        }
    ]
});

export default router;
