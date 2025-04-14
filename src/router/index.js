import { createRouter, createWebHistory } from 'vue-router';
import AudioList from '../views/AudioList.vue';
import LoginView from '@/views/LoginView.vue';
import ScrollList from '@/views/ScrollList.vue';
import ChapterList from '@/views/ChapterList.vue';
import DashboardView from '@/views/DashboardView.vue';
import CategoryList from '@/views/CategoryList.vue';

const routes = [
  {
    path: '/',
    component: LoginView
  },
  { path: '/dash', component: DashboardView },
  { path: '/audio', component: AudioList },
  { path: '/category', component: CategoryList },
  { path: '/scroll', component: ScrollList },
  { path: '/chapter', component: ChapterList }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
