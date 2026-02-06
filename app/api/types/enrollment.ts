export interface EnrollRequest {
  courseId: number;
}

export interface EnrollmentResponse {
  id: number;
  learnerId: number;
  courseId: number;
  enrolledAt: string;
}
