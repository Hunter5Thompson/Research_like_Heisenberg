export interface Paper {
  id: string;
  title: string;
  year: number;
  description: string;
  physicist: PhysicistName;
  collectedAt?: string;
}

export enum PhysicistName {
  Heisenberg = 'Werner Heisenberg',
  Pauli = 'Wolfgang Pauli',
  Schrodinger = 'Erwin Schrödinger',
  Dirac = 'Paul Dirac'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: GroundingSource[];
  isThinking?: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export type ViewMode = 'discover' | 'collection' | 'chat';