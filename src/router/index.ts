import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/auth',
            name: 'auth',
            component: () => import('@/views/auth/AuthView.vue')
        },
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/home/HomeView.vue'),
            children: [
                {
                    path: 'calendar',
                    name: 'calendar',
                    component: () => import('@/views/home/calendar/CalendarView.vue')
                }, {
                    path: 'team',
                    name: 'team',
                    component: () => import('@/views/home/team/TeamView.vue')
                }
            ]
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
