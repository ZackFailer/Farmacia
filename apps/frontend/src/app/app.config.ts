import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideComponentInputBinding } from '@ionic/angular/common';
import { appRoutes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthService } from './auth/services/auth.service';
import { ApiAuthService } from './auth/services/auth.service.api';
import { RecepcionService } from './recepcion/services/recepcion.service';
import { ApiRecepcionService } from './recepcion/services/recepcion.service.api';
import { InventarioService } from './inventario/services/inventario.service';
import { ApiInventarioService } from './inventario/services/inventario.service.api';
import { DispensacionService } from './dispensacion/services/dispensacion.service';
import { ApiDispensacionService } from './dispensacion/services/dispensacion.service.api';
import { HistorialService } from './historial/services/historial.service';
import { ApiHistorialService } from './historial/services/historial.service.api';
import { PacientesService } from './pacientes/services/pacientes.service';
import { ApiPacientesService } from './pacientes/services/pacientes.service.api';
import { RecetasService } from './recetas/services/recetas.service';
import { ApiRecetasService } from './recetas/services/recetas.service.api';
import { AdministracionService } from './administracion/services/administracion.service';
import { ApiAdministracionService } from './administracion/services/administracion.service.api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideIonicAngular(),
    provideComponentInputBinding(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    { provide: AuthService, useClass: ApiAuthService },
    { provide: RecepcionService, useClass: ApiRecepcionService },
    { provide: InventarioService, useClass: ApiInventarioService },
    { provide: DispensacionService, useClass: ApiDispensacionService },
    { provide: PacientesService, useClass: ApiPacientesService },
    { provide: RecetasService, useClass: ApiRecetasService },
    { provide: HistorialService, useClass: ApiHistorialService },
    { provide: AdministracionService, useClass: ApiAdministracionService },
  ],
};
