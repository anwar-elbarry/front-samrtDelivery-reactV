export interface RoleRespose {
  id:string;
  roleName:string;
  permissions:PermissionResponse[]
}

export interface PermissionResponse {
  id:string;
  name:string;
}
