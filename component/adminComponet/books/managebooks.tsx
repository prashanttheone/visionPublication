'use client';

import { useState, useCallback, useMemo } from 'react';
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
import { HiPencil, HiTrash, HiPlus } from 'react-icons/hi2';

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

const initialFormState: Book = {
  name: '',
  author: '',
  isbn: '',
  edition: '',
  description: '',
  image_url: '',
  actual_price: 0,
  offer_price: 0,
  stock_quantity: 0,
  in_stock: true,
  rating: 0,
  reviews_count: 0,
  category: ''
};

const FormControl = ({ children, isRequired, ...props }: any) => (
  <Box {...props}>
    {children}
  </Box>
);
const FormLabel = (props: any) => <Box as="label" fontWeight="bold" mb={2} {...props} />;

export default function ManageBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: 'BSc Nursing', description: 'Bachelor of Science in Nursing' },
    { id: 2, name: 'GNM', description: 'General Nursing & Midwifery' },
    { id: 3, name: 'Post Basic BSc Nursing', description: 'Post Basic Bachelor of Science in Nursing' }
  ]);
  const [semesters, setSemesters] = useState<Semester[]>([
    // BSc Nursing Semesters
    { id: 1, course_id: 1, semester_number: 1, description: '1st Year 1st Semester' },
    { id: 2, course_id: 1, semester_number: 2, description: '1st Year 2nd Semester' },
    { id: 3, course_id: 1, semester_number: 3, description: '2nd Year 1st Semester' },
    { id: 4, course_id: 1, semester_number: 4, description: '2nd Year 2nd Semester' },
    { id: 5, course_id: 1, semester_number: 5, description: '3rd Year 1st Semester' },
    { id: 6, course_id: 1, semester_number: 6, description: '3rd Year 2nd Semester' },
    { id: 7, course_id: 1, semester_number: 7, description: '4th Year 1st Semester' },
    { id: 8, course_id: 1, semester_number: 8, description: '4th Year 2nd Semester' },
    // GNM Semesters
    { id: 9, course_id: 2, semester_number: 1, description: '1st Year 1st Semester' },
    { id: 10, course_id: 2, semester_number: 2, description: '1st Year 2nd Semester' },
    { id: 11, course_id: 2, semester_number: 3, description: '2nd Year 1st Semester' },
    { id: 12, course_id: 2, semester_number: 4, description: '2nd Year 2nd Semester' },
    { id: 13, course_id: 2, semester_number: 5, description: '3rd Year 1st Semester' },
    { id: 14, course_id: 2, semester_number: 6, description: '3rd Year 2nd Semester' },
    // Post Basic BSc Nursing Semesters
    { id: 15, course_id: 3, semester_number: 1, description: '1st Year 1st Semester' },
    { id: 16, course_id: 3, semester_number: 2, description: '1st Year 2nd Semester' }
  ]);
  const [bookCourseMaps, setBookCourseMaps] = useState<BookCourseMap[]>([]);
  const [formData, setFormData] = useState<Book>(initialFormState);
  const [courseMapping, setCourseMapping] = useState<BookCourseMap[]>([
    { course_id: 1, semester_id: 1, is_required: true, is_recommended: false }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'list' | 'form'>('list');

  /**
   * Calculate discount percentage
   */
  const calculateDiscount = useCallback((actual: number, offer: number) => {
    if (actual <= 0) return 0;
    return Math.round(((actual - offer) / actual) * 100);
  }, []);

  /**
   * Filter books based on search term
   */
  const filteredBooks = useMemo(() => {
    return books.filter(book =>
      book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [books, searchTerm]);

  /**
   * Handle input change
   */
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

  /**
   * Create new book
   */
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
      // API call would go here
      // const response = await fetch('/api/books', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ book: formData, courseMappings: courseMapping })
      // });

      // For now, just add to local state
      const newBook: Book = {
        ...formData,
        id: books.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setBooks(prev => [...prev, newBook]);
      setFormData(initialFormState);
      setCourseMapping([{ course_id: 1, semester_id: 1, is_required: true, is_recommended: false }]);
      setActiveView('list');
      alert('Book created successfully');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create book');
    } finally {
      setIsLoading(false);
    }
  }, [formData, books.length, courseMapping]);

  /**
   * Update existing book
   */
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
      // API call would go here
      // const response = await fetch(`/api/books/${editingId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ book: formData, courseMappings: courseMapping })
      // });

      setBooks(prev =>
        prev.map(book =>
          book.id === editingId
            ? { ...formData, id: editingId, updated_at: new Date().toISOString() }
            : book
        )
      );
      
      setFormData(initialFormState);
      setCourseMapping([{ course_id: 1, semester_id: 1, is_required: true, is_recommended: false }]);
      setIsEditing(false);
      setEditingId(null);
      setActiveView('list');
      alert('Book updated successfully');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update book');
    } finally {
      setIsLoading(false);
    }
  }, [editingId, formData, courseMapping]);

  /**
   * Delete book
   */
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    setIsLoading(true);
    try {
      // API call would go here
      // const response = await fetch(`/api/books/${id}`, {
      //   method: 'DELETE'
      // });

      setBooks(prev => prev.filter(book => book.id !== id));
      alert('Book deleted successfully');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete book');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Edit book
   */
  const handleEdit = useCallback((book: Book) => {
    setFormData(book);
    // In a real app, we would fetch the existing course mappings for this book
    // For now, we'll just use a default mapping
    setCourseMapping([{ course_id: 1, semester_id: 1, is_required: true, is_recommended: false }]);
    setEditingId(book.id!);
    setIsEditing(true);
    setActiveView('form');
  }, []);

  /**
   * Handle course mapping change
   */
  const handleCourseMappingChange = useCallback((index: number, field: keyof BookCourseMap, value: any) => {
    setCourseMapping(prev => {
      const newMappings = [...prev];
      newMappings[index] = { ...newMappings[index], [field]: value };
      return newMappings;
    });
  }, []);

  /**
   * Add new course mapping
   */
  const handleAddCourseMapping = useCallback(() => {
    setCourseMapping(prev => [
      ...prev,
      { course_id: 1, semester_id: 1, is_required: true, is_recommended: false }
    ]);
  }, []);

  /**
   * Remove course mapping
   */
  const handleRemoveCourseMapping = useCallback((index: number) => {
    setCourseMapping(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Get semesters for a specific course
   */
  const getSemestersForCourse = useCallback((courseId: number) => {
    return semesters.filter(s => s.course_id === courseId);
  }, [semesters]);

  /**
   * Cancel editing
   */
  const handleCancel = useCallback(() => {
    setFormData(initialFormState);
    setCourseMapping([{ course_id: 1, semester_id: 1, is_required: true, is_recommended: false }]);
    setIsEditing(false);
    setEditingId(null);
    setActiveView('list');
  }, []);

  return (
    <Container maxW="100%" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box mb={8}>
          <Heading size="lg" mb={2}>
            📚 Books Management
          </Heading>
          <Text color="gray.600">
            Manage your book catalog with complete CRUD operations
          </Text>
        </Box>

        {/* List View */}
        {activeView === 'list' && (
          <Stack gap={6}>
            {/* Search and Add Button */}
            <Stack direction="row" gap={4}>
              <Input
                placeholder="Search by name, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="lg"
              />
              <Button
                colorScheme="green"
                onClick={() => {
                  setFormData(initialFormState);
                  setIsEditing(false);
                  setActiveView('form');
                }}
              >
                ➕ Add Book
              </Button>
            </Stack>

            {/* Books Table */}
            {filteredBooks.length > 0 ? (
              <Box overflowX="auto" borderWidth={1} borderColor="gray.200" borderRadius="md">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f7fafc' }}>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Author</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>ISBN</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Category</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Actual Price</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Offer Price</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Discount</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Stock</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Rating</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map(book => (
                      <tr key={book.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{book.name}</td>
                        <td style={{ padding: '12px' }}>{book.author}</td>
                        <td style={{ padding: '12px', fontSize: '12px' }}>{book.isbn}</td>
                        <td style={{ padding: '12px' }}>
                          <Badge colorScheme="blue">{book.category}</Badge>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>₹{book.actual_price}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#22863a', fontWeight: 'bold' }}>
                          ₹{book.offer_price}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {calculateDiscount(book.actual_price, book.offer_price)}%
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <Badge colorScheme={book.stock_quantity > 0 ? 'green' : 'red'}>
                            {book.stock_quantity}
                          </Badge>
                        </td>
                        <td style={{ padding: '12px' }}>⭐ {book.rating.toFixed(1)}</td>
                        <td style={{ padding: '12px' }}>
                          <Stack direction="row" gap={2}>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => handleEdit(book)}
                            >
                              ✏️ Edit
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDelete(book.id!)}
                            >
                              🗑️ Delete
                            </Button>
                          </Stack>
                        </td>
                      </tr>
                    ))}
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
          </Stack>
        )}

        {/* Form View */}
        {activeView === 'form' && (
          <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
            <Heading size="md" mb={6}>
              {isEditing ? '✏️ Edit Book' : '➕ Add New Book'}
            </Heading>

            <Stack gap={6} maxW="800px">
              {/* Basic Information */}
              <Box>
                <Heading size="sm" mb={4} color="blue.600">
                  📖 Basic Information
                </Heading>
                
                <FormControl isRequired mb={4}>
                  <FormLabel>Book Name *</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter book title"
                    size="lg"
                  />
                </FormControl>

                <FormControl isRequired mb={4}>
                  <FormLabel>Author *</FormLabel>
                  <Input
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="Enter author name"
                    size="lg"
                  />
                </FormControl>

                <Stack direction="row" gap={4} mb={4}>
                  <FormControl isRequired flex={1}>
                    <FormLabel>ISBN</FormLabel>
                    <Input
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleInputChange}
                      placeholder="978-0-12-345678-1"
                    />
                  </FormControl>

                  <FormControl flex={1}>
                    <FormLabel>Edition</FormLabel>
                    <Input
                      name="edition"
                      value={formData.edition}
                      onChange={handleInputChange}
                      placeholder="3rd Edition"
                    />
                  </FormControl>
                </Stack>

                <FormControl mb={4}>
                  <FormLabel>Category</FormLabel>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e0',
                      fontSize: '16px'
                    }}
                  >
                    <option value="">Select Category</option>
                    <option value="Nursing">Nursing</option>
                    <option value="Medical">Medical</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Pharmacology">Pharmacology</option>
                    <option value="Anatomy">Anatomy</option>
                    <option value="Physiology">Physiology</option>
                    <option value="Pathology">Pathology</option>
                  </select>
                </FormControl>
              </Box>

              <Separator />

              {/* Description & Image */}
              <Box>
                <Heading size="sm" mb={4} color="blue.600">
                  📝 Description & Media
                </Heading>

                <FormControl mb={4}>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter book description"
                    rows={4}
                  />
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Image URL</FormLabel>
                  <Input
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://images.example.com/book.jpg"
                    type="url"
                  />
                </FormControl>
              </Box>

              <Separator />

              {/* Pricing */}
              <Box>
                <Heading size="sm" mb={4} color="green.600">
                  💰 Pricing
                </Heading>

                <Stack direction="row" gap={4}>
                  <FormControl isRequired flex={1}>
                    <FormLabel>Actual Price *</FormLabel>
                    <Input
                      name="actual_price"
                      value={formData.actual_price || ''}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="599"
                      step="0.01"
                    />
                  </FormControl>

                  <FormControl isRequired flex={1}>
                    <FormLabel>Offer Price *</FormLabel>
                    <Input
                      name="offer_price"
                      value={formData.offer_price || ''}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="450"
                      step="0.01"
                    />
                  </FormControl>
                </Stack>
                
                {formData.actual_price > 0 && (
                  <Text fontSize="sm" color="green.600" mt={2}>
                    💡 Discount: {calculateDiscount(formData.actual_price, formData.offer_price)}%
                  </Text>
                )}
              </Box>

              <Separator />

              {/* Stock & Ratings */}
              <Box>
                <Heading size="sm" mb={4} color="purple.600">
                  📊 Stock & Ratings
                </Heading>

                <Stack direction="row" gap={4} mb={4}>
                  <FormControl flex={1}>
                    <FormLabel>Stock Quantity</FormLabel>
                    <Input
                      name="stock_quantity"
                      value={formData.stock_quantity || ''}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="0"
                    />
                  </FormControl>

                  <FormControl flex={1}>
                    <FormLabel>Rating (0-5)</FormLabel>
                    <Input
                      name="rating"
                      value={formData.rating || ''}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="4.5"
                      step="0.1"
                      min="0"
                      max="5"
                    />
                  </FormControl>
                </Stack>

                <Stack direction="row" gap={4} mb={4}>
                  <FormControl flex={1}>
                    <FormLabel>Number of Reviews</FormLabel>
                    <Input
                      name="reviews_count"
                      value={formData.reviews_count || ''}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="0"
                    />
                  </FormControl>

                  <FormControl flex={1}>
                    <FormLabel>In Stock</FormLabel>
                    <select
                      name="in_stock"
                      value={formData.in_stock ? 'true' : 'false'}
                      onChange={(e) => setFormData(prev => ({ ...prev, in_stock: e.target.value === 'true' }))}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e0',
                        fontSize: '16px'
                      }}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </FormControl>
                </Stack>
              </Box>

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
                      <FormControl flex={1}>
                        <FormLabel>Course</FormLabel>
                        <select
                          value={mapping.course_id}
                          onChange={(e) => handleCourseMappingChange(index, 'course_id', parseInt(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e0',
                            fontSize: '16px'
                          }}
                        >
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>
                              {course.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>

                      <FormControl flex={1}>
                        <FormLabel>Semester</FormLabel>
                        <select
                          value={mapping.semester_id}
                          onChange={(e) => handleCourseMappingChange(index, 'semester_id', parseInt(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e0',
                            fontSize: '16px'
                          }}
                        >
                          {getSemestersForCourse(mapping.course_id).map(semester => (
                            <option key={semester.id} value={semester.id}>
                              {semester.description || `Semester ${semester.semester_number}`}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                    </Stack>

                    <Stack direction="row" gap={4}>
                      <FormControl>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={mapping.is_required}
                            onChange={(e) => handleCourseMappingChange(index, 'is_required', e.target.checked)}
                          />
                          <span>Required</span>
                        </label>
                      </FormControl>

                      <FormControl>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={mapping.is_recommended}
                            onChange={(e) => handleCourseMappingChange(index, 'is_recommended', e.target.checked)}
                          />
                          <span>Recommended</span>
                        </label>
                      </FormControl>

                      {courseMapping.length > 1 && (
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleRemoveCourseMapping(index)}
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
                  onClick={handleAddCourseMapping}
                >
                  ➕ Add Another Course Mapping
                </Button>
              </Box>

              <Separator />

              {/* Action Buttons */}
              <Stack direction="row" gap={4} justify="flex-end" pt={4}>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme={isEditing ? 'blue' : 'green'}
                  onClick={isEditing ? handleUpdate : handleCreate}
                  disabled={isLoading}
                >
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
