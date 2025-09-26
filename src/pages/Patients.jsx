import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStatus } from '../api/mockApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Patients() {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getStatus();
        setBeds(data);
      } catch (error) {
        console.error("Failed to fetch status:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusVariant = (fluidBag) => {
    const percentage = (fluidBag.current_level_ml / fluidBag.capacity_ml) * 100;
    const lowThreshold = (fluidBag.threshold_low / fluidBag.capacity_ml) * 100;
    if (percentage < lowThreshold) return "destructive";
    if (percentage < lowThreshold + 10) return "secondary";
    return "default";
  };

  if (loading) {
    return <div>Loading patients...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">All Patients</h1>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Bed</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Fluid Type</TableHead>
              <TableHead className="text-right">Current Level</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {beds.map(({ id, patient, bed_number, ward, fluidBag }) => (
              <TableRow key={id}>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{bed_number}</TableCell>
                <TableCell>{ward.name}</TableCell>
                <TableCell>{fluidBag.type}</TableCell>
                <TableCell className="text-right">{fluidBag.current_level_ml.toFixed(0)} / {fluidBag.capacity_ml} mL</TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusVariant(fluidBag)}>
                    {getStatusVariant(fluidBag) === 'destructive' ? 'Critical' : 'Normal'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link to={`/patient/${id}`}>
                    <Button variant="outline" size="sm">View History</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
export default Patients;