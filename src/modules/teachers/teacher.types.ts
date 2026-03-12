export interface CreateTeacherInput {
  userId: string;
  employeeId: string;
  qualification?: string;
  designation?: string;
  phone?: string;
}

export interface UpdateTeacherInput {
  qualification?: string;
  designation?: string;
  phone?: string;
}

export interface AssignClassTeacherInput {
  classId: string;
}

export interface TeacherListQuery {
  page?: number;
  limit?: number;
  search?: string;
}
