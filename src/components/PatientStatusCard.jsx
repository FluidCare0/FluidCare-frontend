import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, User, MapPin, Droplets, History } from "lucide-react";

export function PatientStatusCard({ bed }) {
  // Safely access nested fields with fallback values
  const patientName = bed?.patient?.name || "Unknown";
  const bedNumber = bed?.bed_number || "N/A";
  const wardName = bed?.ward?.name || "N/A";
  const fluidBag = bed?.fluidBag || { type: "Unknown", current_level_ml: 0, capacity_ml: 1, threshold_low: 0 };

  const ivFluidLevel = Math.round((fluidBag.current_level_ml / fluidBag.capacity_ml) * 100);
  const lowThresholdPercent = (fluidBag.threshold_low / fluidBag.capacity_ml) * 100;
  const hasCriticalAlert = ivFluidLevel < lowThresholdPercent;

  let progressColorClass = "bg-green-500";
  if (ivFluidLevel < lowThresholdPercent) progressColorClass = "bg-red-500";
  else if (ivFluidLevel < lowThresholdPercent + 10) progressColorClass = "bg-yellow-500";

  return (
    <Card className="w-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg">{patientName}</h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="font-medium">Bed:</span>
                <span className="font-mono bg-secondary px-2 py-0.5 rounded">{bedNumber}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{wardName}</span>
              </div>
            </div>
          </div>
          {hasCriticalAlert && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Critical
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{fluidBag.type} Fluid Level</span>
            </div>
            <span className="text-sm font-mono">{ivFluidLevel}%</span>
          </div>
          <Progress value={ivFluidLevel} indicatorClassName={progressColorClass} className="h-2" />
        </div>
        <Link to={`/patient/${bed.id}`} className="w-full">
          <Button variant="outline" className="w-full flex items-center gap-2">
            <History className="h-4 w-4" />
            View Patient History
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default PatientStatusCard;
