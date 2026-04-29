export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Option {
  text: string;
}

export interface Question {
  _id?: string;
  id?: string; // Sometimes backend uses id, sometimes _id
  question: string;
  options: Option[];
  correctOption: number;
  points: number;
  timer: number; // in seconds
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  roomCode: string;
  startTime: string; // ISO string
  isPermanent: boolean;
  creator: string | User;
  coHosts?: User[];
  questions?: Question[];
  totalPoints?: number;
  questionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiError {
  errorMessage: string;
  errorCode: string;
}
