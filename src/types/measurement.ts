export type ModelGender = 'male' | 'female' | 'other';

export interface MeasurementPoint {
  id: string;
  label: string;
  color: string;
  number: number;
  default: number;
  unit?: 'in' | 'cm';
  position?: [number, number, number];
}

export interface MannequinModelProps {
  gender?: ModelGender;
  wireframe?: boolean;
  color?: string;
  highlightedPart?: string | null;
}

export interface MeasurementRecord {
  id: string;
  customerId: string;
  profileName: string;
  gender: ModelGender;
  garmentType: string;
  values: Record<string, number>;
  unit: 'in' | 'cm';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
