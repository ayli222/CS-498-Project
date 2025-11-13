# Bio Risk Beacon

Bio Risk Beacon is a small single page application that provides a quick, client side health risk assessment for cardiovascular and neurological outcomes based on user provided biometric inputs. It uses a simple, explainable scoring model and supports applying optional SHAP values (feature attributions) to adjust or explain the calculated risk factors.

## Built with

- Vite
- TypeScript
- React
- shadcn-ui (UI primitives)
- Tailwind CSS

## Key features

- Enter biometric data (age, blood pressure, heart rate, BMI, sex) and get an estimated risk score for heart disease and neurological disorders.
- Blood pressure input accepts a combined value in the format `systolic/diastolic` (for example `120/80`). The form parses this into the underlying `systolicBP` and `diastolicBP` values used by the risk model.
- Optional SHAP values: paste a JSON object containing SHAP contributions (e.g. `{"age":0.15,"systolicBP":0.23}`) to apply or display feature attributions.
- Results include a visual risk display and a breakdown of risk factors with SHAP interpretation where available.

## Prerequisites

- Node.js (LTS recommended). This project uses npm for dependency management.

## Run locally (PowerShell)

Open a PowerShell terminal in the project root and run:

```powershell
# Install dependencies
npm install

# Start dev server (Vite)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

The dev server will print a local URL open that in your browser.

## Project structure (quick guide)

- `src/components` — React UI components. Main ones to know:
	- `BiometricForm.tsx` — the input form (includes combined BP input `systolic/diastolic`).
	- `RiskAssessmentDisplay.tsx` — shows the visual risk bars and scores.
	- `RiskFactorDetails.tsx` — expandable details for each factor and SHAP info.
- `src/pages/Index.tsx` — main page wiring the form, SHAP loader, and results display.
- `src/utils/riskCalculation.ts` — the scoring logic and SHAP application.
- `src/types/health.ts` — TypeScript interfaces used across the app.

## Notes for developers

- The BP input is parsed on change and stored into `systolicBP` / `diastolicBP` so the rest of the code continues to use numeric fields.
- SHAP values are optional and can be pasted as JSON in the UI; the keys supported are `age`, `systolicBP`, `diastolicBP`, `heartRate`, `bmi`, and `sex`.
- If you need stricter validation or a separate UI for systolic/diastolic values, edit `src/components/BiometricForm.tsx`.

## Troubleshooting

- If you run into dependency problems after editing `package.json`, try removing `node_modules` and reinstalling:

```powershell
rm -Recurse -Force node_modules; rm -Force package-lock.json; npm install
```

- To check for vulnerabilities reported by npm:

```powershell
npm audit
npm audit fix
```




