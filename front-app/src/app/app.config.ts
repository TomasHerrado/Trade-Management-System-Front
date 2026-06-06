import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { APP_INITIALIZER } from '@angular/core';
import { AppStateService } from './core/services/app-state';
import { RoleService } from './core/services/role';

function initRoleLoader(appState: AppStateService,
                        roleService: RoleService) {
  return () => {
    appState.registerRoleLoader((cId) => roleService.loadRole(cId));
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([jwtInterceptor, errorInterceptor])
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initRoleLoader,
      deps: [AppStateService, RoleService],
      multi: true,
    },
  ],
};