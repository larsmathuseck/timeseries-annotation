import { createRouter, createWebHashHistory } from 'vue-router';
import TfaHome from '../views/TfaHome.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: TfaHome
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;
