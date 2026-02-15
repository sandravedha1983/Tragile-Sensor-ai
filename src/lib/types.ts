export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  avatarUrl: string;
  symptoms: string[];
  riskLevel: 'Low' | 'Medium' | 'Critical';
  urgencyIndex: number;
  assignedDepartment: string;
  waitTime: number; // in minutes
  status: 'Waiting' | 'In Progress' | 'Discharged';
  createdAt: string;
  aiExplanation: string;
  confidence: number;
  topFactors: { factor: string; value: number }[];
  departmentFitScores?: { department: string; score: number }[];
  rerouting_reason?: string;
  compliance_status?: string;
  fairness_warning?: string;
  modelVersion?: string;
  patientUserId?: string;
};

export type AnalyticsData = {
  riskDistribution: { name: string; value: number }[];
  departmentLoad: { name: string; load: number }[];
  incomingPatients: { hour: string; count: number }[];
  urgencyTrend: { date: string; avgUrgency: number }[];
};

export type Doctor = {
  id: string;
  userId: string;
  name: string;
  specialization: string;
  availabilityStatus: 'AvailableAtHospital' | 'AvailableForHomeVisit' | 'NotAvailable' | 'OnBreak';
  locationType: 'Hospital' | 'HomeVisit';
  currentPatientsLoad: number;
  avatarUrl: string;
};

export type HospitalResource = {
  cardiologyBedsAvailable: number;
  emergencySlotsAvailable: number;
  neurologistsOnDuty: number;
  generalPhysiciansAvailable: number;
  icuBedsAvailable: number;
  updatedAt: string;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Doctor' | 'TriageStaff' | 'Patient';
  createdAt: string;
  updatedAt: string;
}

export type Appointment = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string; // ISO string
  timeSlot: string; // e.g. "09:00 AM"
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt: string;
};
