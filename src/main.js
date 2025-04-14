import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import router from './router'
import axios from 'axios'
import 'element-plus/dist/index.css';


const app = createApp(App)

axios.defaults.baseURL = 'http://localhost:8084'; // ✅ 设置全局请求地址
// 添加请求拦截器
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('jwtToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, error => {
    return Promise.reject(error)
})
app.use(ElementPlus);
app.use(router); // ✅ 这里注册路由
app.mount('#app');
