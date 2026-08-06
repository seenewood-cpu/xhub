export interface CropSettings {
  zoom: number;       // 1 = no zoom, 2 = 2x zoom
  offsetX: number;    // -50 to 50 (percentage)
  offsetY: number;    // -50 to 50 (percentage)
}

export interface Video {
  id: number;
  title: string;
  description: string;
  drive_url: string;
  drive_file_id: string;
  thumbnail_url: string;
  category: string;
  category_ids?: number[];
  crop_settings?: CropSettings;
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
  crop_settings?: CropSettings;
}
