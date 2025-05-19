import {Inventaire} from './inventaire.model';

export interface Degat {
  id: number;
  emplacement: string;
  gravite: 'LEGER' | 'MODERE' | 'GRAVE';
  description?: string;
  inventaire: Inventaire;
}
