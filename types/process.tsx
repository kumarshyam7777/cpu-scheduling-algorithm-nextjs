export interface Process {
  id: string;
  arrival: number;
  burst: number;
  priority?: number;
}