export type JobStatus = 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  source: string;
  date_applied: string;
  status: JobStatus;
  notes: string;
}

export interface User {
  username: string;
  email: string;
}

export interface StepInfo {
  number: number;
  title: string;
  description: string;
  status: 'upcoming' | 'current' | 'completed';
}
