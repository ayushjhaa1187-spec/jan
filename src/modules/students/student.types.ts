export interface CreateStudentInput {
  adm_no: string;
  name: string;
  email?: string;
  phone?: string;
  classId: string;
}

export interface UpdateStudentInput {
  adm_no?: string;
  name?: string;
  email?: string;
  phone?: string;
  classId?: string;
}

export interface TransferClassInput {
  classId: string;
}

export interface StudentListQuery {
  classId?: string;
  search?: string;
  page?: number;
  limit?: number;
}
