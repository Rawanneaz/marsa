import {Vehicule} from './vehicule.model';

export interface CamionSortie {
  id: number;
  matricule: string;
  dateSortie: Date;
  clientId?: number;
  clientNom?: string;
  vehicules: Vehicule[] | null;
  notes?: string;
  chauffeur?: string;
}
