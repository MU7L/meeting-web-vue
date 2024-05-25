import { createRouter, createWebHashHistory } from 'vue-router';

import useAuthStore from '@/stores/auth';

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/auth',
            name: 'auth',
            component: () => import('@/views/auth/AuthView.vue'),
        },
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/home/HomeView.vue'),
            redirect: '/calendar',
            children: [
                {
                    path: 'calendar',
                    name: 'calendar',
                    component: () =>
                        import('@/views/home/calendar/CalendarView.vue'),
                },
                {
                    path: 'team',
                    name: 'team',
                    component: () => import('@/views/home/team/TeamView.vue'),
                },
            ],
        },
        {
            path: '/meeting/:mid',
            name: 'meeting',
            component: () => import('@/views/meeting/MeetingView.vue'),
        },
    ],
});

// GOOD
router.beforeEach((to, from, next) => {
    const { logged } = useAuthStore();
    if (to.name !== 'auth' && !logged) next({ name: 'auth' });
    else next();
});

export default router;
