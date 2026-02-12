import * as React from "react";

export interface PatientProfile {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  createdAt: string;
}

interface PatientRegistryContextValue {
  patients: PatientProfile[];
  addPatient: (patient: Omit<PatientProfile, "id" | "createdAt">) => void;
  removePatient: (id: string) => void;
}

const PATIENTS_STORAGE_KEY = "trembao_manual_patients";

const getInitialPatients = () => {
  if (typeof window === "undefined") {
    return [];
  }
  const stored = window.localStorage.getItem(PATIENTS_STORAGE_KEY);
  return stored ? (JSON.parse(stored) as PatientProfile[]) : [];
};

const PatientRegistryContext = React.createContext<PatientRegistryContextValue | undefined>(undefined);

export const PatientRegistryProvider = ({ children }: { children: React.ReactNode }) => {
  const [patients, setPatients] = React.useState<PatientProfile[]>(() => getInitialPatients());

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
  }, [patients]);

  const addPatient = (patient: Omit<PatientProfile, "id" | "createdAt">) => {
    setPatients((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...patient,
      },
    ]);
  };

  const removePatient = (id: string) => {
    setPatients((prev) => prev.filter((patient) => patient.id !== id));
  };

  const value = React.useMemo(
    () => ({
      patients,
      addPatient,
      removePatient,
    }),
    [patients],
  );

  return <PatientRegistryContext.Provider value={value}>{children}</PatientRegistryContext.Provider>;
};

export const usePatientRegistry = () => {
  const context = React.useContext(PatientRegistryContext);
  if (!context) {
    throw new Error("usePatientRegistry must be used within PatientRegistryProvider");
  }
  return context;
};