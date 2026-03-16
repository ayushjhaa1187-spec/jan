export interface CreateClassInput {
  name: string;
  section: string;
  year: number;
  teacherId?: string;
  orgId: string;
}

export interface UpdateClassInput {
  name?: string;
  section?: string;
  year?: number;
  teacherId?: string;
}
