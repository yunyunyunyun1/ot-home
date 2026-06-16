import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import HomeView from '../views/HomeView.vue'
import RegisterView from '../views/register/RegisterView.vue'

const roleRouteNames: Record<string, string> = {
  admin: 'admin-home',
  parent: 'parent-home',
  case_manager: 'case-manager-home',
  caregiver: 'caregiver-home',
  village_volunteer: 'village-volunteer-home',
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
    },
    {
      path: '/register/caregiver',
      name: 'register-caregiver',
      component: () => import('../views/register/RegisterCaregiverView.vue'),
    },
    {
      path: '/register/village-volunteer',
      name: 'register-village-volunteer',
      component: () => import('../views/register/RegisterVillageVolunteerView.vue'),
    },
    {
      path: '/admin',
      name: 'admin-home',
      component: () => import('../views/role/RoleBlankView.vue'),
      props: { title: 'Admin' },
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/parent',
      name: 'parent-home',
      component: () => import('../views/role/RoleBlankView.vue'),
      props: { title: 'ผู้ปกครอง' },
      meta: { requiresAuth: true, roles: ['parent'] },
    },
    {
      path: '/case-manager',
      name: 'case-manager-home',
      component: () => import('../views/case-manager/CaseManagerDashboardView.vue'),
      meta: { requiresAuth: true, roles: ['case_manager'] },
    },
    {
      path: '/caregiver',
      name: 'caregiver-home',
      component: () => import('../views/caregiver/CaregiverDashboardView.vue'),
      props: { title: 'นักกิจกรรมบำบัด' },
      meta: { requiresAuth: true, roles: ['caregiver'] },
    },
    {
      path: '/caregiver/kids/:kidId/development',
      name: 'caregiver-kid-development',
      component: () => import('../views/caregiver/KidDevelopmentView.vue'),
      meta: { requiresAuth: true, roles: ['caregiver'] },
    },
    {
      path: '/village-volunteer',
      name: 'village-volunteer-home',
      component: () => import('../views/role/RoleBlankView.vue'),
      props: { title: 'ผู้ดูแลเด็ก' },
      meta: { requiresAuth: true, roles: ['village_volunteer'] },
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.name === 'login' && authStore.token && authStore.user) {
    return { name: roleRouteNames[authStore.user.role] ?? 'home' }
  }

  if (to.meta.requiresAuth && !authStore.token) {
    return { name: 'login' }
  }

  const allowedRoles = to.meta.roles as string[] | undefined
  if (allowedRoles && authStore.user && !allowedRoles.includes(authStore.user.role)) {
    return { name: roleRouteNames[authStore.user.role] ?? 'home' }
  }
})

export default router
