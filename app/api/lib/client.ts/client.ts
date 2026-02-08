export const apiClient = {

  async enrollCourse(courseId: string) {
    const response = await fetch('/api/courses/enroll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        courseId,
        availableTime: "10 hours/week", 
        learningStyle: "Visual",      
        deadline: "flexible"           
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to enroll');
    }

    return response.json();
  },

 
  async getEnrolledCourses() {
    const response = await fetch('/api/courses/enrolled');
    if (!response.ok) throw new Error('Failed to fetch enrolled courses');
    return response.json();
  }
};