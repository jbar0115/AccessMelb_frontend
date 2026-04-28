import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory('/underdevelopment/'),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: { title: 'AccessMelb - Accessible Melbourne' }
        },
        {
            path: '/destination/:id',
            name: 'detail',
            component: () => import('../views/DetailView.vue'),
            meta: { title: 'Destination Details - AccessMelb' }
        }
    ],
    scrollBehavior() {
        return { top: 0, behavior: 'smooth' }
    }
})

// Update document title on route change
router.afterEach((to) => {
    document.title = to.meta.title || 'AccessMelb'
})

export default router