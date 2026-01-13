
export interface Environment {
  id: string;
  name: string;
  climate: string;
  temperature: string;
  resources: string;
  challenges: string;
  accent: string;
  bgGradient: string;
}

export interface Trait {
  id: number;
  name: string;
  description: string;
  category: 'Physical' | 'Physiological' | 'Behavioral' | 'Feeding' | 'Reproductive';
  icon: string;
}

export enum GameStep {
  ENVIRONMENT = 'ENVIRONMENT',
  TRAITS = 'TRAITS',
  GENERATION = 'GENERATION',
  RESULT = 'RESULT',
  EVALUATION = 'EVALUATION'
}
