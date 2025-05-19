export interface Operation {
  id?: number;
  dateOperation: Date | string;
  connaissementsCount: number;
  carCount: number;
  navire: {
    id?: number;
    name?: string;
    numeroEscale?: string;
  };
  client: {
    id?: number;
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
  };
}
