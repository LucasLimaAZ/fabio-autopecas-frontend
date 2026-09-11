import { Routes } from '@angular/router';
import { LoginPage } from './pages/login-page/login-page';
import { HomePage } from './pages/home-page/home-page';
import { authGuard } from './core/guards/auth-guard';
import { WrapperLayout } from './components/wrapper-layout/wrapper-layout';
import { NewProduct } from './pages/new-product/new-product';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: '',
    component: WrapperLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: HomePage,
      },
      {
        path: 'products/new',
        component: NewProduct,
      },
    ],
  },
];
