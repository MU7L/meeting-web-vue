import 'element-plus/dist/index.css';

import ElementPlus from 'element-plus';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import * as ElementPlusIconsVue from '@element-plus/icons-vue';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(ElementPlus);
app.use(router);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

app.mount('#app');
