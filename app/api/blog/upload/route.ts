import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Create the blogs directory in public if it doesn't exist
const BLOGS_DIR = path.join(process.cwd(), 'public', 'assets', 'blogs');

if (!fs.existsSync(BLOGS_DIR)) {
  fs.mkdirSync(BLOGS_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const blogId = formData.get('blogId') as string | null;

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file size (limit: 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_SIZE) {
      return Response.json({ error: 'File size exceeds the 10MB limit' }, { status: 400 });
    }

    // Validate file type (images only)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/jpg'
    ];

    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'File type not allowed. Only images are allowed.' }, { status: 400 });
    }

    // If blogId is provided, create blog-specific directory
    let blogDir = BLOGS_DIR;
    if (blogId) {
      blogDir = path.join(BLOGS_DIR, blogId);
      if (!fs.existsSync(blogDir)) {
        fs.mkdirSync(blogDir, { recursive: true });
      }
    }

    // Count existing files in the blog directory to generate the next number
    let fileNumber = 1;
    if (blogId) {
      const existingFiles = fs.readdirSync(blogDir);
      const imageFiles = existingFiles.filter(f => f.match(/^\d+\.(jpg|jpeg|png|webp|gif)$/));
      fileNumber = imageFiles.length + 1;
    }

    // Generate filename with number prefix
    const ext = path.extname(file.name) || '.jpg'; // Default to .jpg if no extension
    const fileName = `${fileNumber.toString().padStart(2, '0')}${ext}`;
    const filePath = path.join(blogDir, fileName);

    // Save file using stream to handle large files efficiently
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Return the URL to access the file
    const fileUrl = blogId 
      ? `/assets/blogs/${blogId}/${fileName}`
      : `/assets/blogs/${fileName}`;

    return Response.json({ 
      success: true, 
      url: fileUrl,
      fileName: fileName,
      message: 'Blog image uploaded successfully'
    });
  } catch (error) {
    console.error('Blog image upload error:', error);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}