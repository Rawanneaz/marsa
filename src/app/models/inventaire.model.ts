export interface Position {
  id: string;
  niveau: number;
  x: number;
  y: number;
  statut: string;
  vehiculeId?: number;
  vehiculeNumeroIdentification?: string;
}
export interface InventaireCreation {
  notesGenerales: string;
  vehiculeId: number;
  changerPosition: boolean;
  accessoires: Accessoire[];
  degats: Degat[];
  positionId?: string; // Critical - this must be included

}

export interface Inventaire {
  id: number;
  dateCreation: Date;
  notesGenerales: string;
  vehiculeId: number;
  position?: Position | null ;  // This is the key change
  accessoires: Accessoire[];
  degats: Degat[];

}

export interface Accessoire {
  id?: number;
  nom: string;
  present: boolean;
  description?: string;
}

export interface Degat {
  id?: number;
  emplacement: string;
  gravite: 'LÉGER' | 'MOYEN' | 'GRAVE';
  description?: string;
}
