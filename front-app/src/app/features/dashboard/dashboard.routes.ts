import { Routes } from '@angular/router';
import { ShellComponent } from './shell/shell';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home').then(m => m.HomeComponent)
      },
      {
        path: 'commerces',
        loadComponent: () => import('../commerces/commerce-list/commerce-list').then(m => m.CommerceList)
      },
      {
        path: 'commerces/new',
        loadComponent: () => import('../commerces/commerce-form/commerce-form').then(m => m.CommerceForm)
      },
      {
        path: 'commerces/:commerceId/branches',
        loadComponent: () => import('../branches/branch-list/branch-list').then(m => m.BranchList)
      },
      {
        path: 'products',
        loadComponent: () => import('../products/product-list/product-list').then(m => m.ProductList)
      },
      {
        path: 'stock',
        loadComponent: () => import('../stock/stock-list/stock-list').then(m => m.StockList)
      },
      {
        path: 'sales',
        loadComponent: () => import('../sales/sale-list/sale-list').then(m => m.SaleList)
      },
      {
        path: 'sales/new',
        loadComponent: () => import('../sales/sale-form/sale-form').then(m => m.SaleForm)
      },
      {
        path: 'purchases',
        loadComponent: () => import('../purchases/purchase-list/purchase-list').then(m => m.PurchaseList)
      },
      {
        path: 'customers',
        loadComponent: () => import('../customers/customer-list/customer-list').then(m => m.CustomerList)
      },
      {
        path: 'suppliers',
        loadComponent: () => import('../suppliers/supplier-list/supplier-list').then(m => m.SupplierList)
      },
    ]
  }
];