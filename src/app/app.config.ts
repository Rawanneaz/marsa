// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { OrderByPipe } from './shared/pipes/order-by.pipe';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient()
  ]
};
