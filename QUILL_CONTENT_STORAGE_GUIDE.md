# React Quill Editor - Content Storage Guide

## 📋 Overview

This guide explains how to save rich text content from React Quill editor to the database, and retrieve/display it.

---

## 🏗️ Architecture

```
React Quill Editor (Frontend)
    ↓
    Captures HTML content
    ↓
API Endpoint (Backend)
    ↓
    Validates & Sanitizes HTML
    ↓
    Saves to blog_posts.content (TEXT field)
    ↓
Database (PostgreSQL)
    ↓
    Retrieve HTML content
    ↓
React Component
    ↓
    Render with dangerouslySetInnerHTML or html parser
```

---

## 🎯 Content Storage Strategy

### Option 1: Store as HTML (Recommended)
**Best for**: Rich content with formatting, images, code blocks

```javascript
// Quill editor output
const editorContent = "<p>Hello <strong>World</strong></p>";

// Send to API
await fetch('/api/blog/create', {
  method: 'POST',
  body: JSON.stringify({
    title: 'My Blog Post',
    content: editorContent,  // HTML string
    excerpt: 'Plain text summary'
  })
});
```

**SQL Storage**:
```sql
INSERT INTO blog_posts (title, content, excerpt, author_name, is_published)
VALUES (
  'My Blog Post',
  '<p>Hello <strong>World</strong></p>',  -- HTML content
  'Plain text summary',
  'Dr. Author',
  FALSE
);
```

### Option 2: Store as JSON (Quill Delta)
**Best for**: Editing history, undo/redo support

```javascript
// Quill Delta format
const editorDelta = {
  ops: [
    { insert: 'Hello ' },
    { insert: 'World', attributes: { bold: true } },
    { insert: '\n' }
  ]
};

// Send to API
await fetch('/api/blog/create', {
  method: 'POST',
  body: JSON.stringify({
    title: 'My Blog Post',
    content_delta: JSON.stringify(editorDelta),  // Store as JSON
    content_html: quill.root.innerHTML  // Also store HTML for display
  })
});
```

---

## 💾 Backend Implementation (Node.js/Express)

### Create Blog Post Endpoint

```javascript
// routes/blog.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const DOMPurify = require('isomorphic-dompurify'); // For sanitizing HTML

/**
 * POST /api/blog/create
 * Create new blog post with Quill editor content
 */
router.post('/create', async (req, res) => {
  try {
    const {
      title,
      subtitle,
      excerpt,
      content,        // HTML from Quill
      category,
      tags = [],
      imageUrl,
      authorName,
      authorRole,
      authorId,
      isPublished = false
    } = req.body;

    // Validate required fields
    if (!title || !content || !excerpt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Sanitize HTML content (remove scripts, dangerous tags)
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'code', 'pre', 'table',
        'tr', 'th', 'td', 'span', 'div'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'style', 'class', 'target', 'rel']
    });

    // Create URL-friendly slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Generate excerpt if not provided (first 160 chars)
    const finalExcerpt = excerpt || content.replace(/<[^>]*>/g, '').substring(0, 160);

    // Calculate read time (average 200 words per minute)
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    // Prepare query
    const query = `
      INSERT INTO blog_posts (
        slug,
        title,
        subtitle,
        excerpt,
        content,
        category,
        tags,
        image_url,
        author_id,
        author_name,
        author_role,
        read_time,
        is_published,
        created_by,
        published_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      )
      RETURNING id, slug, created_at;
    `;

    const values = [
      slug,
      title,
      subtitle || null,
      finalExcerpt,
      sanitizedContent,
      category || 'General',
      JSON.stringify(tags),
      imageUrl || null,
      authorId || null,
      authorName,
      authorRole || null,
      readTime,
      isPublished,
      authorId || 'admin',
      isPublished ? new Date() : null
    ];

    const result = await db.query(query, values);
    const newPost = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      post: {
        id: newPost.id,
        slug: newPost.slug,
        createdAt: newPost.created_at
      }
    });

  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

/**
 * PUT /api/blog/:id
 * Update blog post content
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      excerpt,
      content,
      category,
      tags = [],
      imageUrl,
      isPublished
    } = req.body;

    // Sanitize HTML content
    const sanitizedContent = DOMPurify.sanitize(content);

    // Calculate read time
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    const query = `
      UPDATE blog_posts SET
        title = COALESCE($1, title),
        subtitle = COALESCE($2, subtitle),
        excerpt = COALESCE($3, excerpt),
        content = COALESCE($4, content),
        category = COALESCE($5, category),
        tags = COALESCE($6, tags),
        image_url = COALESCE($7, image_url),
        read_time = COALESCE($8, read_time),
        is_published = COALESCE($9, is_published),
        published_at = CASE WHEN $9 = TRUE THEN CURRENT_TIMESTAMP ELSE published_at END,
        updated_by = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *;
    `;

    const values = [
      title || null,
      subtitle || null,
      excerpt || null,
      sanitizedContent || null,
      category || null,
      tags.length > 0 ? JSON.stringify(tags) : null,
      imageUrl || null,
      readTime || null,
      isPublished !== undefined ? isPublished : null,
      'admin',
      id
    ];

    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      post: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

/**
 * GET /api/blog/:slug
 * Retrieve blog post by slug
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const query = `
      SELECT * FROM blog_posts
      WHERE slug = $1 AND is_published = TRUE;
    `;

    const result = await db.query(query, [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const post = result.rows[0];

    // Increment view count
    await db.query(
      'UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1',
      [post.id]
    );

    res.json({
      success: true,
      post: {
        ...post,
        tags: JSON.parse(post.tags || '[]')
      }
    });

  } catch (error) {
    console.error('Error retrieving blog post:', error);
    res.status(500).json({ error: 'Failed to retrieve blog post' });
  }
});

module.exports = router;
```

---

## 🎨 Frontend Implementation (React + Next.js)

### 1. Create Blog Editor Component

```typescript
// components/BlogEditor.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, Input, Textarea, Box } from '@chakra-ui/react';

// Dynamically import Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface BlogFormData {
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl: string;
  isPublished: boolean;
}

export default function BlogEditor() {
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    imageUrl: '',
    isPublished: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Quill editor configuration
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'header',
    'list',
    'link', 'image'
  ];

  const handleContentChange = (value: string) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.content.trim()) {
        throw new Error('Content is required');
      }
      if (!formData.excerpt.trim()) {
        throw new Error('Excerpt is required');
      }

      // Send to API
      const response = await fetch('/api/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.length > 0 ? formData.tags.split(',').map(t => t.trim()) : [],
          authorName: 'Dr. Author', // Replace with actual user
          isPublished: false
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save blog post');
      }

      const data = await response.json();
      setMessage(`✅ Blog post created: ${data.post.slug}`);
      
      // Reset form
      setFormData({
        title: '',
        subtitle: '',
        excerpt: '',
        content: '',
        category: '',
        tags: [],
        imageUrl: '',
        isPublished: false
      });

    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} maxW="900px" mx="auto" p={6}>
      <h1>Create Blog Post</h1>

      <Input
        placeholder="Blog Title"
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        mb={4}
        required
      />

      <Input
        placeholder="Subtitle"
        name="subtitle"
        value={formData.subtitle}
        onChange={handleInputChange}
        mb={4}
      />

      <Textarea
        placeholder="Brief excerpt (appears in listings)"
        name="excerpt"
        value={formData.excerpt}
        onChange={handleInputChange}
        mb={4}
        rows={3}
        required
      />

      <Input
        placeholder="Category (e.g., Education, Healthcare)"
        name="category"
        value={formData.category}
        onChange={handleInputChange}
        mb={4}
      />

      <Input
        placeholder="Tags (comma-separated: nursing, technology, education)"
        name="tags"
        value={formData.tags}
        onChange={handleInputChange}
        mb={4}
      />

      <Input
        placeholder="Featured Image URL"
        name="imageUrl"
        value={formData.imageUrl}
        onChange={handleInputChange}
        mb={4}
        type="url"
      />

      <Box mb={4} borderWidth={1} borderRadius="md">
        <p style={{ padding: '10px', backgroundColor: '#f5f5f5', margin: 0 }}>
          Blog Content (HTML from Quill will be stored)
        </p>
        <ReactQuill
          value={formData.content}
          onChange={handleContentChange}
          modules={modules}
          formats={formats}
          theme="snow"
          style={{ height: '400px', marginBottom: '50px' }}
        />
      </Box>

      <Button
        type="submit"
        colorScheme="blue"
        isLoading={isLoading}
        mb={4}
      >
        Save Blog Post (Draft)
      </Button>

      {message && (
        <Box p={4} bg={message.includes('✅') ? 'green.100' : 'red.100'} borderRadius="md">
          {message}
        </Box>
      )}
    </Box>
  );
}
```

### 2. Display Blog Post Component

```typescript
// components/BlogDisplay.tsx
'use client';

import { useEffect, useState } from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  author_name: string;
  published_at: string;
  view_count: number;
}

export default function BlogDisplay({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/blog/${slug}`);
        if (!response.ok) throw new Error('Post not found');
        
        const data = await response.json();
        setPost(data.post);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (isLoading) return <Spinner />;
  if (error) return <Text color="red">{error}</Text>;
  if (!post) return <Text>Post not found</Text>;

  return (
    <Box maxW="800px" mx="auto" p={6}>
      <h1>{post.title}</h1>
      <Text color="gray.600" fontSize="sm">
        By {post.author_name} | {post.view_count} views
      </Text>

      {/* ✅ RENDER HTML CONTENT SAFELY */}
      <Box
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
        css={{
          '& p': { marginBottom: '1rem', lineHeight: '1.6' },
          '& h1, & h2, & h3': { marginTop: '1.5rem', marginBottom: '0.5rem' },
          '& img': { maxWidth: '100%', height: 'auto' },
          '& code': { backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' },
          '& pre': { backgroundColor: '#f5f5f5', padding: '1rem', overflow: 'auto' }
        }}
      />
    </Box>
  );
}
```

---

## 📦 Installation

### Install React Quill

```bash
npm install react-quill quill
npm install isomorphic-dompurify  # For sanitizing HTML
```

### Database Setup

```bash
# Execute migration
psql -U postgres -d vision_publications -f migrations/013_blog_posts.sql
```

---

## ✅ Key Points

| Aspect | Detail |
|--------|--------|
| **Storage** | Store HTML content in `blog_posts.content` TEXT field |
| **Sanitization** | Always sanitize user input to prevent XSS |
| **Excerpt** | Keep plain text excerpt for listings (no HTML) |
| **Tags** | Use JSON array for flexible filtering |
| **Read Time** | Calculate from word count (~200 words/minute) |
| **Display** | Use `dangerouslySetInnerHTML` with sanitized content |
| **Updates** | Support draft and publish workflows |
| **Comments** | Link to `blog_comments` table for discussions |

---

## 🔒 Security Best Practices

✅ **DO**:
- Sanitize all HTML input
- Validate on both frontend and backend
- Escape output when displaying
- Limit allowed HTML tags
- Use HTTPS for API calls
- Validate file uploads for images

❌ **DON'T**:
- Store unsanitized user input
- Trust client-side validation alone
- Allow script tags in content
- Store sensitive data in HTML
- Skip CSRF token validation

---

## 📊 Example Data Flow

```
1. User writes blog in React Quill
   ↓ Editor captures rich HTML
   <p>Hello <strong>World</strong></p>
   
2. User clicks "Save"
   ↓ Frontend sends to API
   POST /api/blog/create
   { content: "<p>Hello <strong>World</strong></p>" }
   
3. Backend processes
   ↓ Sanitizes & validates
   ✓ Removes scripts, dangerous tags
   
4. Database stores
   ↓ Saves HTML in TEXT field
   INSERT INTO blog_posts ... content = '<p>Hello <strong>World</strong></p>'
   
5. Reader visits blog
   ↓ API retrieves HTML
   GET /api/blog/my-post
   
6. Frontend renders
   ↓ Displays HTML safely
   <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
   
7. Browser renders formatted content
   ↓ User sees rich formatting
   "Hello World" (with bold on World)
```

---

## 🎓 Additional Resources

- [React Quill Documentation](https://quilljs.com/docs/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [PostgreSQL JSONB Guide](https://www.postgresql.org/docs/current/datatype-json.html)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**Last Updated**: 2025-12-11  
**Database**: PostgreSQL 12+  
**Framework**: Next.js 16 + React 18
