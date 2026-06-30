import '@vue-flow/core/dist/style.css';
import 'element-plus/dist/index.css';
import '@agent-flow/ui/styles.css';
import './styles/main.css';

import { VueQueryPlugin } from '@tanstack/vue-query';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { permissionDirective } from './shared/auth/permission-directive';
import { useAuthStore } from './stores/auth-store';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
useAuthStore().hydrate();

app.use(router);
app.use(VueQueryPlugin);
app.use(ElementPlus, { locale: zhCn });
app.directive('permission', permissionDirective);
app.mount('#app');
