export enum ModuleStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export interface UpdateProgressRequest {
  moduleId: number;
  status: ModuleStatus;
  progressDetails?: Record<string, any>;
}

export interface ModuleProgressResponse {
  id: number;
  enrollmentId: number;
  moduleId: number;
  status: ModuleStatus;
  progressDetails?: Record<string, any> | null;
  updatedAt: string;
}
