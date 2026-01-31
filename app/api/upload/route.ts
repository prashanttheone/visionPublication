import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Create the assets directory in public if it doesn't exist
const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets');
const ERESOURCES_DIR = path.join(ASSETS_DIR, 'eresources');

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

if (!fs.existsSync(ERESOURCES_DIR)) {
  fs.mkdirSync(ERESOURCES_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file size (limit: 50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return Response.json({ error: 'File size exceeds the 50MB limit' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/epub+zip'
    ];

    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'File type not allowed' }, { status: 400 });
    }

    // Generate a unique filename
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.name}`;
    const filePath = path.join(ERESOURCES_DIR, fileName);

    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Return the URL to access the file
    const fileUrl = `/assets/eresources/${fileName}`;

    return Response.json({ 
      success: true, 
      url: fileUrl,
      fileName: fileName,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}