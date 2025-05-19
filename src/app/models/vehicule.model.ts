export interface Vehicule {
  id: number;
  numeroIdentification: string;
  dateArrivee: Date;
  statut: string;
  marque: string;
  modele: string;
  immatriculation?: string;
  couleur?: string;
  emplacementLot?: string;
  annee?: number;  // Propriété ajoutée

  notes?: string;
  transporteur?: string;
  photoUrl?: string;
}
