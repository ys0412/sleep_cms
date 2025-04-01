import { createRouter, createWebHistory } from 'vue-router';
import AudioList from '../views/AudioList.vue';
import ScrollList from '@/views/ScrollList.vue';
import ChapterList from '@/views/ChapterList.vue';
import DashboardView from '@/views/DashboardView.vue';

const routes = [
  { path: '/', component: DashboardView },
  { path: '/audio', component: AudioList },
  { path: '/scroll', component: ScrollList },
  { path: '/chapter', component: ChapterList }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
