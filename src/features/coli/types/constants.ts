export const Statut = {
  CREATED: 'CREATED',
  COLLECTED: 'COLLECTED',
  IN_STOCK: 'IN_STOCK',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED'
} as const;

export type Statut = typeof Statut[keyof typeof Statut];

export const Priority = {
  HIGHT: 'HIGHT',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
} as const;

export type Priority = typeof Priority[keyof typeof Priority];