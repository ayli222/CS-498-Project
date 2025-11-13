import { Card } from "@/components/ui/card";
import { RiskAssessment } from "@/types/health";
import { Heart, Brain, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskAssessmentDisplayProps {
  assessment: RiskAssessment;
}

export const RiskAssessmentDisplay = ({ assessment }: RiskAssessmentDisplayProps) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-success";
      case "moderate":
        return "text-warning";
      case "high":
        return "text-danger";
      default:
        return "text-muted-foreground";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "low":
        return <CheckCircle2 className="h-8 w-8" />;
      case "moderate":
        return <AlertCircle className="h-8 w-8" />;
      case "high":
        return <AlertTriangle className="h-8 w-8" />;
      default:
        return <AlertCircle className="h-8 w-8" />;
    }
  };

  const getRiskBgColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-success/10";
      case "moderate":
        return "bg-warning/10";
      case "high":
        return "bg-danger/10";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-lg", getRiskBgColor(assessment.heartDisease.risk))}>
            <Heart className={cn("h-8 w-8", getRiskColor(assessment.heartDisease.risk))} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Heart Disease Risk</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn("text-2xl font-bold uppercase", getRiskColor(assessment.heartDisease.risk))}>
                {assessment.heartDisease.risk}
              </span>
              <span className={getRiskColor(assessment.heartDisease.risk)}>{getRiskIcon(assessment.heartDisease.risk)}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className={cn("h-full transition-all duration-500", {
                  "bg-success": assessment.heartDisease.risk === "low",
                  "bg-warning": assessment.heartDisease.risk === "moderate",
                  "bg-danger": assessment.heartDisease.risk === "high",
                })}
                style={{ width: `${assessment.heartDisease.score}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Risk Score: {assessment.heartDisease.score}%</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-lg", getRiskBgColor(assessment.neurologicalDisorders.risk))}>
            <Brain className={cn("h-8 w-8", getRiskColor(assessment.neurologicalDisorders.risk))} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Neurological Risk</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn("text-2xl font-bold uppercase", getRiskColor(assessment.neurologicalDisorders.risk))}>
                {assessment.neurologicalDisorders.risk}
              </span>
              <span className={getRiskColor(assessment.neurologicalDisorders.risk)}>
                {getRiskIcon(assessment.neurologicalDisorders.risk)}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className={cn("h-full transition-all duration-500", {
                  "bg-success": assessment.neurologicalDisorders.risk === "low",
                  "bg-warning": assessment.neurologicalDisorders.risk === "moderate",
                  "bg-danger": assessment.neurologicalDisorders.risk === "high",
                })}
                style={{ width: `${assessment.neurologicalDisorders.score}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Risk Score: {assessment.neurologicalDisorders.score}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
