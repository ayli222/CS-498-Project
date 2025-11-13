import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BiometricData } from "@/types/health";
import { Activity } from "lucide-react";

interface BiometricFormProps {
  onSubmit: (data: BiometricData) => void;
}

export const BiometricForm = ({ onSubmit }: BiometricFormProps) => {
  const [formData, setFormData] = useState<BiometricData>({
    age: 0,
    systolicBP: 0,
    diastolicBP: 0,
    heartRate: 0,
    bmi: 0,
    sex: "male",
  });
  const [bpInput, setBpInput] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="p-6 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
          <Activity className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Biometric Assessment</h2>
          <p className="text-sm text-muted-foreground">Enter your health data for risk analysis</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="age">Age (years)</Label>
            <Input
              id="age"
              type="number"
              min="1"
              max="120"
              required
              value={formData.age || ""}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex">Sex</Label>
            <Select
              value={formData.sex}
              onValueChange={(value: "male" | "female") => setFormData({ ...formData, sex: value })}
            >
              <SelectTrigger id="sex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bp">Blood Pressure (mmHg)</Label>
            <Input
              id="bp"
              type="text"
              placeholder="120/80"
              required
              value={bpInput}
              pattern="\d{2,3}\/\d{2,3}"
              title="Enter blood pressure in systolic/diastolic format, e.g. 120/80"
              onChange={(e) => {
                const v = e.target.value;
                setBpInput(v);

                const m = v.match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
                if (m) {
                  const s = parseInt(m[1], 10);
                  const d = parseInt(m[2], 10);
                  setFormData({ ...formData, systolicBP: s, diastolicBP: d });
                } else {
                  // if not valid, keep numeric fields at 0 to avoid passing invalid numbers
                  setFormData({ ...formData, systolicBP: 0, diastolicBP: 0 });
                }
              }}
              className="transition-all focus:ring-2 focus:ring-primary font-mono"
            />
            <p className="text-xs text-muted-foreground"></p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
            <Input
              id="heartRate"
              type="number"
              min="40"
              max="200"
              required
              value={formData.heartRate || ""}
              onChange={(e) => setFormData({ ...formData, heartRate: parseInt(e.target.value) || 0 })}
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bmi">BMI</Label>
            <Input
              id="bmi"
              type="number"
              step="0.1"
              min="10"
              max="60"
              required
              value={formData.bmi || ""}
              onChange={(e) => setFormData({ ...formData, bmi: parseFloat(e.target.value) || 0 })}
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
          Analyze Health Risks
        </Button>
      </form>
    </Card>
  );
};
