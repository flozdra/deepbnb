import Vue from 'vue'
import Router from 'vue-router'

import WelcomePage from '@/pages/welcome'
import ModelsPage from '@/pages/models'
import DatasetPage from '@/pages/dataset'

Vue.use(Router)

export function createRouter() {
  return new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        component: WelcomePage,
        name: 'welcome-page',
      },
      {
        path: '/models',
        component: ModelsPage,
        name: 'models-page',
      },
      {
        path: '/dataset',
        component: DatasetPage,
        name: 'dataset-page',
      },
    ],
  })
}
