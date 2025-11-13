import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskFactor } from "@/types/health";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RiskFactorDetailsProps {
  factors: RiskFactor[];
}

export const RiskFactorDetails = ({ factors }: RiskFactorDetailsProps) => {
  const getShapIcon = (shapValue?: number) => {
    if (!shapValue) return <Minus className="h-4 w-4" />;
    if (shapValue > 0) return <TrendingUp className="h-4 w-4 text-danger" />;
    return <TrendingDown className="h-4 w-4 text-success" />;
  };

  const getShapBadgeVariant = (shapValue?: number) => {
    if (!shapValue) return "secondary";
    if (shapValue > 0) return "destructive";
    return "default";
  };

  return (
    <Card className="p-6 shadow-[var(--card-shadow)]">
      <h3 className="text-xl font-semibold mb-4 text-foreground">Risk Factor Analysis</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Detailed breakdown of how each factor affects your health outcomes
      </p>

      <Accordion type="single" collapsible className="w-full space-y-2">
        {factors.map((factor, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border border-border rounded-lg px-4 data-[state=open]:bg-secondary/30 transition-colors"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{factor.name}</span>
                  {factor.shapValue !== undefined && (
                    <Badge variant={getShapBadgeVariant(factor.shapValue)} className="gap-1">
                      {getShapIcon(factor.shapValue)}
                      SHAP: {factor.shapValue.toFixed(3)}
                    </Badge>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current Value</p>
                  <p className="font-semibold text-foreground">{factor.value}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Impact Level</p>
                  <p className="font-semibold text-foreground">{factor.impact}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Health Impact</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{factor.description}</p>
              </div>
              {factor.shapValue !== undefined && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs font-medium text-primary mb-1">SHAP Value Interpretation</p>
                  <p className="text-xs text-muted-foreground">
                    {factor.shapValue > 0
                      ? "This factor increases your overall risk score. Higher positive values indicate stronger contribution to risk."
                      : "This factor decreases your overall risk score. More negative values indicate stronger protective effect."}
                  </p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
};
