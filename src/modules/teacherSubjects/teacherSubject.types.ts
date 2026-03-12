export interface CreateTeacherSubjectInput {
  teacherId: string;
  subjectId: string;
  classId: string;
}

export interface TeacherSubjectQuery {
  teacherId?: string;
  subjectId?: string;
  classId?: string;
}
