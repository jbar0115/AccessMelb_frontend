import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import 'primeicons/primeicons.css'


// Google Fonts
const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap'
document.head.appendChild(link)

createApp(App).use(router).mount('#app')
