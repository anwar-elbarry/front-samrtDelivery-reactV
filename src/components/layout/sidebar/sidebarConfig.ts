import { UserRole } from '../../../features/auth/types/constants';

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

export interface SidebarSection {
  title?: string;
  items: SidebarMenuItem[];
}

// Define menu items for each role
export const sidebarMenuByRole: Record<string, SidebarSection[]> = {
  // GESTIONNAIRE (Admin/Manager) - Full access
  [UserRole.GESTIONNAIRE]: [
    {
      items: [
        { id: 'colis', label: 'Colis', icon: 'fa-solid fa-box', path: '/dashboard/colis' },
        { id: 'clients', label: 'Clients', icon: 'fa-solid fa-users', path: '/dashboard/clients' },
        { id: 'livreurs', label: 'Livreurs', icon: 'fa-solid fa-truck', path: '/dashboard/livreurs' },
        { id: 'zones', label: 'Zones', icon: 'fa-solid fa-map-location-dot', path: '/dashboard/zones' },
        { id: 'produits', label: 'Produits', icon: 'fa-solid fa-cubes', path: '/dashboard/produits' },
        { id: 'parametres', label: 'Paramètres', icon: 'fa-solid fa-gear', path: '/dashboard/parametres' },
      ],
    },
  ],

  // LIVREUR (Delivery person)
  [UserRole.LIVREUR]: [
    {
      items: [
        { id: 'mes-livraisons', label: 'Mes Livraisons', icon: 'fa-solid fa-truck-fast', path: '/dashboard/mes-livraisons' },
        { id: 'colis-assignes', label: 'Colis Assignés', icon: 'fa-solid fa-box', path: '/dashboard/colis-assignes' },
        { id: 'historique', label: 'Historique', icon: 'fa-solid fa-clock-rotate-left', path: '/dashboard/historique' },
      ],
    },
  ],

  // EXPEDITEUR (Sender)
  [UserRole.EXPEDITEUR]: [
    {
      items: [
        { id: 'mes-colis', label: 'Mes Colis', icon: 'fa-solid fa-box', path: '/dashboard/mes-colis' },
        { id: 'nouveau-colis', label: 'Nouveau Colis', icon: 'fa-solid fa-plus', path: '/dashboard/nouveau-colis' },
        { id: 'suivi', label: 'Suivi', icon: 'fa-solid fa-location-dot', path: '/dashboard/suivi' },
      ],
    },
  ],

  // DESTINATAIRE (Recipient)
  [UserRole.DESTINATAIRE]: [
    {
      items: [
        { id: 'mes-colis', label: 'Mes Colis', icon: 'fa-solid fa-box', path: '/dashboard/mes-colis' },
        { id: 'suivi', label: 'Suivi', icon: 'fa-solid fa-location-dot', path: '/dashboard/suivi' },
      ],
    },
  ],

  // CLIENT
  [UserRole.CLIENT]: [
    {
      items: [
        { id: 'mes-colis', label: 'Mes Colis', icon: 'fa-solid fa-box', path: '/dashboard/mes-colis' },
        { id: 'nouveau-colis', label: 'Nouveau Colis', icon: 'fa-solid fa-plus', path: '/dashboard/nouveau-colis' },
        { id: 'suivi', label: 'Suivi', icon: 'fa-solid fa-location-dot', path: '/dashboard/suivi' },
      ],
    },
  ],
};

// Get menu items for a specific role
export function getMenuForRole(roleName: string): SidebarSection[] {
  return sidebarMenuByRole[roleName] || sidebarMenuByRole[UserRole.CLIENT];
}

// Get role display name
export function getRoleDisplayName(roleName: string): string {
  const roleNames: Record<string, string> = {
    [UserRole.GESTIONNAIRE]: 'Gestionnaire',
    [UserRole.LIVREUR]: 'Livreur',
    [UserRole.EXPEDITEUR]: 'Expéditeur',
    [UserRole.DESTINATAIRE]: 'Destinataire',
    [UserRole.CLIENT]: 'Client',
  };
  return roleNames[roleName] || roleName;
}
