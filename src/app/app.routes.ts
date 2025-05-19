import { Routes } from '@angular/router';
import { ClientListComponent } from './client-list/client-list.component';
import { ClientAddComponent } from './client-list/client-add.component';
import { NavireListComponent } from './navire-list/navire-list.component';
import { NavireAddComponent } from './navire-add/navire-add.component';
import { OperationListComponent } from './operation-list/operation-list.component';
import { OperationAddComponent } from './operation-add/operation-add.component';
import { PointageArriveeComponent } from './pointage/pointage-arrivee.component';
import { VehiculesArrivesComponent } from './pointage/liste-vehicules-arrives.component';
import {InventaireFormComponent} from './inventaire-vehicule/inventaire-form.component';
import {InventaireListComponent} from './inventaire-vehicule/inventaire-list.component';
import {InventaireDetailComponent} from './inventaire-vehicule/inventaire-detail.component';
import {Parking3dComponent} from './position/parking-3d-visualization.component';
import {CamionSortieFormComponent} from './camion-sortie/camion-sortie-from.component';
import {CamionSortieListComponent} from './camion-sortie/camion-sortie-list.component';
import {CamionSortieDetailComponent} from './camion-sortie/camion-sortie-detail.component';
export const routes: Routes = [
  { path: 'clients', component: ClientListComponent },
  { path: 'clients/new', component: ClientAddComponent },
  { path: 'navires', component: NavireListComponent },
  { path: 'navires/new', component: NavireAddComponent },
  { path: 'operations', component: OperationListComponent },
  { path: 'operations/new', component: OperationAddComponent },
  { path: 'pointage-arrivee', component: PointageArriveeComponent },
  { path: 'vehicules/arrives', component: VehiculesArrivesComponent },

  { path: 'inventaires/nouveau', component: InventaireFormComponent },
  { path: 'inventaires/vehicule/:vehiculeId', component: InventaireListComponent },
  { path: 'inventaires/:id', component: InventaireDetailComponent }, // À créer
  { path: 'parking-3d', component: Parking3dComponent },
  { path: 'camions-sortie', component: CamionSortieListComponent },
  { path: 'camions-sortie/nouveau', component: CamionSortieFormComponent },
  { path: 'camions-sortie/:id', component: CamionSortieDetailComponent },
  { path: 'camions-sortie/:id/modifier', component: CamionSortieFormComponent },
  { path: '', redirectTo: '/clients', pathMatch: 'full' }
];

