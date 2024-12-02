import { createRouter, createWebHistory } from 'vue-router';
import Welcome from '../components/Welcome.vue';
import YearSelection from '../components/YearSelection.vue';
import CategorySelection from '../components/CategorySelection.vue';
import Quiz from '../components/Quiz.vue';
import Statistics from '../components/Statistics.vue';

const routes = [
  { path: '/', component: Welcome },
  { path: '/year-selection', component: YearSelection },
  { path: '/categories/:year', component: CategorySelection, props: true },
  { path: '/quiz/:year/:category', component: Quiz, props: (route) => ({
    year: route.params.year,
    category: route.params.category,
    userId: route.query.userId, // Továbbítjuk a userId-t
  })},
  {
    path: '/statistics/:year',
    name: 'Statistics',
    component: Statistics,
    props: true,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
