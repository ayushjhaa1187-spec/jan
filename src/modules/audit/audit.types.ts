export interface AuditListQuery {
  userId?: string;
  action?: string;
  entity?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}
