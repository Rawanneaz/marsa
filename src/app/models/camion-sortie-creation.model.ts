export interface CamionSortieCreation {
  matricule: string;
  dateSortie?: Date;
  clientId?: number;
  vehiculeIds: number[];
  notes?: string;
  chauffeur?: string;
}
