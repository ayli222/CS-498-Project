export interface BiometricData {
  age: number;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  bmi: number;
  sex: "male" | "female";
}

export interface RiskAssessment {
  heartDisease: {
    risk: "low" | "moderate" | "high";
    score: number;
  };
  neurologicalDisorders: {
    risk: "low" | "moderate" | "high";
    score: number;
  };
}

export interface RiskFactor {
  name: string;
  value: string | number;
  impact: string;
  description: string;
  shapValue?: number;
}

export interface ShapValues {
  age?: number;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  bmi?: number;
  sex?: number;
}
