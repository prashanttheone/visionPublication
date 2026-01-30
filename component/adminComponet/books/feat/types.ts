export interface Book {
  id?: number;
  name: string;
  author: string;
  isbn: string;
  edition: string;
  description: string;
  image_url: string;
  actual_price: number;
  offer_price: number;
  stock_quantity: number;
  in_stock: boolean;
  rating: number;
  reviews_count: number;
  category: string;
  created_at?: string;
  updated_at?: string;
  courseMappings?: BookCourseMap[];
}

export interface Course {
  id: number;
  name: string;
  description: string;
  academic_periods?: AcademicPeriod[];
}

export interface AcademicPeriod {
  id: number;
  course_id: number;
  period_number: number;
  period_type: 'SEMESTER' | 'YEAR';
  label: string;
  description: string;
}

export interface BookCourseMap {
  id?: number;
  book_id?: number;
  course_id: number;
  academic_period_id: number;
  is_required: boolean;
  course_name?: string;
  period_label?: string;
  period_type?: string;
}
