'use client';

import { useState, useCallback, useMemo, useEffect, Fragment } from 'react';
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
import { HiPencil, HiTrash, HiPlus, HiAcademicCap } from 'react-icons/hi2';

const MotionBox = motion.create(Box);

interface Course {
  id?: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

interface Semester {
  id?: number;
  course_id?: number;
  semester_number: number;
  description: string;
  created_at?: string;
  updated_at?: string;
}

const initialCourseState: Course = {
  name: '',
  description: ''
};

const FormControl = ({ children, isRequired, ...props }: any) => (
  <Box {...props}>
    {children}
  </Box>
);
const FormLabel = (props: any) => <Box as="label" fontWeight="bold" mb={2} {...props} />;

export default function ManageCourse() {
  // State Management
  const [courses, setCourses] = useState<Course[]>([]);
  const [allSemesters, setAllSemesters] = useState<Semester[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [courseFormData, setCourseFormData] = useState<Course>(initialCourseState);
  const [semestersForCourse, setSemestersForCourse] = useState<Semester[]>([
    { semester_number: 1, description: '1st Year 1st Semester' },
    { semester_number: 2, description: '1st Year 2nd Semester' }
  ]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'list' | 'form'>('list');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [showSemesters, setShowSemesters] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  /**
   * Check database connection health
   */
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

  /**
   * Fetch all courses on component mount
   */
  useEffect(() => {
    const initializeCourses = async () => {
      // First check health
      const isHealthy = await checkHealth();
      
      if (!isHealthy) {
        setIsInitialLoading(false);
        return;
      }

      // If healthy, fetch courses
      try {
        const response = await fetch('/api/course?includeSemesters=true');
        
        if (!response.ok) {
          console.error('API Error:', response.status, response.statusText);
          setConnectionError(`API Error: ${response.status} ${response.statusText}`);
          setIsInitialLoading(false);
          return;
        }
        
        const result = await response.json();

        if (result.success) {
          setCourses(result.data || []);
          
          // Extract all semesters from courses
          const semesters: Semester[] = [];
          result.data?.forEach((course: any) => {
            if (course.semesters) {
              semesters.push(...course.semesters);
            }
          });
          setAllSemesters(semesters);
          setConnectionError(null);
        } else {
          console.error('Failed to fetch courses:', result.error);
          setConnectionError('Failed to fetch courses: ' + result.error);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setConnectionError('Error fetching courses: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setIsInitialLoading(false);
      }
    };

    initializeCourses();
  }, [checkHealth]);

  /**
   * Filter courses based on search term
   */
  const filteredCourses = useMemo(() => {
    return courses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  /**
   * Get semesters for a specific course
   */
  const getSemestersForCourse = useCallback((courseId: number) => {
    return allSemesters.filter(s => s.course_id === courseId).sort((a, b) => a.semester_number - b.semester_number);
  }, [allSemesters]);

  /**
   * Handle course input change
   */
  const handleCourseInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setCourseFormData(prev => ({ ...prev, [name]: value }));
    },
    []
  );

  /**
   * Handle semester change
   */
  const handleSemesterChange = useCallback((index: number, field: keyof Semester, value: any) => {
    setSemestersForCourse(prev => {
      const newSemesters = [...prev];
      newSemesters[index] = { ...newSemesters[index], [field]: value };
      return newSemesters;
    });
  }, []);

  /**
   * Add new semester
   */
  const handleAddSemester = useCallback(() => {
    const nextSemesterNumber = semestersForCourse.length + 1;
    const year = Math.ceil(nextSemesterNumber / 2);
    const semInYear = nextSemesterNumber % 2 === 0 ? '2nd' : '1st';
    
    setSemestersForCourse(prev => [
      ...prev,
      {
        semester_number: nextSemesterNumber,
        description: `${getOrdinal(year)} Year ${semInYear} Semester`
      }
    ]);
  }, [semestersForCourse]);

  /**
   * Remove semester
   */
  const handleRemoveSemester = useCallback((index: number) => {
    if (semestersForCourse.length <= 1) {
      alert('A course must have at least one semester');
      return;
    }
    setSemestersForCourse(prev => prev.filter((_, i) => i !== index));
  }, [semestersForCourse]);

  /**
   * Get ordinal suffix (1st, 2nd, 3rd, 4th)
   */
  const getOrdinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  /**
   * Create new course
   */
  const handleCreateCourse = useCallback(async () => {
    if (!courseFormData.name.trim()) {
      alert('Course name is required');
      return;
    }

    if (semestersForCourse.length === 0) {
      alert('Please add at least one semester');
      return;
    }

    // Validate semester numbers are sequential
    const semesterNumbers = semestersForCourse.map(s => s.semester_number).sort((a, b) => a - b);
    for (let i = 0; i < semesterNumbers.length; i++) {
      if (semesterNumbers[i] !== i + 1) {
        alert('Semester numbers must be sequential starting from 1');
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course: courseFormData, semesters: semestersForCourse })
      });

      const result = await response.json();

      if (result.success) {
        // Add to local state
        const newCourse = result.data.course;
        const newSemesters = result.data.semesters;

        setCourses(prev => [...prev, newCourse]);
        setAllSemesters(prev => [...prev, ...newSemesters]);

        // Reset form
        setCourseFormData(initialCourseState);
        setSemestersForCourse([
          { semester_number: 1, description: '1st Year 1st Semester' },
          { semester_number: 2, description: '1st Year 2nd Semester' }
        ]);
        setActiveView('list');
        alert('Course created successfully with ' + newSemesters.length + ' semesters!');
      } else {
        alert(result.error || 'Failed to create course');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create course');
    } finally {
      setIsLoading(false);
    }
  }, [courseFormData, semestersForCourse]);

  /**
   * Update existing course
   */
  const handleUpdateCourse = useCallback(async () => {
    if (!editingId) return;

    if (!courseFormData.name.trim()) {
      alert('Course name is required');
      return;
    }

    if (semestersForCourse.length === 0) {
      alert('Please add at least one semester');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/course/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course: courseFormData, semesters: semestersForCourse })
      });

      const result = await response.json();

      if (result.success) {
        // Update course
        setCourses(prev =>
          prev.map(course =>
            course.id === editingId ? result.data.course : course
          )
        );

        // Update semesters - remove old ones and add new ones
        setAllSemesters(prev => {
          const filtered = prev.filter(s => s.course_id !== editingId);
          return [...filtered, ...result.data.semesters];
        });

        // Reset form
        setCourseFormData(initialCourseState);
        setSemestersForCourse([
          { semester_number: 1, description: '1st Year 1st Semester' },
          { semester_number: 2, description: '1st Year 2nd Semester' }
        ]);
        setIsEditing(false);
        setEditingId(null);
        setActiveView('list');
        alert('Course updated successfully!');
      } else {
        alert(result.error || 'Failed to update course');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update course');
    } finally {
      setIsLoading(false);
    }
  }, [editingId, courseFormData, semestersForCourse]);

  /**
   * Delete course
   */
  const handleDeleteCourse = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this course? All associated semesters will also be deleted.')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/course/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setCourses(prev => prev.filter(course => course.id !== id));
        setAllSemesters(prev => prev.filter(sem => sem.course_id !== id));
        alert('Course deleted successfully');
      } else {
        alert(result.error || 'Failed to delete course');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete course');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Edit course
   */
  const handleEditCourse = useCallback((course: Course) => {
    setCourseFormData(course);
    const existingSemesters = getSemestersForCourse(course.id!);
    setSemestersForCourse(existingSemesters.length > 0 ? existingSemesters : [
      { semester_number: 1, description: '1st Year 1st Semester' }
    ]);
    setEditingId(course.id!);
    setIsEditing(true);
    setActiveView('form');
  }, [getSemestersForCourse]);

  /**
   * View course semesters
   */
  const handleViewSemesters = useCallback((courseId: number) => {
    setSelectedCourseId(courseId);
    setShowSemesters(true);
  }, []);

  /**
   * Cancel editing
   */
  const handleCancel = useCallback(() => {
    setCourseFormData(initialCourseState);
    setSemestersForCourse([
      { semester_number: 1, description: '1st Year 1st Semester' },
      { semester_number: 2, description: '1st Year 2nd Semester' }
    ]);
    setIsEditing(false);
    setEditingId(null);
    setActiveView('list');
  }, []);

  /**
   * Generate quick semester template
   */
  const generateSemesterTemplate = useCallback((years: number) => {
    const semesters: Semester[] = [];
    for (let year = 1; year <= years; year++) {
      for (let sem = 1; sem <= 2; sem++) {
        const semesterNumber = (year - 1) * 2 + sem;
        const semInYear = sem === 1 ? '1st' : '2nd';
        semesters.push({
          semester_number: semesterNumber,
          description: `${getOrdinal(year)} Year ${semInYear} Semester`
        });
      }
    }
    setSemestersForCourse(semesters);
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
            🎓 Course Management
          </Heading>
          <Text color="gray.600">
            Create and manage academic courses with years and semesters
          </Text>
        </Box>

        {/* Connection Error Alert */}
        {connectionError && (
          <Box mb={6} p={4} bg="red.50" borderLeft="4px solid" borderColor="red.500" borderRadius="md">
            <Heading size="sm" color="red.700" mb={2}>
              ⚠️ Connection Error
            </Heading>
            <Text color="red.600" fontSize="sm">
              {connectionError}
            </Text>
          </Box>
        )}

        {/* List View */}
        {activeView === 'list' && !showSemesters && (
          <Stack gap={6}>
            {isInitialLoading ? (
              <Box p={8} textAlign="center">
                <Text color="gray.600">Loading courses...</Text>
              </Box>
            ) : (
              <Fragment>
                {/* Search and Add Button */}
                <Stack direction="row" gap={4}>
                  <Input
                    placeholder="Search courses by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="lg"
                  />
                  <Button
                    colorScheme="green"
                    onClick={() => {
                      setCourseFormData(initialCourseState);
                      setIsEditing(false);
                      setActiveView('form');
                    }}
                  >
                    <HiPlus style={{ marginRight: '8px' }} />
                    Add Course
                  </Button>
                </Stack>

                {/* Courses Grid */}
                {filteredCourses.length > 0 ? (
                  <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
                    {filteredCourses.map(course => {
                      const semesters = getSemestersForCourse(course.id!);
                      const years = Math.ceil(semesters.length / 2);
                      
                      return (
                        <MotionBox
                          key={course.id}
                          p={6}
                          borderWidth={1}
                          borderRadius="lg"
                          borderColor="gray.200"
                          bg="white"
                          boxShadow="sm"
                          _hover={{ boxShadow: 'md', borderColor: 'blue.300' }}
                          transition={{ duration: 0.2 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <Stack gap={4}>
                            {/* Course Icon and Name */}
                            <Box>
                              <Stack direction="row" align="center" mb={2}>
                                <HiAcademicCap size={24} color="#3182CE" />
                                <Heading size="md" color="blue.700">
                                  {course.name}
                                </Heading>
                              </Stack>
                              <Text fontSize="sm" color="gray.600">
                                {course.description}
                              </Text>
                            </Box>

                            <Separator />

                            {/* Course Stats */}
                            <Stack direction="row" gap={2} wrap="wrap">
                              <Badge colorScheme="purple" fontSize="xs">
                                {semesters.length} Semesters
                              </Badge>
                              <Badge colorScheme="blue" fontSize="xs">
                                {years} {years === 1 ? 'Year' : 'Years'}
                              </Badge>
                            </Stack>

                            {/* Action Buttons */}
                            <Stack direction="row" gap={2} pt={2}>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                variant="outline"
                                flex={1}
                                onClick={() => handleViewSemesters(course.id!)}
                              >
                                📚 View Semesters
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="green"
                                variant="ghost"
                                onClick={() => handleEditCourse(course)}
                              >
                                <HiPencil />
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDeleteCourse(course.id!)}
                              >
                                <HiTrash />
                              </Button>
                            </Stack>
                          </Stack>
                        </MotionBox>
                      );
                    })}
                  </Box>
                ) : (
                  <Box p={8} textAlign="center" bg="gray.50" borderRadius="md">
                    <Text color="gray.600">
                      {courses.length === 0 ? 'No courses yet. Create your first course!' : 'No courses match your search.'}
                    </Text>
                  </Box>
                )}
              </Fragment>
            )}
          </Stack>
        )}

        {/* Semester View */}
        {showSemesters && selectedCourseId && (
          <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
            <Stack gap={6}>
              <Stack direction="row" align="center" justify="space-between">
                <Heading size="md">
                  📚 {courses.find(c => c.id === selectedCourseId)?.name} - Semesters
                </Heading>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSemesters(false);
                    setSelectedCourseId(null);
                  }}
                >
                  ← Back to Courses
                </Button>
              </Stack>

              <Box overflowX="auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f7fafc' }}>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Semester #</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSemestersForCourse(selectedCourseId).map(semester => (
                      <tr key={semester.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px' }}>
                          <Badge colorScheme="blue">Semester {semester.semester_number}</Badge>
                        </td>
                        <td style={{ padding: '12px' }}>{semester.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Form View */}
        {activeView === 'form' && (
          <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
            <Heading size="md" mb={6}>
              {isEditing ? '✏️ Edit Course' : '➕ Add New Course'}
            </Heading>

            <Stack gap={6} maxW="900px">
              {/* Course Information */}
              <Box>
                <Heading size="sm" mb={4} color="blue.600">
                  📖 Course Information
                </Heading>

                <FormControl isRequired mb={4}>
                  <FormLabel>Course Name *</FormLabel>
                  <Input
                    name="name"
                    value={courseFormData.name}
                    onChange={handleCourseInputChange}
                    placeholder="e.g., BSc Nursing, GNM, Pharmacy"
                    size="lg"
                  />
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="description"
                    value={courseFormData.description}
                    onChange={handleCourseInputChange}
                    placeholder="Enter course description"
                    rows={3}
                  />
                </FormControl>
              </Box>

              <Separator />

              {/* Semester Management */}
              <Box>
                <Stack direction="row" align="center" justify="space-between" mb={4}>
                  <Heading size="sm" color="purple.600">
                    📅 Years & Semesters
                  </Heading>
                  <Stack direction="row" gap={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      onClick={() => generateSemesterTemplate(2)}
                    >
                      2 Years (4 Sem)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      onClick={() => generateSemesterTemplate(3)}
                    >
                      3 Years (6 Sem)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      onClick={() => generateSemesterTemplate(4)}
                    >
                      4 Years (8 Sem)
                    </Button>
                  </Stack>
                </Stack>

                <Text fontSize="sm" color="gray.600" mb={4}>
                  Add semesters/years for this course. Use quick templates above or customize manually.
                </Text>

                {/* Semesters List */}
                <Stack gap={3}>
                  {semestersForCourse.map((semester, index) => (
                    <Box
                      key={index}
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      borderColor="gray.200"
                      bg="gray.50"
                    >
                      <Stack direction="row" gap={4} align="center">
                        <FormControl flex={0} minW="150px">
                          <FormLabel fontSize="sm">Semester Number</FormLabel>
                          <Input
                            type="number"
                            value={semester.semester_number}
                            onChange={(e) => handleSemesterChange(index, 'semester_number', parseInt(e.target.value) || 1)}
                            min={1}
                            bg="white"
                          />
                        </FormControl>

                        <FormControl flex={1}>
                          <FormLabel fontSize="sm">Description</FormLabel>
                          <Input
                            value={semester.description}
                            onChange={(e) => handleSemesterChange(index, 'description', e.target.value)}
                            placeholder="e.g., 1st Year 1st Semester"
                            bg="white"
                          />
                        </FormControl>

                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleRemoveSemester(index)}
                          mt={6}
                        >
                          <HiTrash />
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>

                <Button
                  size="sm"
                  colorScheme="green"
                  variant="outline"
                  onClick={handleAddSemester}
                  mt={4}
                >
                  <HiPlus style={{ marginRight: '8px' }} />
                  Add Semester
                </Button>

                {/* Summary */}
                <Box mt={4} p={4} bg="blue.50" borderRadius="md">
                  <Text fontSize="sm" color="blue.800">
                    📊 <strong>Total:</strong> {semestersForCourse.length} semesters ({Math.ceil(semestersForCourse.length / 2)} years)
                  </Text>
                </Box>
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
                  onClick={isEditing ? handleUpdateCourse : handleCreateCourse}
                  disabled={isLoading}
                >
                  {isEditing ? '💾 Update Course' : '➕ Create Course'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </MotionBox>
    </Container>
  );
}
