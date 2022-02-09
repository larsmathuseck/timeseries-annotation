import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Debugger from '../views/Debugger.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/debug',
        name: 'Debugger',
        component: Debugger
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
