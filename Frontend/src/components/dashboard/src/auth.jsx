import React, { createContext, useContext, useState } from "react";

export const mockUsers = {
  admin1: { id: "admin1", name: "Admin User 1", role: "admin" },
  admin2: { id: "admin2", name: "Admin User 2", role: "admin" },

  doc1: { id: "doc1", name: "Dr. Sarah Johnson", role: "doctor", specialization: "Cardiology", patients: ["pat1", "pat2", "pat3"] },
  doc2: { id: "doc2", name: "Dr. Michael Chen", role: "doctor", specialization: "Neurology", patients: ["pat4", "pat5", "pat6"] },
  doc3: { id: "doc3", name: "Dr. Emily Rodriguez", role: "doctor", specialization: "Pediatrics", patients: ["pat7", "pat8", "pat9"] },
  doc4: { id: "doc4", name: "Dr. James Wilson", role: "doctor", specialization: "Orthopedics", patients: ["pat10", "pat11"] },

  pat1: { id: "pat1", name: "John Doe", role: "patient", doctorId: "doc1", age: 45, condition: "Hypertension" },
  pat2: { id: "pat2", name: "Jane Smith", role: "patient", doctorId: "doc1", age: 38, condition: "Diabetes Type 2" },
  pat3: { id: "pat3", name: "Robert Brown", role: "patient", doctorId: "doc1", age: 52, condition: "Arthritis" },
  pat4: { id: "pat4", name: "Maria Garcia", role: "patient", doctorId: "doc2", age: 41, condition: "Migraine" },
  pat5: { id: "pat5", name: "David Kim", role: "patient", doctorId: "doc2", age: 29, condition: "Epilepsy" },
  pat6: { id: "pat6", name: "Lisa Patel", role: "patient", doctorId: "doc2", age: 35, condition: "Multiple Sclerosis" },
  pat7: { id: "pat7", name: "Thomas Wright", role: "patient", doctorId: "doc3", age: 7, condition: "Asthma" },
  pat8: { id: "pat8", name: "Emma Davis", role: "patient", doctorId: "doc3", age: 4, condition: "Ear Infection" },
  pat9: { id: "pat9", name: "Noah Martinez", role: "patient", doctorId: "doc3", age: 12, condition: "Allergies" },
  pat10: { id: "pat10", name: "Olivia Taylor", role: "patient", doctorId: "doc4", age: 58, condition: "Osteoporosis" },
  pat11: { id: "pat11", name: "William Anderson", role: "patient", doctorId: "doc4", age: 65, condition: "Hip Replacement" },

  lab1: { id: "lab1", name: "Lab Tech Smith", role: "lab" },
  lab2: { id: "lab2", name: "Lab Tech Johnson", role: "lab" },

  pharm1: { id: "pharm1", name: "Pharmacist Wilson", role: "pharmacy" },
  pharm2: { id: "pharm2", name: "Pharmacist Brown", role: "pharmacy" },
};

const AuthContext = createContext({
  user: null,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  function login(id) {
    const found = mockUsers[id.trim().toLowerCase()] ?? mockUsers[
      Object.keys(mockUsers).find((k) => mockUsers[k].id === id.trim()) ?? ""
    ];
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  }

  function logout() {
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
