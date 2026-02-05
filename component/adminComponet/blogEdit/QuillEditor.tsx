'use client';

import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import 'quill/dist/quill.snow.css';

// Define Quill modules globally to register image handler
let Quill: any = null;

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onImageSelect?: (file: File) => string; // Callback for handling image selection (returns temp URL)
  blogId?: number | null; // Blog ID for image upload
}

export default function QuillEditor({ value, onChange, placeholder, onImageSelect, blogId }: QuillEditorProps) {
  const editorRef = useRef<any>(null);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    // Only load Quill on client side
    if (typeof window === 'undefined') return;

    const loadQuill = async () => {
      try {
        // Import Quill library directly
        const QuillModule = await import('quill');
        Quill = QuillModule.default;
        
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

        // Custom image handler
        quillRef.current.getModule('toolbar').addHandler('image', () => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;

            if (onImageSelect) {
              try {
                // Get temporary URL for preview
                const tempUrl = onImageSelect(file);
                
                // Insert the temporary image URL into the editor
                const range = quillRef.current.getSelection();
                if (range) {
                  quillRef.current.insertEmbed(range.index, 'image', tempUrl);
                }
              } catch (error) {
                console.error('Image selection failed:', error);
              }
            } else {
              // Fallback to base64 if no callback provided
              const reader = new FileReader();
              reader.onload = () => {
                const range = quillRef.current.getSelection();
                if (range) {
                  quillRef.current.insertEmbed(range.index, 'image', reader.result);
                }
              };
              reader.readAsDataURL(file);
            }
          };
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
  }, [onChange, placeholder, onImageSelect]);

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
