/**
 * Blog Data Types & Interfaces
 * Used for both frontend (static data) and backend (database models)
 */

/**
 * Blog Post Interface
 * Represents a single blog post/article
 */
export interface BlogPost {
  id: number;
  slug: string;           // URL-friendly identifier
  title: string;
  subtitle?: string;
  excerpt: string;        // Plain text summary for listings
  content: string;        // HTML from Quill editor
  image: string;          // Featured image URL
  author: string;
  authorRole: string;
  date: string;           // ISO format: YYYY-MM-DD
  category: string;
  readTime: number;       // Minutes to read
  tags: string[];         // Array of tags
  
  // Database specific fields (optional for frontend)
  authorId?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

/**
 * Blog Comment Interface
 */
export interface BlogComment {
  id: number;
  blogPostId: number;
  userId?: string;
  parentCommentId?: number;
  authorName: string;
  authorEmail: string;
  content: string;
  isApproved: boolean;
  isSpam: boolean;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Blog Rating Interface
 */
export interface BlogRating {
  id: number;
  blogPostId: number;
  userId: string;
  rating: number; // 1-5 stars
  createdAt: string;
  updatedAt: string;
}

/**
 * Blog Create/Update Request Payload
 */
export interface CreateBlogPostRequest {
  title: string;
  subtitle?: string;
  excerpt: string;        // Plain text summary
  content: string;        // HTML from Quill editor
  category: string;
  tags?: string[];
  imageUrl?: string;
  authorName: string;
  authorRole?: string;
  authorId?: string;
  isPublished?: boolean;
}

/**
 * Blog API Response
 */
export interface BlogApiResponse<T> {
  success: boolean;
  message?: string;
  post?: T;
  posts?: T[];
  error?: string;
}

/**
 * React Quill Editor Options
 */
export const QUILL_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image', 'video'],
    ['clean']
  ]
};

export const QUILL_FORMATS = [
  'bold', 'italic', 'underline', 'strike',
  'blockquote', 'code-block',
  'header',
  'list',
  'link', 'image', 'video'
];

/**
 * Blog Categories
 */
export const BLOG_CATEGORIES = [
  'Education',
  'Healthcare',
  'Research',
  'News',
  'Publishing',
  'Career',
  'General'
];

/**
 * Helper: Calculate read time from HTML content
 * @param htmlContent - HTML content from Quill
 * @returns Estimated reading time in minutes
 */
export function calculateReadTime(htmlContent: string): number {
  // Remove HTML tags to get plain text
  const plainText = htmlContent.replace(/<[^>]*>/g, '');
  
  // Count words (average 200 words per minute)
  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
  const readTime = Math.ceil(wordCount / 200);
  
  return Math.max(1, readTime); // Minimum 1 minute
}

/**
 * Helper: Create URL-friendly slug from title
 * @param title - Blog post title
 * @returns URL-friendly slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')      // Remove special characters
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/-+/g, '-')            // Replace multiple hyphens with single
    .trim();
}

/**
 * Helper: Truncate excerpt to specific length
 * @param html - HTML content
 * @param maxLength - Maximum character length
 * @returns Plain text excerpt
 */
export function createExcerpt(html: string, maxLength: number = 160): string {
  const plainText = html.replace(/<[^>]*>/g, ''); // Remove HTML tags
  if (plainText.length <= maxLength) {
    return plainText;
  }
  return plainText.substring(0, maxLength) + '...';
}

/**
 * Helper: Extract first image from HTML content
 * @param html - HTML content
 * @returns First image URL or null
 */
export function extractFirstImage(html: string): string | null {
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const match = html.match(imgRegex);
  return match ? match[1] : null;
}

/**
 * Helper: Sanitize HTML content (basic version)
 * For production, use DOMPurify
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  return sanitized;
}

/**
 * Blog filter options
 */
export interface BlogFilterOptions {
  category?: string;
  tag?: string;
  authorId?: string;
  isPublished?: boolean;
  searchTerm?: string;
  sortBy?: 'recent' | 'popular' | 'trending';
  limit?: number;
  offset?: number;
}

/**
 * Blog list with pagination
 */
export interface BlogListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
