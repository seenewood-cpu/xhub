export interface Video {
  id: number;
  title: string;
  description: string;
  drive_url: string;
  drive_file_id: string;
  thumbnail_url: string;
  category: string;
  category_ids?: number[];
  view_count: number;
  created_at: string;
}

export interface VideoFormData {
  title: string;
  description?: string;
  drive_url: string;
  thumbnail_url?: string;
  category?: string;
  category_ids?: number[];
}
