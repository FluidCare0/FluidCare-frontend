import React, { useState, useEffect } from "react";
import api from "../api/api";
import CompleteProfile from "./CompleteProfile";
import PatientStatusCard from "../components/PatientStatusCard";

function Dashboard({ role, onLogin }) {
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [beds, setBeds] = useState([]);

  useEffect(() => {
    checkUserProfile();
    fetchBeds();
  }, []);

  // Fetch user profile
  const checkUserProfile = async () => {
    try {
      const userRes = await api.get("auth/user/");
      setUserData(userRes.data);

      if (userRes.data.name === "empty" || !userRes.data.name) {
        setShowCompleteProfile(true);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bed data with fallback sample data
  const fetchBeds = async () => {
    try {
      const res = await api.get("hospital/beds/"); // Replace with real API
      setBeds(res.data);
    } catch (error) {
      console.warn("Failed to fetch beds, using sample data:", error);

      setBeds([
        {
          id: 1,
          patient: { name: "John Doe" },
          fluidBag: { type: "Saline", current_level_ml: 500, capacity_ml: 1000, threshold_low: 200 },
          bed_number: "A101",
          ward: { name: "ICU" },
        },
        {
          id: 2,
          patient: { name: "Jane Smith" },
          fluidBag: { type: "Ringer", current_level_ml: 300, capacity_ml: 1000, threshold_low: 200 },
          bed_number: "A102",
          ward: { name: "ICU" },
        },
        {
          id: 3,
          patient: { name: "Alice Johnson" },
          fluidBag: { type: "Dextrose", current_level_ml: 800, capacity_ml: 1000, threshold_low: 200 },
          bed_number: "A103",
          ward: { name: "Ward 1" },
        },
      ]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (showCompleteProfile) {
    return <CompleteProfile user={userData} onLogin={onLogin} />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Hospital Dashboard</h1>
        <p className="text-muted-foreground">Patient monitoring and status overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {beds.map((bed) => (
          <PatientStatusCard key={bed.id} bed={bed} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
