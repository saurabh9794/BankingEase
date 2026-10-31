
import { Routes } from '@angular/router';

import { Login } from './login/login';
import { Register } from './register/register';
import { Dashboard } from './dashboard/dashboard';
import { Bills } from './BillPayments/bills';
import { Loans } from './loans/loans';
import { Investments } from './investments/investments';
import { Beneficiaries } from './benefifiary/beneficiaries';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'dashboard',
    component: Dashboard
  },
  {
    path: 'beneficiaries',
    component: Beneficiaries
  },
  {
    path: 'bills',
    component: Bills
  },
  {
    path: 'loans',
    component: Loans
  },
  {
    path: 'investments',
    component: Investments
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
