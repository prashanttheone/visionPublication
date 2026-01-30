'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
import { HiPencil, HiTrash, HiPlus, HiBookOpen, HiDocumentText, HiLink } from 'react-icons/hi2';

const MotionBox = motion.create(Box);

interface Course {
  id: number;
  name: string;
  description: string;
}

interface AcademicPeriod {
  id: number;
  course_id: number;
  period_number: number;
  description: string;
  label?: string;
}

interface EResourceChapter {
  id?: number;
  eresource_book_id?: number;
  chapter_number: number;
  chapter_name: string;
  doc_link?: string;
}

interface EResourceBook {
  id?: number;
  course_id: number;
  academic_period_id: number;
  semester_id?: number; // Keep for backward compatibility during migration
  book_name: string;
  description?: string;
  course_name?: string;
  semester_name?: string;
  chapters?: EResourceChapter[];
}

const FormControl = ({ children, ...props }: any) => <Box {...props}>{children}</Box>;
const FormLabel = (props: any) => <Box as="label" fontWeight="bold" mb={2} {...props} />;

export default function ManageEresources() {
  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [eresources, setEresources] = useState<EResourceBook[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const [activeView, setActiveView] = useState<'list' | 'form'>('list');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [expandedBookId, setExpandedBookId] = useState<number | null>(null);
  
  // Form state
  const [bookFormData, setBookFormData] = useState<EResourceBook>({
    course_id: 0,
    academic_period_id: 0,
    book_name: '',
    description: ''
  });
  const [chapters, setChapters] = useState<EResourceChapter[]>([
    { chapter_number: 1, chapter_name: 'Chapter 1', doc_link: '' }
  ]);

  // Fetch courses and academic periods
  const fetchCoursesAndPeriods = useCallback(async () => {
    try {
      const response = await fetch('/api/course?includePeriods=true');
      const result = await response.json();
      if (result.success) {
        setCourses(result.data || []);
        const allPeriods: AcademicPeriod[] = [];
        result.data?.forEach((course: any) => {
          if (course.academic_periods) {
            allPeriods.push(...course.academic_periods);
          }
        });
        setAcademicPeriods(allPeriods);
        
        // Set default course if available
        if (result.data && result.data.length > 0) {
          setSelectedCourseId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }, []);

  // Fetch e-resources
  const fetchEresources = useCallback(async () => {
    try {
      const response = await fetch('/api/eresource?includeChapters=true');
      const result = await response.json();
      if (result.success) {
        setEresources(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching e-resources:', error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchCoursesAndPeriods();
      await fetchEresources();
      setIsInitialLoading(false);
    };
    init();
  }, []);

  // Get periods for a course
  const getPeriodsForCourse = useCallback((courseId: number) => {
    return academicPeriods.filter(p => p.course_id === courseId);
  }, [academicPeriods]);

  // Get e-resources for a period
  const getEresourcesForPeriod = useCallback((periodId: number) => {
    return eresources.filter(e => (e.academic_period_id || e.semester_id) === periodId);
  }, [eresources]);

  // Handle book form change
  const handleBookChange = useCallback((field: keyof EResourceBook, value: any) => {
    setBookFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-select first period when course changes
      if (field === 'course_id') {
        const coursePeriods = academicPeriods.filter(p => p.course_id === value);
        if (coursePeriods.length > 0) {
          updated.academic_period_id = coursePeriods[0].id;
        }
      }
      return updated;
    });
  }, [academicPeriods]);

  // Handle chapter change
  const handleChapterChange = useCallback((index: number, field: keyof EResourceChapter, value: any) => {
    setChapters(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  // Add chapter
  const handleAddChapter = useCallback(() => {
    setChapters(prev => [
      ...prev,
      { chapter_number: prev.length + 1, chapter_name: `Chapter ${prev.length + 1}`, doc_link: '' }
    ]);
  }, []);

  // Remove chapter
  const handleRemoveChapter = useCallback((index: number) => {
    if (chapters.length <= 1) {
      alert('At least one chapter is required');
      return;
    }
    setChapters(prev => prev.filter((_, i) => i !== index));
  }, [chapters.length]);

  // Create e-resource
  const handleCreate = useCallback(async () => {
    if (!bookFormData.book_name.trim()) {
      alert('Book name is required');
      return;
    }
    if (!bookFormData.course_id || !bookFormData.academic_period_id) {
      alert('Please select course and period/semester');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/eresource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book: bookFormData, chapters })
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchEresources();
        resetForm();
        setActiveView('list');
        alert('✅ E-resource created successfully!');
      } else {
        alert('❌ ' + (result.error || 'Failed to create e-resource'));
      }
    } catch (error) {
      alert('❌ ' + (error instanceof Error ? error.message : 'Failed to create e-resource'));
    } finally {
      setIsLoading(false);
    }
  }, [bookFormData, chapters, fetchEresources]);

  // Update e-resource
  const handleUpdate = useCallback(async () => {
    if (!editingId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/eresource/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book: bookFormData, chapters })
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchEresources();
        resetForm();
        setActiveView('list');
        alert('✅ E-resource updated successfully!');
      } else {
        alert('❌ ' + (result.error || 'Failed to update e-resource'));
      }
    } catch (error) {
      alert('❌ ' + (error instanceof Error ? error.message : 'Failed to update e-resource'));
    } finally {
      setIsLoading(false);
    }
  }, [editingId, bookFormData, chapters, fetchEresources]);

  // Delete e-resource
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this e-resource book?')) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/eresource/${id}`, { method: 'DELETE' });
      const result = await response.json();
      
      if (result.success) {
        await fetchEresources();
        alert('✅ E-resource deleted successfully!');
      } else {
        alert('❌ ' + (result.error || 'Failed to delete e-resource'));
      }
    } catch (error) {
      alert('❌ ' + (error instanceof Error ? error.message : 'Failed to delete e-resource'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchEresources]);

  // Edit e-resource
  const handleEdit = useCallback((book: EResourceBook) => {
    setBookFormData({
      course_id: book.course_id,
      academic_period_id: book.academic_period_id || book.semester_id || 0,
      book_name: book.book_name,
      description: book.description || ''
    });
    setChapters(book.chapters && book.chapters.length > 0 
      ? book.chapters 
      : [{ chapter_number: 1, chapter_name: 'Chapter 1', doc_link: '' }]
    );
    setEditingId(book.id!);
    setIsEditing(true);
    setActiveView('form');
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    const firstCourse = courses[0];
    const firstPeriod = firstCourse ? academicPeriods.find(p => p.course_id === firstCourse.id) : null;
    
    setBookFormData({
      course_id: firstCourse?.id || 0,
      academic_period_id: firstPeriod?.id || 0,
      book_name: '',
      description: ''
    });
    setChapters([{ chapter_number: 1, chapter_name: 'Chapter 1', doc_link: '' }]);
    setIsEditing(false);
    setEditingId(null);
  }, [courses, academicPeriods]);

  // Open new form
  const openNewForm = useCallback(() => {
    resetForm();
    setActiveView('form');
  }, [resetForm]);

  return (
    <Container maxW="100%" py={8}>
      <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <Box mb={8}>
          <Heading size="lg" mb={2}>📚 E-Resources Management</Heading>
          <Text color="gray.600">Manage digital study materials, books, and chapter links</Text>
        </Box>

        {/* List View */}
        {activeView === 'list' && (
          <Stack gap={6}>
            {isInitialLoading ? (
              <Box p={8} textAlign="center">
                <Text color="gray.600">Loading e-resources...</Text>
              </Box>
            ) : (
              <>
                {/* Add Button */}
                <Box>
                  <Button colorScheme="green" onClick={openNewForm}>
                    <HiPlus style={{ marginRight: '8px' }} />
                    Add E-Resource Book
                  </Button>
                </Box>

                {/* Course Tabs */}
                <Stack direction="row" gap={2} wrap="wrap" mb={4}>
                  {courses.map(course => (
                    <Button
                      key={course.id}
                      size="sm"
                      colorScheme={selectedCourseId === course.id ? 'blue' : 'gray'}
                      variant={selectedCourseId === course.id ? 'solid' : 'outline'}
                      onClick={() => setSelectedCourseId(course.id)}
                    >
                      {course.name}
                    </Button>
                  ))}
                </Stack>

                  {/* Academic Periods and E-Resources */}
                  {selectedCourseId && (
                    <Stack gap={4}>
                      {getPeriodsForCourse(selectedCourseId).map(period => {
                        const periodBooks = getEresourcesForPeriod(period.id);
                        
                        return (
                          <Box key={period.id} borderWidth={1} borderRadius="lg" p={4} bg="white">
                            <Heading size="sm" color="purple.600" mb={4}>
                              📖 {period.label} ({period.description})
                            </Heading>
                            
                            {periodBooks.length > 0 ? (
                              <Stack gap={3}>
                                {periodBooks.map(book => (
                                <MotionBox
                                  key={book.id}
                                  p={4}
                                  borderWidth={1}
                                  borderRadius="md"
                                  borderColor="gray.200"
                                  bg="gray.50"
                                  _hover={{ borderColor: 'blue.300' }}
                                >
                                  {/* Book Header */}
                                  <Stack direction="row" justify="space-between" align="center" mb={2}>
                                    <Stack direction="row" align="center" gap={2}>
                                      <HiBookOpen size={20} color="#3182CE" />
                                      <Text fontWeight="bold">{book.book_name}</Text>
                                      <Badge colorScheme="blue">{book.chapters?.length || 0} Chapters</Badge>
                                    </Stack>
                                    <Stack direction="row" gap={2}>
                                      <Button
                                        size="xs"
                                        colorScheme="blue"
                                        variant="outline"
                                        onClick={() => setExpandedBookId(expandedBookId === book.id ? null : book.id!)}
                                      >
                                        {expandedBookId === book.id ? 'Hide' : 'View'} Chapters
                                      </Button>
                                      <Button size="xs" colorScheme="green" variant="ghost" onClick={() => handleEdit(book)}>
                                        <HiPencil />
                                      </Button>
                                      <Button size="xs" colorScheme="red" variant="ghost" onClick={() => handleDelete(book.id!)}>
                                        <HiTrash />
                                      </Button>
                                    </Stack>
                                  </Stack>
                                  
                                  {book.description && (
                                    <Text fontSize="sm" color="gray.600" mb={2}>{book.description}</Text>
                                  )}
                                  
                                  {/* Chapters (Expanded) */}
                                  {expandedBookId === book.id && book.chapters && book.chapters.length > 0 && (
                                    <Box mt={4} p={4} bg="white" borderRadius="md" borderWidth={1}>
                                      <Text fontWeight="bold" mb={3} color="gray.700">
                                        <HiDocumentText style={{ display: 'inline', marginRight: '8px' }} />
                                        Chapters & Doc Links
                                      </Text>
                                      <Stack gap={2}>
                                        {book.chapters.map(chapter => (
                                          <Stack key={chapter.id} direction="row" align="center" justify="space-between" p={2} bg="gray.50" borderRadius="md">
                                            <Text fontSize="sm">
                                              <Badge colorScheme="purple" mr={2}>{chapter.chapter_number}</Badge>
                                              {chapter.chapter_name}
                                            </Text>
                                            {chapter.doc_link ? (
                                              <a
                                                href={chapter.doc_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  padding: '4px 8px',
                                                  fontSize: '12px',
                                                  fontWeight: '600',
                                                  color: 'white',
                                                  backgroundColor: '#319795',
                                                  borderRadius: '4px',
                                                  textDecoration: 'none'
                                                }}
                                              >
                                                <HiLink style={{ marginRight: '4px' }} />
                                                View Doc
                                              </a>
                                            ) : (
                                              <Badge colorScheme="gray">No Link</Badge>
                                            )}
                                          </Stack>
                                        ))}
                                      </Stack>
                                    </Box>
                                  )}
                                </MotionBox>
                              ))}
                            </Stack>
                            ) : (
                              <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                No e-resources for this period yet
                              </Text>
                            )}
                          </Box>
                        );
                      })}
                    </Stack>
                  )}

                {courses.length === 0 && (
                  <Box p={8} textAlign="center" bg="gray.50" borderRadius="md">
                    <Text color="gray.600">No courses available. Please create courses first.</Text>
                  </Box>
                )}
              </>
            )}
          </Stack>
        )}

        {/* Form View */}
        {activeView === 'form' && (
          <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
            <Heading size="md" mb={6}>
              {isEditing ? '✏️ Edit E-Resource Book' : '➕ Add New E-Resource Book'}
            </Heading>

            <Stack gap={6} maxW="800px">
              {/* Book Info Section */}
              <Box>
                <Heading size="sm" mb={4} color="blue.600">📖 Book Information</Heading>
                
                <Stack direction="row" gap={4} mb={4}>
                  <FormControl flex={1}>
                    <FormLabel>Course *</FormLabel>
                    <select
                      value={bookFormData.course_id}
                      onChange={(e) => handleBookChange('course_id', parseInt(e.target.value))}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                    >
                      <option value={0}>Select Course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                      ))}
                    </select>
                  </FormControl>
                  
                    <FormControl flex={1}>
                      <FormLabel>Academic Period *</FormLabel>
                      <select
                        value={bookFormData.academic_period_id || bookFormData.semester_id || 0}
                        onChange={(e) => handleBookChange('academic_period_id', parseInt(e.target.value))}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                      >
                        <option value={0}>Select Period</option>
                        {getPeriodsForCourse(bookFormData.course_id).map(period => (
                          <option key={period.id} value={period.id}>
                            {period.label} ({period.description})
                          </option>
                        ))}
                      </select>
                    </FormControl>
                </Stack>
                
                <FormControl mb={4}>
                  <FormLabel>Book Name *</FormLabel>
                  <Input
                    value={bookFormData.book_name}
                    onChange={(e) => handleBookChange('book_name', e.target.value)}
                    placeholder="e.g., Anatomy Textbook, Nursing Fundamentals"
                  />
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={bookFormData.description}
                    onChange={(e) => handleBookChange('description', e.target.value)}
                    placeholder="Optional description for this e-resource book"
                    rows={2}
                  />
                </FormControl>
              </Box>

              <Separator />

              {/* Chapters Section */}
              <Box>
                <Stack direction="row" justify="space-between" align="center" mb={4}>
                  <Heading size="sm" color="purple.600">📄 Chapters & Doc Links</Heading>
                  <Button size="sm" colorScheme="green" variant="outline" onClick={handleAddChapter}>
                    <HiPlus style={{ marginRight: '4px' }} />
                    Add Chapter
                  </Button>
                </Stack>

                <Stack gap={3}>
                  {chapters.map((chapter, index) => (
                    <Box key={index} p={4} borderWidth={1} borderRadius="md" borderColor="gray.200" bg="gray.50">
                      <Stack direction="row" gap={4} align="flex-end">
                        <FormControl flex={0} minW="80px">
                          <FormLabel fontSize="sm">#</FormLabel>
                          <Input
                            type="number"
                            min={1}
                            value={chapter.chapter_number}
                            onChange={(e) => handleChapterChange(index, 'chapter_number', parseInt(e.target.value) || 1)}
                            bg="white"
                          />
                        </FormControl>
                        
                        <FormControl flex={1}>
                          <FormLabel fontSize="sm">Chapter Name</FormLabel>
                          <Input
                            value={chapter.chapter_name}
                            onChange={(e) => handleChapterChange(index, 'chapter_name', e.target.value)}
                            placeholder="e.g., Introduction, Chapter 1"
                            bg="white"
                          />
                        </FormControl>
                        
                        <FormControl flex={2}>
                          <FormLabel fontSize="sm">Doc Link (URL)</FormLabel>
                          <Input
                            value={chapter.doc_link || ''}
                            onChange={(e) => handleChapterChange(index, 'doc_link', e.target.value)}
                            placeholder="https://drive.google.com/..."
                            bg="white"
                          />
                        </FormControl>
                        
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleRemoveChapter(index)}
                        >
                          <HiTrash />
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>

                <Box mt={4} p={3} bg="blue.50" borderRadius="md">
                  <Text fontSize="sm" color="blue.800">
                    📊 Total Chapters: {chapters.length}
                  </Text>
                </Box>
              </Box>

              <Separator />

              {/* Action Buttons */}
              <Stack direction="row" gap={4} justify="flex-end" pt={4}>
                <Button variant="outline" onClick={() => { resetForm(); setActiveView('list'); }}>
                  Cancel
                </Button>
                <Button
                  colorScheme={isEditing ? 'blue' : 'green'}
                  onClick={isEditing ? handleUpdate : handleCreate}
                  disabled={isLoading}
                >
                  {isEditing ? '💾 Update E-Resource' : '➕ Create E-Resource'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </MotionBox>
    </Container>
  );
}
