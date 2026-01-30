export const Provider = {
  LOCAL: 'LOCAL',
  GOOGLE: 'GOOGLE',
  APPLE: 'APPLE',
  FACEBOOK: 'FACEBOOK',
  OKTA: 'OKTA'
} as const;

export type Provider = typeof Provider[keyof typeof Provider];

export const UserRole = {
  EXPEDITEUR: 'EXPEDITEUR',
  LIVREUR: 'LIVREUR',
  GESTIONNAIRE: 'GESTIONNAIRE',
  DESTINATAIRE: 'DESTINATAIRE',
  CLIENT: 'client'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];
