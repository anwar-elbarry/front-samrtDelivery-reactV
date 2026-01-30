import { Provider } from "../constants";
import type { RoleRespose } from "./role";

export interface UserResponse{
     id: string;
     nom: string;
     prenom: string;
     username: string;
     email: string;
     telephone: string;
     adress: string;
     role: RoleRespose;
     provider: Provider;
     providerId: string;
     enable: boolean;
  }