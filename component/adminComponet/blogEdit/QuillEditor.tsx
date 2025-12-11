'use client';

import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import 'quill/dist/quill.snow.css';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function QuillEditor({ value, onChange, placeholder }: QuillEditorProps) {
  const editorRef = useRef<any>(null);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    // Only load Quill on client side
    if (typeof window === 'undefined') return;

    const loadQuill = async () => {
      try {
        // Import Quill library directly
        const { default: Quill } = await import('quill');
        
        if (!editorRef.current || quillRef.current) return;

        // Create a new Quill instance
        quillRef.current = new Quill(editorRef.current, {
          theme: 'snow',
          placeholder: placeholder || 'Start writing your blog post...',
          modules: {
            toolbar: [
              [{ 'bold': true }, { 'italic': true }, { 'underline': true }, { 'strike': true }],
              [{ 'size': ['small', false, 'large', 'huge'] }],
              [{ 'font': [] }],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'align': [] }],
              [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'indent': '-1'}, { 'indent': '+1' }],
              ['blockquote', 'code-block'],
              ['link', 'image', 'video'],
              ['clean']
            ]
          }
        });

        // Set initial value if provided
        if (value) {
          quillRef.current.root.innerHTML = value;
        }

        // Handle text changes
        quillRef.current.on('text-change', () => {
          const html = quillRef.current.root.innerHTML;
          onChange(html);
        });

      } catch (error) {
        console.error('Failed to load Quill editor:', error);
      }
    };

    loadQuill();

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, [onChange, placeholder]);

  // Update content when value prop changes externally
  useEffect(() => {
    if (quillRef.current && value) {
      const currentContent = quillRef.current.root.innerHTML;
      if (currentContent !== value && value) {
        quillRef.current.root.innerHTML = value;
      }
    }
  }, [value]);

  return (
    <Box
      borderWidth={1}
      borderColor="gray.300"
      borderRadius="md"
      overflow="hidden"
      bg="white"
      height="fit-content"
    >
      <div
        ref={editorRef}
        style={{
          height: '500px',
          width: '100%'
        }}
      />
    </Box>
  );
}
