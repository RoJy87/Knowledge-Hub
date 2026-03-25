import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './assets/styles/main.css';
import { useAuthStore } from './stores/auth.store';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Initialize auth from storage after Pinia is set up
const authStore = useAuthStore(pinia);
authStore.initFromStorage();

app.mount('#app');
