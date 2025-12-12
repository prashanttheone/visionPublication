'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Input,
  Textarea,
  Button,
  Stack,
  Heading,
  Text,
  Badge,
  Separator
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import CloudinaryImageUpload from '@/component/imageUpload/CloudinaryImageUpload';

const MotionBox = motion.create(Box);

interface Book {
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
}

interface Course {
  id: number;
  name: string;
  description: string;
}

interface Semester {
  id: number;
  course_id: number;
  semester_number: number;
  description: string;
}

interface BookCourseMap {
  id?: number;
  book_id?: number;
  course_id: number;
  semester_id: number;
  is_required: boolean;
  is_recommended: boolean;
}

// Form field configuration - DRY approach
const FORM_SECTIONS = {
  basic: {
    title: '📖 Basic Information',
    color: 'blue.600',
    fields: [
      { name: 'name', label: 'Book Name', type: 'text', placeholder: 'Enter book title', required: true, width: 'full' },
      { name: 'author', label: 'Author', type: 'text', placeholder: 'Enter author name', required: true, width: 'full' },
      { name: 'isbn', label: 'ISBN', type: 'text', placeholder: '978-0-12-345678-1', required: true, width: 'half' },
      { name: 'edition', label: 'Edition', type: 'text', placeholder: '3rd Edition', required: false, width: 'half' },
      { name: 'category', label: 'Category', type: 'select', required: false, width: 'full', options: ['Nursing', 'Medical', 'Surgery', 'Pediatrics', 'Pharmacology', 'Anatomy', 'Physiology', 'Pathology'] },
    ]
  },
  description: {
    title: '📝 Description & Media',
    color: 'blue.600',
    fields: [
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter book description', rows: 4 },
    ]
  },
  pricing: {
    title: '💰 Pricing',
    color: 'green.600',
    fields: [
      { name: 'actual_price', label: 'Actual Price', type: 'number', placeholder: '599', required: true, step: '0.01', width: 'half' },
      { name: 'offer_price', label: 'Offer Price', type: 'number', placeholder: '450', required: true, step: '0.01', width: 'half' },
    ]
  },
  stock: {
    title: '📊 Stock & Ratings',
    color: 'purple.600',
    fields: [
      { name: 'stock_quantity', label: 'Stock Quantity', type: 'number', placeholder: '0', width: 'half' },
      { name: 'rating', label: 'Rating (0-5)', type: 'number', placeholder: '4.5', step: '0.1', min: '0', max: '5', width: 'half' },
      { name: 'reviews_count', label: 'Number of Reviews', type: 'number', placeholder: '0', width: 'half' },
      { name: 'in_stock', label: 'In Stock', type: 'select', width: 'half', options: ['Yes', 'No'] },
    ]
  }
};

// Table columns configuration
const TABLE_COLUMNS = [
  { key: 'name', label: 'Name', align: 'left' },
  { key: 'author', label: 'Author', align: 'left' },
  { key: 'isbn', label: 'ISBN', align: 'left' },
  { key: 'category', label: 'Category', align: 'left', isBadge: true },
  { key: 'actual_price', label: 'Actual Price', align: 'right', format: (v: any) => `₹${v}` },
  { key: 'offer_price', label: 'Offer Price', align: 'right', format: (v: any) => `₹${v}`, color: '#22863a', fontWeight: 'bold' },
  { key: 'discount', label: 'Discount', align: 'right', isCalculated: true },
  { key: 'stock_quantity', label: 'Stock', align: 'right', isBadge: true },
  { key: 'rating', label: 'Rating', align: 'left', format: (v: any) => `⭐ ${typeof v === 'number' ? v.toFixed(1) : parseFloat(v).toFixed(1)}` },
];

const initialFormState: Book = {
  name: '', author: '', isbn: '', edition: '', description: '', image_url: '',
  actual_price: 0, offer_price: 0, stock_quantity: 0, in_stock: true,
  rating: 0, reviews_count: 0, category: ''
};

const CustomFormControl = ({ children, ...props }: any) => <Box {...props}>{children}</Box>;
const CustomFormLabel = (props: any) => <Box as="label" fontWeight="bold" mb={2} {...props} />;

export default function ManageBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Book>(initialFormState);
  const [courseMapping, setCourseMapping] = useState<BookCourseMap[]>([
    { course_id: 1, semester_id: 1, is_required: true, is_recommended: false }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'list' | 'form'>('list');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/health');
      const result = await response.json();
      if (result.success) {
        setConnectionError(null);
        return true;
      } else {
        setConnectionError('Database connection failed: ' + result.message);
        return false;
      }
    } catch (error) {
      setConnectionError('Failed to check database connection: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return false;
    }
  }, []);

  const fetchCoursesAndSemesters = useCallback(async () => {
    try {
      const response = await fetch('/api/course?includeSemesters=true');
      const result = await response.json();
      if (result.success) {
        setCourses(result.data || []);
        const allSems: Semester[] = [];
        result.data?.forEach((course: any) => {
          if (course.semesters) {
            allSems.push(...course.semesters);
          }
        });
        setSemesters(allSems);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      const isHealthy = await checkHealth();
      if (!isHealthy) {
        setIsInitialLoading(false);
        return;
      }
      try {
        await fetchCoursesAndSemesters();
        const booksResponse = await fetch('/api/book');
        const booksResult = await booksResponse.json();
        if (booksResult.success) {
          setBooks(booksResult.data || []);
          setConnectionError(null);
        } else {
          setConnectionError('Failed to fetch books: ' + booksResult.error);
        }
      } catch (error) {
        console.error('Error initializing:', error);
        setConnectionError('Error loading data: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setIsInitialLoading(false);
      }
    };
    initializeData();
  }, []);

  const calculateDiscount = useCallback((actual: number, offer: number) => {
    if (actual <= 0) return 0;
    return Math.round(((actual - offer) / actual) * 100);
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter(book =>
      book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [books, searchTerm]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                type === 'number' ? parseFloat(value) || 0 : value
      }));
    },
    []
  );

  const handleCreate = useCallback(async () => {
    if (!formData.name.trim() || !formData.author.trim()) {
      alert('Book name and author are required');
      return;
    }
    if (formData.offer_price > formData.actual_price) {
      alert('Offer price cannot be greater than actual price');
      return;
    }
    setIsLoading(true);
    try {
      const bookData = {
        ...formData,
        image_url: uploadedImageUrl || formData.image_url
      };
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book: bookData, courseMappings: courseMapping })
      });
      const result = await response.json();
      if (result.success) {
        setBooks(prev => [...prev, result.data.book]);
        setFormData(initialFormState);
        setUploadedImageUrl('');
        setCourseMapping([{ course_id: 1, semester_id: 1, is_required: true, is_recommended: false }]);
        setActiveView('list');
        alert('✅ Book created successfully!');
      } else {
        alert('❌ ' + (result.error || 'Failed to create book'));
      }
    } catch (error) {
      alert('❌ ' + (error instanceof Error ? error.message : 'Failed to create book'));
    } finally {
      setIsLoading(false);
    }
  }, [formData, courseMapping, uploadedImageUrl]);

  const handleUpdate = useCallback(async () => {
    if (!editingId) return;
    if (!formData.name.trim() || !formData.author.trim()) {
      alert('Book name and author are required');
      return;
    }
    if (formData.offer_price > formData.actual_price) {
      alert('Offer price cannot be greater than actual price');
      return;
    }
    setIsLoading(true);
    try {
      const bookData = {
        ...formData,
        image_url: uploadedImageUrl || formData.image_url
      };
      const response = await fetch(`/api/book/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book: bookData, courseMappings: courseMapping })
      });
      const result = await response.json();
      if (result.success) {
        setBooks(prev => prev.map(book => book.id === editingId ? result.data.book : book));
        setFormData(initialFormState);
        setUploadedImageUrl('');
        setCourseMapping([{ course_id: 1, semester_id: 1, is_required: true, is_recommended: false }]);
        setIsEditing(false);
        setEditingId(null);
        setActiveView('list');
        alert('✅ Book updated successfully!');
      } else {
        alert('❌ ' + (result.error || 'Failed to update book'));
      }
    } catch (error) {
      alert('❌ ' + (error instanceof Error ? error.message : 'Failed to update book'));
    } finally {
      setIsLoading(false);
    }
  }, [editingId, formData, courseMapping, uploadedImageUrl]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/book/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        setBooks(prev => prev.filter(book => book.id !== id));
        alert('✅ Book deleted successfully!');
      } else {
        alert('❌ ' + (result.error || 'Failed to delete book'));
      }
    } catch (error) {
      alert('❌ ' + (error instanceof Error ? error.message : 'Failed to delete book'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleEdit = useCallback((book: Book) => {
    setFormData(book);
    setUploadedImageUrl('');
    setCourseMapping([{ course_id: 1, semester_id: 1, is_required: true, is_recommended: false }]);
    setEditingId(book.id!);
    setIsEditing(true);
    setActiveView('form');
  }, []);

  const getSemestersForCourse = useCallback((courseId: number) => {
    return semesters.filter(s => s.course_id === courseId);
  }, [semesters]);

  const handleCancel = useCallback(() => {
    setFormData(initialFormState);
    setUploadedImageUrl('');
    setCourseMapping([{ course_id: 1, semester_id: 1, is_required: true, is_recommended: false }]);
    setIsEditing(false);
    setEditingId(null);
    setActiveView('list');
  }, []);

  // Render form field dynamically
  const renderField = (field: any) => {
    const value = formData[field.name as keyof Book] || '';
    
    if (field.type === 'select') {
      return (
        <select
          name={field.name}
          value={String(field.name === 'in_stock' ? (formData.in_stock ? 'Yes' : 'No') : value)}
          onChange={(e) => {
            if (field.name === 'in_stock') {
              setFormData(prev => ({ ...prev, in_stock: e.target.value === 'Yes' }));
            } else {
              handleInputChange(e as any);
            }
          }}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', fontSize: '16px' }}
        >
          <option value="">{field.label}</option>
          {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    
    if (field.type === 'textarea') {
      return (
        <Textarea
          name={field.name}
          value={String(value)}
          onChange={handleInputChange}
          placeholder={field.placeholder}
          rows={field.rows || 4}
        />
      );
    }
    
    return (
      <Input
        name={field.name}
        value={String(value)}
        onChange={handleInputChange}
        placeholder={field.placeholder}
        type={field.type}
        step={field.step}
        min={field.min}
        max={field.max}
      />
    );
  };

  // Render form section
  const renderFormSection = (sectionKey: keyof typeof FORM_SECTIONS) => {
    const section = FORM_SECTIONS[sectionKey];
    return (
      <Box key={sectionKey}>
        <Heading size="sm" mb={4} color={section.color}>
          {section.title}
        </Heading>
        <Stack direction={section.fields.some((f: any) => f.width === 'half') ? 'row' : 'column'} gap={4} mb={4} flexWrap="wrap">
          {section.fields.map((field: any) => (
            <CustomFormControl key={field.name} flex={(field.width as any) === 'half' ? 1 : undefined} mb={(field.width as any) !== 'half' ? 4 : 0}>
              <CustomFormLabel>
                {field.label} {field.required && '*'}
              </CustomFormLabel>
              {renderField(field)}
            </CustomFormControl>
          ))}
        </Stack>
        <Separator />
      </Box>
    );
  };

  // Render table row
  const renderTableRow = (book: Book) => {
    const discount = calculateDiscount(book.actual_price, book.offer_price);
    return (
      <tr key={book.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
        {TABLE_COLUMNS.map(col => {
          let cellValue: any = book[col.key as keyof Book];
          if (col.isCalculated && col.key === 'discount') cellValue = `${discount}%`;
          else if (col.format) cellValue = col.format(cellValue);

          return (
            <td key={col.key} style={{ padding: '12px', textAlign: col.align as any, color: col.color, fontWeight: col.fontWeight }}>
              {col.isBadge ? (
                <Badge colorScheme={col.key === 'stock_quantity' ? (book.stock_quantity > 0 ? 'green' : 'red') : 'blue'}>
                  {col.key === 'stock_quantity' ? book.stock_quantity : (col.key === 'category' ? book.category : cellValue)}
                </Badge>
              ) : cellValue}
            </td>
          );
        })}
        <td style={{ padding: '12px' }}>
          <Stack direction="row" gap={2}>
            <Button size="sm" colorScheme="blue" variant="ghost" onClick={() => handleEdit(book)}>
              ✏️ Edit
            </Button>
            <Button size="sm" colorScheme="red" variant="ghost" onClick={() => handleDelete(book.id!)}>
              🗑️ Delete
            </Button>
          </Stack>
        </td>
      </tr>
    );
  };

  return (
    <Container maxW="100%" py={8}>
      <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box mb={8}>
          <Heading size="lg" mb={2}>📚 Books Management</Heading>
          <Text color="gray.600">Manage your book catalog with complete CRUD operations</Text>
        </Box>

        {connectionError && (
          <Box mb={6} p={4} bg="red.50" borderLeft="4px solid" borderColor="red.500" borderRadius="md">
            <Heading size="sm" color="red.700" mb={2}>⚠️ Connection Error</Heading>
            <Text color="red.600" fontSize="sm">{connectionError}</Text>
          </Box>
        )}

        {activeView === 'list' && (
          <Stack gap={6}>
            {isInitialLoading ? (
              <Box p={8} textAlign="center">
                <Text color="gray.600">Loading books...</Text>
              </Box>
            ) : (
              <Box>
                <Stack direction="row" gap={4} mb={4}>
                  <Input
                    placeholder="Search by name, author, or ISBN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="lg"
                  />
                  <Button colorScheme="green" onClick={() => { setFormData(initialFormState); setIsEditing(false); setActiveView('form'); }}>
                    ➕ Add Book
                  </Button>
                </Stack>

                {filteredBooks.length > 0 ? (
                  <Box overflowX="auto" borderWidth={1} borderColor="gray.200" borderRadius="md">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#f7fafc' }}>
                        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                          {TABLE_COLUMNS.map(col => (
                            <th key={col.key} style={{ padding: '12px', textAlign: col.align as any, fontWeight: 'bold' }}>
                              {col.label}
                            </th>
                          ))}
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBooks.map(book => renderTableRow(book))}
                      </tbody>
                    </table>
                  </Box>
                ) : (
                  <Box p={8} textAlign="center">
                    <Text color="gray.600">
                      {books.length === 0 ? 'No books yet. Create your first book!' : 'No books match your search.'}
                    </Text>
                  </Box>
                )}
              </Box>
            )}
          </Stack>
        )}

        {activeView === 'form' && (
          <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
            <Heading size="md" mb={6}>
              {isEditing ? '✏️ Edit Book' : '➕ Add New Book'}
            </Heading>

            <Stack gap={6} maxW="800px">
              {Object.keys(FORM_SECTIONS).map(key => renderFormSection(key as keyof typeof FORM_SECTIONS))}

              {/* Cloudinary Image Upload */}
              <Box>
                <Heading size="sm" mb={4} color="blue.600">
                  🖼️ Book Cover Image
                </Heading>
                <CloudinaryImageUpload onImageSelect={(secureUrl) => setUploadedImageUrl(secureUrl)} />
                {uploadedImageUrl && (
                  <Text fontSize="sm" color="green.600" mt={3}>
                    ✅ Image URL saved: {uploadedImageUrl.substring(0, 50)}...
                  </Text>
                )}
                {formData.image_url && !uploadedImageUrl && (
                  <Text fontSize="sm" color="gray.600" mt={3}>
                    📋 Current image: {formData.image_url.substring(0, 50)}...
                  </Text>
                )}
              </Box>

              <Separator />

              {formData.actual_price > 0 && (
                <Text fontSize="sm" color="green.600" mt={2}>
                  💡 Discount: {calculateDiscount(formData.actual_price, formData.offer_price)}%
                </Text>
              )}

              <Separator />

              {/* Course Mapping */}
              <Box>
                <Heading size="sm" mb={4} color="orange.600">
                  🎓 Course Mapping
                </Heading>
                <Text fontSize="sm" color="gray.600" mb={4}>
                  Map this book to academic courses, semesters, and specify if it's required or recommended.
                </Text>

                {courseMapping.map((mapping, index) => (
                  <Box key={index} mb={4} p={4} borderWidth={1} borderRadius="md" borderColor="gray.200">
                    <Stack direction="row" gap={4} mb={3}>
                      <CustomFormControl flex={1}>
                        <CustomFormLabel>Course</CustomFormLabel>
                        <select
                          value={mapping.course_id}
                          onChange={(e) => {
                            const newMappings = [...courseMapping];
                            newMappings[index].course_id = parseInt(e.target.value);
                            setCourseMapping(newMappings);
                          }}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', fontSize: '16px' }}
                        >
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                          ))}
                        </select>
                      </CustomFormControl>

                      <CustomFormControl flex={1}>
                        <CustomFormLabel>Semester</CustomFormLabel>
                        <select
                          value={mapping.semester_id}
                          onChange={(e) => {
                            const newMappings = [...courseMapping];
                            newMappings[index].semester_id = parseInt(e.target.value);
                            setCourseMapping(newMappings);
                          }}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', fontSize: '16px' }}
                        >
                          {getSemestersForCourse(mapping.course_id).map(semester => (
                            <option key={semester.id} value={semester.id}>
                              {semester.description || `Semester ${semester.semester_number}`}
                            </option>
                          ))}
                        </select>
                      </CustomFormControl>
                    </Stack>

                    <Stack direction="row" gap={4}>
                      <CustomFormControl>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={mapping.is_required}
                            onChange={(e) => {
                              const newMappings = [...courseMapping];
                              newMappings[index].is_required = e.target.checked;
                              setCourseMapping(newMappings);
                            }}
                          />
                          <span>Required</span>
                        </label>
                      </CustomFormControl>

                      <CustomFormControl>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={mapping.is_recommended}
                            onChange={(e) => {
                              const newMappings = [...courseMapping];
                              newMappings[index].is_recommended = e.target.checked;
                              setCourseMapping(newMappings);
                            }}
                          />
                          <span>Recommended</span>
                        </label>
                      </CustomFormControl>

                      {courseMapping.length > 1 && (
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => setCourseMapping(prev => prev.filter((_, i) => i !== index))}
                        >
                          Remove
                        </Button>
                      )}
                    </Stack>
                  </Box>
                ))}

                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => setCourseMapping(prev => [...prev, { course_id: 1, semester_id: 1, is_required: true, is_recommended: false }])}
                >
                  ➕ Add Another Course Mapping
                </Button>
              </Box>

              <Separator />

              {/* Action Buttons */}
              <Stack direction="row" gap={4} justify="flex-end" pt={4}>
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button colorScheme={isEditing ? 'blue' : 'green'} onClick={isEditing ? handleUpdate : handleCreate} disabled={isLoading}>
                  {isEditing ? '💾 Update Book' : '➕ Create Book'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </MotionBox>
    </Container>
  );
}
