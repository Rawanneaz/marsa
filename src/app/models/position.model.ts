// position.model.ts
export interface Position {
  id: number;
  niveau: number;
  x: number;
  y: number;
  statut: 'DISPONIBLE' | 'OCCUPEE' | 'RESERVEE' | 'MAINTENANCE';
  vehiculeId?: number;
  vehiculeNumeroIdentification?: string;
}
