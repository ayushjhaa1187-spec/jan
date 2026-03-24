export interface CreateTeacherSubjectInput {
  teacherId: string;
  subjectId: string;
  classId: string;
  orgId: string;
}

export interface TeacherSubjectQuery {
  teacherId?: string;
  subjectId?: string;
  classId?: string;
  orgId?: string;
}
