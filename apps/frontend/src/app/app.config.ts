import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { appRoutes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthService } from './auth/services/auth.service';
import { MockAuthService } from './auth/services/auth.service.mock';
import { RecepcionService } from './recepcion/services/recepcion.service';
import { MockRecepcionService } from './recepcion/services/recepcion.service.mock';
import { InventarioService } from './inventario/services/inventario.service';
import { MockInventarioService } from './inventario/services/inventario.service.mock';
import { DispensacionService } from './dispensacion/services/dispensacion.service';
import { MockDispensacionService } from './dispensacion/services/dispensacion.service.mock';
import { HistorialService } from './historial/services/historial.service';
import { MockHistorialService } from './historial/services/historial.service.mock';
import { AdministracionService } from './administracion/services/administracion.service';
import { MockAdministracionService } from './administracion/services/administracion.service.mock';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideIonicAngular(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    { provide: AuthService, useClass: MockAuthService },
    { provide: RecepcionService, useClass: MockRecepcionService },
    { provide: InventarioService, useClass: MockInventarioService },
    { provide: DispensacionService, useClass: MockDispensacionService },
    { provide: HistorialService, useClass: MockHistorialService },
    { provide: AdministracionService, useClass: MockAdministracionService },
  ],
};
