export interface Applicant {
  applicantID: number;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  contact: string;
  email: string;
  position: string;
  education: string;
  experience: string;
  skills: string[];
  certifications: string[];
  score: number;
  status: string;
  dateApplied: string;
}

export interface User {
  userID: number;
  username: string;
  role: 'Admin' | 'Staff';
  fullName: string;
}

export interface AppConfig {
  EDU_SCORES: Record<string, number>;
  EXP_SCORES: Record<string, number>;
  SKILL_PTS: number;
  CERT_PTS: number;
  QUALIFIED_MIN: number;
  FOR_REVIEW_MIN: number;
  POSITIONS: string[];
  SKILLS_LIST: string[];
  CERTS_LIST: string[];
  POSITION_RELEVANCE: Record<string, { relevant_skills: string[]; relevant_certs: string[] }>;
}
