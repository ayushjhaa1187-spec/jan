export interface ListNotificationsQuery {
  read?: 'true' | 'false';
  page: number;
  limit: number;
}
