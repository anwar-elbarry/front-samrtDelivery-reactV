import type { UserResponse } from "../../auth/types/user/user.response";
import type { Priority, Statut } from "./constants";

// Zone object from API
export interface ZoneModel {
  id?: string;
  nome?: string;
  codePostal?: string;
}

// Livreur (Delivery person) object from API
export interface LivreurModel {
    id: string;
    user: UserResponse;
    vehicule: string;
    zoneAssignee:ZoneModel;
}

export interface ColiModel {
  id?: string;
  description?: string;
  poids?: number;
  statut?: Statut;
  priorite: Priority;
  villeDestination?: string;
  zone?: ZoneModel | string;
  livreur?: LivreurModel | string;
  clientExpediteur?: UserResponse | string;
  destinataire?: UserResponse | string;
}
