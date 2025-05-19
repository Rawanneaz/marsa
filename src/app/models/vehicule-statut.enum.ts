// src/app/models/vehicule-statut.enum.ts
export enum VehiculeStatut {
  ARRIVE = 'ARRIVÉ',
  EN_TRAITEMENT = 'EN_TRAITEMENT',
  EN_ATTENTE = 'EN_ATTENTE',
  GARE = 'GARÉE',  // Note the accent
  LIBERE = 'LIBÉRÉ',
  SORTI = 'SORTI'
}

export function formatStatut(statut: string): string {
  switch (statut) {
    case VehiculeStatut.ARRIVE: return 'Arrivé';
    case VehiculeStatut.EN_TRAITEMENT: return 'En traitement';
    case VehiculeStatut.EN_ATTENTE: return 'En attente';
    case VehiculeStatut.GARE: return 'Garée';
    case VehiculeStatut.LIBERE: return 'Libéré';
    case VehiculeStatut.SORTI: return 'Sorti';
    default: return statut;
  }
}
