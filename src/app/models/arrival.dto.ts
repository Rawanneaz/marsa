export interface ArrivalDto {
  numeroIdentification: string;
  marque?: string;
  modele?: string;
  dateArrivee: Date | string;
  portArrivee?: string;
  statut?: string;
  navireId?: number;
  clientId?: number;
  operationId?: number;
  immatriculation?: string;
  annee?: number;
  couleur?: string;
  emplacementLot?: string;
  notes?: string;
  transporteur?: string;
}
