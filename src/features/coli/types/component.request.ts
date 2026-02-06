export interface ColisRequest {
  poids: number;
  villeDestination: string;
  zoneId?: string | null;
  clientExpediteurId: string;
  destinataireId?: string | null;
  priorite?: string | null;
}
