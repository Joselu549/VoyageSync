import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home-page';
import { TripsPage } from './pages/trips/trips-page';
import { SettingsPage } from './pages/settings/settings-page';

export enum DashboardRoutes {
  HOME = 'home',
  TRIPS = 'trips',
  SETTINGS = 'settings',
}

export const dashboardRoutes: Routes = [
  {
    path: '',
    redirectTo: DashboardRoutes.HOME,
    pathMatch: 'full',
  },
  {
    path: DashboardRoutes.HOME,
    component: HomePage,
  },
  {
    path: DashboardRoutes.TRIPS,
    component: TripsPage,
  },
  {
    path: DashboardRoutes.SETTINGS,
    component: SettingsPage,
  },
];
