export type Reports = {
  report_id: number;
  report_date: Date;
  comments: string | null;
  house_id: number;
  created_at?: Date;
  updated_at?: Date;
};
