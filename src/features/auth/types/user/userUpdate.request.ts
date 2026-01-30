import type { Provider } from "../constants";

export interface UserUpdateRequest {
  id: string;
  nom: string;
  prenom: string;
  username: string;
  email: string;
  telephone: string;
  adress: string;
  roleId: string;
  provider: Provider;
  providerId: string;
  enable: boolean;
}
