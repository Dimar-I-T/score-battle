export interface User {
    username: string;
    score: number;
}

export interface SessionState {
  user: User | null;
  isLoading: boolean;
  token: string | null;
}