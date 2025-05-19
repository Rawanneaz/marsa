export interface VehiculeArrivee {
  id: number;
  numeroIdentification: string;
  dateArrivee: Date;
  statut: string;
  marque?: string;
  modele?: string;
  immatriculation?: string;
  annee?: number;
  couleur?: string;
  emplacementLot?: string;
  notes?: string;
  transporteur?: string;
  photoUrl?: string;

}
