import { Routes } from '@angular/router';
import { ShellComponent } from './shell/shell';
import { ownerGuard, adminGuard } from '../../core/guards/role-guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', loadComponent: () => import('../dashboard/home/home').then(m => m.HomeComponent) },

      // Gestión de comercios — solo OWNER
      { path: 'commerces', loadComponent: () => import('../commerces/commerce-list/commerce-list').then(m => m.CommerceList) },
      { path: 'commerces/new', canActivate: [ownerGuard], loadComponent: () => import('../commerces/commerce-form/commerce-form').then(m => m.CommerceForm) },
      { path: 'commerces/:id/edit', canActivate: [ownerGuard], loadComponent: () => import('../commerces/commerce-form/commerce-form').then(m => m.CommerceForm) },
      { path: 'commerces/:id', canActivate: [ownerGuard], loadComponent: () => import('../commerces/commerce-detail/commerce-detail').then(m => m.CommerceDetail) },
      { path: 'commerces/:commerceId/branches', loadComponent: () => import('../branches/branch-list/branch-list').then(m => m.BranchList) },
      { path: 'commerces/:commerceId/branches/:id/edit', canActivate: [adminGuard], loadComponent: () => import('../branches/branch-form/branch-form').then(m => m.BranchForm) },

      // Gestión del equipo — solo OWNER
      { path: 'team', canActivate: [ownerGuard], loadComponent: () => import('../team/team-list/team-list').then(m => m.TeamList) },

      { path: 'statistics', canActivate: [ownerGuard], loadComponent: () => import('../statistics/statistics').then(m => m.StatisticsPage) },

      // Productos — OWNER y ADMIN pueden ver; crear/editar controlado en component
      { path: 'products', loadComponent: () => import('../products/product-list/product-list').then(m => m.ProductList) },
      { path: 'products/new', canActivate: [adminGuard], loadComponent: () => import('../products/product-form/product-form').then(m => m.ProductForm) },
      { path: 'products/:id/edit', canActivate: [adminGuard], loadComponent: () => import('../products/product-form/product-form').then(m => m.ProductForm) },
      { path: 'products/:productId/variants', loadComponent: () => import('../products/variant-list/variant-list').then(m => m.VariantList) },
      { path: 'products/:productId/variants/new', loadComponent: () => import('../products/variant-form/variant-form').then(m => m.VariantForm) },
      { path: 'products/:productId/variants/:variantId/edit', loadComponent: () => import('../products/variant-form/variant-form').then(m => m.VariantForm) },

      // Stock — todos acceden (employee también)
      { path: 'stock', loadComponent: () => import('../stock/stock-list/stock-list').then(m => m.StockList) },
      { path: 'stock/adjust/:variantId', loadComponent: () => import('../stock/stock-adjust/stock-adjust').then(m => m.StockAdjust) },

      // Ventas — todos acceden
      { path: 'sales', loadComponent: () => import('../sales/sale-list/sale-list').then(m => m.SaleList) },
      { path: 'sales/new', loadComponent: () => import('../sales/sale-form/sale-form').then(m => m.SaleForm) },
      { path: 'sales/:id', loadComponent: () => import('../sales/sale-detail/sale-detail').then(m => m.SaleDetail) },

      // Compras — solo OWNER y ADMIN
      { path: 'purchases', canActivate: [adminGuard], loadComponent: () => import('../purchases/purchase-list/purchase-list').then(m => m.PurchaseList) },
      { path: 'purchases/new', canActivate: [adminGuard], loadComponent: () => import('../purchases/purchase-form/purchase-form').then(m => m.PurchaseForm) },

      // Clientes — todos acceden
      { path: 'customers', loadComponent: () => import('../customers/customer-list/customer-list').then(m => m.CustomerList) },
      { path: 'customers/new', loadComponent: () => import('../customers/customer-form/customer-form').then(m => m.CustomerForm) },
      { path: 'customers/:id/edit', loadComponent: () => import('../customers/customer-form/customer-form').then(m => m.CustomerForm) },
      { path: 'customers/:id/account', loadComponent: () => import('../customers/customer-account/customer-account').then(m => m.CustomerAccount) },

      // Proveedores — solo OWNER y ADMIN
      { path: 'suppliers', canActivate: [adminGuard], loadComponent: () => import('../suppliers/supplier-list/supplier-list').then(m => m.SupplierList) },
      { path: 'suppliers/new', canActivate: [adminGuard], loadComponent: () => import('../suppliers/supplier-form/supplier-form').then(m => m.SupplierForm) },
      { path: 'suppliers/:id/edit', canActivate: [adminGuard], loadComponent: () => import('../suppliers/supplier-form/supplier-form').then(m => m.SupplierForm) },
      { path: 'suppliers/:id', canActivate: [adminGuard], loadComponent: () => import('../suppliers/supplier-detail/supplier-detail').then(m => m.SupplierDetail) },
      { path: 'suppliers/:id/debts', canActivate: [adminGuard], loadComponent: () => import('../suppliers/supplier-debts/supplier-debts').then(m => m.SupplierDebts) },

      // Caja — todos acceden
      { path: 'cash-register', loadComponent: () => import('../cash-register/cash-register').then(m => m.CashRegisterPage) },
    ]
  }
];