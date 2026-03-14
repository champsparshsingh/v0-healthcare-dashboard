// utils/hypertension-logic.ts
export const detectHypertensionRisk = (systolic: number, diastolic: number) => {
  if (systolic >= 180 || diastolic >= 120) return { risk: "Hypertensive Crisis", color: "text-red-600", level: 4 };
  if (systolic >= 140 || diastolic >= 90) return { risk: "Hypertension Stage 2", color: "text-orange-600", level: 3 };
  if (systolic >= 130 || diastolic >= 80) return { risk: "Hypertension Stage 1", color: "text-yellow-600", level: 2 };
  if (systolic >= 120 && diastolic < 80) return { risk: "Elevated", color: "text-blue-500", level: 1 };
  return { risk: "Normal", color: "text-green-500", level: 0 };
};