import { BiometricData, RiskAssessment, RiskFactor, ShapValues } from "@/types/health";

export const calculateRiskAssessment = (data: BiometricData, shapValues?: ShapValues): RiskAssessment => {
  // Heart disease risk calculation
  let heartRiskScore = 0;

  // AGE (cutoffs from SHAP dependence: <40, 40–50, 50–60, >60)
  if (data.age > 60) {
    heartRiskScore += 30; // highest contribution
  } else if (data.age > 50) {
    heartRiskScore += 20;
  } else if (data.age > 40) {
    heartRiskScore += 10;
  }

  // SYSTOLIC BLOOD PRESSURE (trestbps)
  // SHAP shows clear jumps around 120, 140, 160 mmHg
  if (data.systolicBP > 160) {
    heartRiskScore += 25; // very high BP
  } else if (data.systolicBP > 140) {
    heartRiskScore += 18; // stage 2-ish
  } else if (data.systolicBP > 120) {
    heartRiskScore += 10; // elevated
  }

  // DIASTOLIC BP (kept as a secondary safeguard)
  if (data.diastolicBP > 90 && data.systolicBP <= 120) {
    heartRiskScore += 10;
  }

  // RESTING HEART RATE (same logic as before)
  if (data.heartRate > 100) {
    heartRiskScore += 15;
  } else if (data.heartRate < 50) {
    heartRiskScore += 10;
  }

  // BMI (same bins; SHAP said it’s less important than age/BP, so weights are smaller)
  if (data.bmi > 30) {
    heartRiskScore += 20;
  } else if (data.bmi > 25) {
    heartRiskScore += 10;
  } else if (data.bmi < 18.5) {
    heartRiskScore += 10;
  }

  // SEX – small modifier (keep clinically intuitive, small weight)
  if (data.sex === "male" && data.age > 45) {
    heartRiskScore += 5;
  }

  // SHAP adjustments (local explanation nudges, using safe type checks)
  if (typeof shapValues?.age === "number") {
    heartRiskScore += shapValues.age * 10;
  }
  if (typeof shapValues?.systolicBP === "number") {
    heartRiskScore += shapValues.systolicBP * 8;
  }

  // Clamp to [0, 100]
  heartRiskScore = Math.min(100, Math.max(0, heartRiskScore));

  // Neurological risk calculation
  let neuroRiskScore = 0;

  // Age factor (higher age = higher risk for neurological disorders)
  if (data.age > 70) neuroRiskScore += 35;
  else if (data.age > 60) neuroRiskScore += 25;
  else if (data.age > 50) neuroRiskScore += 15;

  // Blood pressure factor (high BP increases stroke risk)
  if (data.systolicBP > 140) neuroRiskScore += 20;
  else if (data.systolicBP > 130) neuroRiskScore += 10;

  // BMI factor
  if (data.bmi > 30) neuroRiskScore += 15;
  else if (data.bmi < 18.5) neuroRiskScore += 10;

  // Apply SHAP adjustments if provided
  if (shapValues?.age) neuroRiskScore += shapValues.age * 12;
  if (shapValues?.bmi) neuroRiskScore += shapValues.bmi * 8;

  neuroRiskScore = Math.min(100, Math.max(0, neuroRiskScore));

  return {
    heartDisease: {
      risk: heartRiskScore < 30 ? "low" : heartRiskScore < 60 ? "moderate" : "high",
      score: Math.round(heartRiskScore),
    },
    neurologicalDisorders: {
      risk: neuroRiskScore < 30 ? "low" : neuroRiskScore < 60 ? "moderate" : "high",
      score: Math.round(neuroRiskScore),
    },
  };
};

export const generateRiskFactors = (data: BiometricData, shapValues?: ShapValues): RiskFactor[] => {
  return [
    {
      name: "Age",
      value: `${data.age} years`,
      impact: data.age > 60 ? "High" : data.age > 40 ? "Moderate" : "Low",
      description:
        "Age is a significant risk factor for both cardiovascular and neurological conditions. As we age, blood vessels lose elasticity, heart muscle weakens, and the brain becomes more susceptible to degenerative changes. Risk increases substantially after age 60.",
      shapValue: shapValues?.age,
    },
    {
      name: "Blood Pressure",
      value: `${data.systolicBP}/${data.diastolicBP} mmHg`,
      impact: data.systolicBP > 140 || data.diastolicBP > 90 ? "High" : data.systolicBP > 130 ? "Moderate" : "Low",
      description:
        "High blood pressure (hypertension) damages blood vessels throughout the body, including those in the heart and brain. It significantly increases the risk of heart attack, heart failure, stroke, and vascular dementia. Normal BP is below 120/80 mmHg.",
      shapValue: shapValues?.systolicBP,
    },
    {
      name: "Heart Rate",
      value: `${data.heartRate} bpm`,
      impact: data.heartRate > 100 || data.heartRate < 50 ? "Moderate" : "Low",
      description:
        "Resting heart rate reflects cardiovascular fitness. A consistently high heart rate (>100 bpm) may indicate poor cardiovascular health, stress, or underlying conditions. Very low rates (<50 bpm) in non-athletes may suggest heart conduction issues. Normal range is 60-100 bpm.",
      shapValue: shapValues?.heartRate,
    },
    {
      name: "Body Mass Index (BMI)",
      value: data.bmi.toFixed(1),
      impact: data.bmi > 30 || data.bmi < 18.5 ? "High" : data.bmi > 25 ? "Moderate" : "Low",
      description:
        "BMI is a measure of body fat based on height and weight. Obesity (BMI >30) increases risk of heart disease, diabetes, stroke, and certain cancers. Being underweight (BMI <18.5) is also associated with health risks. Healthy range is 18.5-24.9.",
      shapValue: shapValues?.bmi,
    },
    {
      name: "Sex",
      value: data.sex === "male" ? "Male" : "Female",
      impact: data.sex === "male" && data.age > 45 ? "Moderate" : "Low",
      description:
        "Biological sex affects cardiovascular risk. Men typically face higher heart disease risk at younger ages, while women's risk increases after menopause. Hormonal differences, body composition, and lifestyle factors contribute to these variations in risk profiles.",
      shapValue: shapValues?.sex,
    },
  ];
};

export const loadShapValuesFromJson = (jsonData: string): ShapValues | null => {
  try {
    const parsed = JSON.parse(jsonData);
    return {
      age: parsed.age ?? parsed.Age,
      systolicBP: parsed.systolicBP ?? parsed.systolic_bp ?? parsed.SystolicBP,
      diastolicBP: parsed.diastolicBP ?? parsed.diastolic_bp ?? parsed.DiastolicBP,
      heartRate: parsed.heartRate ?? parsed.heart_rate ?? parsed.HeartRate,
      bmi: parsed.bmi ?? parsed.BMI,
      sex: parsed.sex ?? parsed.Sex,
    };
  } catch (error) {
    console.error("Error parsing SHAP values JSON:", error);
    return null;
  }
};
