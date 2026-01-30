import type { UserResponse } from "../user/user.response";

export  interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}
