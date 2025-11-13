import { useState } from "react";
import { BiometricForm } from "@/components/BiometricForm";
import { RiskAssessmentDisplay } from "@/components/RiskAssessmentDisplay";
import { RiskFactorDetails } from "@/components/RiskFactorDetails";
import { BiometricData, RiskAssessment, RiskFactor, ShapValues } from "@/types/health";
import { calculateRiskAssessment, generateRiskFactors, loadShapValuesFromJson } from "@/utils/riskCalculation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FileJson, Activity } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [shapValues, setShapValues] = useState<ShapValues | null>(null);
  const [shapJsonInput, setShapJsonInput] = useState("");
  const [showShapInput, setShowShapInput] = useState(false);

  const handleBiometricSubmit = (data: BiometricData) => {
    const calculatedAssessment = calculateRiskAssessment(data, shapValues || undefined);
    const factors = generateRiskFactors(data, shapValues || undefined);
    
    setAssessment(calculatedAssessment);
    setRiskFactors(factors);
    
    toast.success("Risk assessment completed successfully");
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleShapValuesLoad = () => {
    if (!shapJsonInput.trim()) {
      toast.error("Please enter SHAP values JSON");
      return;
    }

    const loaded = loadShapValuesFromJson(shapJsonInput);
    if (loaded) {
      setShapValues(loaded);
      setShowShapInput(false);
      toast.success("SHAP values loaded successfully");
    } else {
      toast.error("Invalid JSON format. Please check your input.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Health Risk Assessment</h1>
              <p className="text-muted-foreground">AI-powered cardiovascular and neurological risk analysis</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Biometric Input Form */}
        <BiometricForm onSubmit={handleBiometricSubmit} />

        {/* SHAP Values Section (moved below Biometric Assessment) */}
        <Card className="p-6 shadow-[var(--card-shadow)]">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">SHAP Values (Debugging)</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShapInput(!showShapInput)}
            >
              {showShapInput ? "Hide" : "Load SHAP Values"}
            </Button>
          </div>
          
          {shapValues && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-sm text-success font-medium">SHAP values loaded and applied to risk calculations</p>
            </div>
          )}

          {showShapInput && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shapJson">Paste SHAP Values JSON</Label>
                <Textarea
                  id="shapJson"
                  placeholder='{"age": 0.15, "systolicBP": 0.23, "bmi": -0.12, ...}'
                  className="font-mono text-sm min-h-[120px]"
                  value={shapJsonInput}
                  onChange={(e) => setShapJsonInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Supported keys: age, systolicBP, diastolicBP, heartRate, bmi, sex
                </p>
              </div>
              <Button onClick={handleShapValuesLoad} className="w-full">
                Load SHAP Values
              </Button>
            </div>
          )}
        </Card>

        {/* Results Section */}
        {assessment && (
          <div id="results" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Risk Assessment</h2>
              <p className="text-muted-foreground">
                Based on your biometric data, here are your health risk indicators
              </p>
            </div>

            <RiskAssessmentDisplay assessment={assessment} />
            
            <RiskFactorDetails factors={riskFactors} />
          </div>
        )}

        {/* Info Section */}
        {!assessment && (
          <Card className="p-8 text-center shadow-[var(--card-shadow)]">
            <Activity className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Ready to Assess Your Health Risks?
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enter your biometric data above to receive a comprehensive analysis of your cardiovascular
              and neurological health risks. Our AI-powered system will provide detailed insights into
              how each factor affects your overall health.
            </p>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            This tool is for informational purposes only and does not constitute medical advice.
            Always consult with healthcare professionals for medical decisions.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
