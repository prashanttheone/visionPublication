'use client';

import { Box, Container, Text, Badge, Input, Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
import { HiMagnifyingGlass, HiLink, HiChevronDown, HiChevronUp } from 'react-icons/hi2';
import { HiOutlineBookOpen } from 'react-icons/hi';

const MotionBox = motion.create(Box);

interface Course {
  id: number;
  name: string;
  description?: string;
  semesters?: Semester[];
}

interface Semester {
  id: number;
  course_id: number;
  semester_number: number;
  description: string;
}

interface EResourceChapter {
  id: number;
  eresource_book_id: number;
  chapter_number: number;
  chapter_name: string;
  doc_link?: string;
}

interface EResourceBook {
  id: number;
  course_id: number;
  semester_id: number;
  book_name: string;
  description?: string;
  course_name: string;
  semester_name: string;
  chapters: EResourceChapter[];
}

export default function Eresource() {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [eresources, setEresources] = useState<EResourceBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [expandedBookId, setExpandedBookId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'chapters'>('name');

  // Fetch courses and semesters
  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch('/api/course?includeSemesters=true');
      const result = await response.json();
      if (result.success) {
        setCourses(result.data || []);
        const allSems: Semester[] = [];
        result.data?.forEach((course: Course) => {
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
      setIsLoading(true);
      await Promise.all([fetchCourses(), fetchEresources()]);
      setIsLoading(false);
    };
    init();
  }, [fetchCourses, fetchEresources]);

  // Get semesters for selected course
  const availableSemesters = useMemo(() => {
    if (!selectedCourseId) return [];
    return semesters.filter(s => s.course_id === selectedCourseId);
  }, [selectedCourseId, semesters]);

  // Filter e-resources
  const filteredEresources = useMemo(() => {
    let filtered = [...eresources];

    // Filter by course
    if (selectedCourseId) {
      filtered = filtered.filter(e => e.course_id === selectedCourseId);
    }

    // Filter by semester
    if (selectedSemesterId) {
      filtered = filtered.filter(e => e.semester_id === selectedSemesterId);
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.book_name.toLowerCase().includes(search) ||
          e.course_name.toLowerCase().includes(search) ||
          e.semester_name.toLowerCase().includes(search) ||
          e.chapters.some(ch => ch.chapter_name.toLowerCase().includes(search))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.book_name.localeCompare(b.book_name);
      } else {
        return b.chapters.length - a.chapters.length;
      }
    });

    return filtered;
  }, [eresources, selectedCourseId, selectedSemesterId, searchTerm, sortBy]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
    hover: {
      y: -8,
      boxShadow: '0 20px 40px rgba(100, 181, 246, 0.25)',
      transition: { duration: 0.3 },
    },
  };

  const selectStyle = {
    padding: '10px 12px',
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(100, 181, 246, 0.3)',
    color: 'white',
    borderRadius: '6px',
    width: '100%',
    fontSize: '14px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364B5F6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    backgroundSize: '20px',
    paddingRight: '36px',
    transition: 'all 0.2s ease',
  } as React.CSSProperties;

  return (
    <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" py={{ base: '60px', md: '80px' }} position="relative" overflow="hidden">
      {/* Background Elements */}
      <Box position="fixed" top="-100px" right="-100px" width="400px" height="400px" borderRadius="50%" bgGradient="radial(circle, rgba(100, 181, 246, 0.1) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />
      <Box position="fixed" bottom="-50px" left="-50px" width="300px" height="300px" borderRadius="50%" bgGradient="radial(circle, rgba(255, 140, 0, 0.05) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />

      <Container maxW="1400px" px={{ base: '20px', md: '40px' }} position="relative" zIndex={1}>
        {/* Header Section */}
        <MotionBox variants={containerVariants} initial="hidden" animate="visible" textAlign="center" mb={{ base: '50px', md: '60px' }}>
          <MotionBox variants={itemVariants} mb="20px">
            <Box display="inline-block" bg="rgba(255, 140, 0, 0.1)" border="2px solid" borderColor="rgba(255, 140, 0, 0.5)" px="16px" py="8px" borderRadius="50px">
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" textTransform="uppercase" letterSpacing="1px">
                E-Resources
              </Text>
            </Box>
          </MotionBox>

          <MotionBox variants={itemVariants} mb="20px">
            <Text fontSize={{ base: '42px', md: '56px', lg: '64px' }} fontWeight="900" lineHeight="1.2" color="white" mb="20px">
              Digital Study
            </Text>
            <Text fontSize={{ base: '42px', md: '56px', lg: '64px' }} fontWeight="900" lineHeight="1.2" bgGradient="linear(to-r, #64B5F6, #90CAF9)" bgClip="text">
              Resources
            </Text>
          </MotionBox>

          <MotionBox variants={itemVariants} maxW="700px" mx="auto">
            <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" lineHeight="1.6">
              Access comprehensive e-books and chapter resources for all courses and semesters.
            </Text>
          </MotionBox>
        </MotionBox>

        {/* Filters Section */}
        <MotionBox variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} mb={{ base: '40px', md: '50px' }} position="relative" zIndex={10}>
          <Box
            bg="rgba(30, 41, 59, 0.6)"
            border="1px solid"
            borderColor="rgba(100, 181, 246, 0.2)"
            borderRadius="16px"
            p={{ base: '24px', md: '32px' }}
            backdropFilter="blur(10px)"
          >
            {/* Grid for filters */}
            <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={{ base: '12px', md: '16px' }} position="relative" zIndex={4}>
              {/* Course Selection */}
              <Box>
                <Text fontSize="sm" fontWeight="700" color="gray.300" mb="12px" textTransform="uppercase" letterSpacing="1px">
                  Course
                </Text>
                <select
                  value={selectedCourseId || ''}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    const value = e.target.value ? parseInt(e.target.value) : null;
                    setSelectedCourseId(value);
                    setSelectedSemesterId(null);
                  }}
                  style={selectStyle}
                >
                  <option value="" style={{ background: '#1a2332', color: 'white', padding: '8px' }}>
                    All Courses
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id} style={{ background: '#1a2332', color: 'white', padding: '8px' }}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </Box>

              {/* Semester Selection */}
              <Box>
                <Text fontSize="sm" fontWeight="700" color="gray.300" mb="12px" textTransform="uppercase" letterSpacing="1px">
                  Semester
                </Text>
                <select
                  value={selectedSemesterId || ''}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    const value = e.target.value ? parseInt(e.target.value) : null;
                    setSelectedSemesterId(value);
                  }}
                  disabled={!selectedCourseId || availableSemesters.length === 0}
                  style={{
                    ...selectStyle,
                    opacity: !selectedCourseId || availableSemesters.length === 0 ? 0.5 : 1,
                    cursor: !selectedCourseId || availableSemesters.length === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <option value="" style={{ background: '#1a2332', color: 'white', padding: '8px' }}>
                    All Semesters
                  </option>
                  {availableSemesters.map((semester) => (
                    <option key={semester.id} value={semester.id} style={{ background: '#1a2332', color: 'white', padding: '8px' }}>
                      {semester.description || `Semester ${semester.semester_number}`}
                    </option>
                  ))}
                </select>
              </Box>

              {/* Sort By */}
              <Box>
                <Text fontSize="sm" fontWeight="700" color="gray.300" mb="12px" textTransform="uppercase" letterSpacing="1px">
                  Sort By
                </Text>
                <select
                  value={sortBy}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'name' | 'chapters')}
                  style={selectStyle}
                >
                  <option value="name" style={{ background: '#1a2332', color: 'white', padding: '8px' }}>
                    Book Name (A-Z)
                  </option>
                  <option value="chapters" style={{ background: '#1a2332', color: 'white', padding: '8px' }}>
                    Most Chapters
                  </option>
                </select>
              </Box>
            </Box>

            {/* Search Bar */}
            <Box mt={{ base: '16px', md: '24px' }} position="relative">
              <HiMagnifyingGlass size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64B5F6' }} />
              <Input
                placeholder="Search books or chapters..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                pl="40px"
                bg="rgba(15, 23, 42, 0.5)"
                border="1px solid"
                borderColor="rgba(100, 181, 246, 0.3)"
                color="white"
                _placeholder={{ color: 'gray.500' }}
                _hover={{ borderColor: 'rgba(100, 181, 246, 0.5)' }}
                _focus={{ borderColor: '#64B5F6', boxShadow: '0 0 0 3px rgba(100, 181, 246, 0.1)' }}
              />
            </Box>
          </Box>
        </MotionBox>

        {/* Results Count */}
        <MotionBox variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} mb="30px">
          <Text fontSize="sm" color="gray.400">
            Showing <Text as="span" color="#64B5F6" fontWeight="700">{filteredEresources.length}</Text> {filteredEresources.length === 1 ? 'book' : 'books'}
          </Text>
        </MotionBox>

        {/* Loading State */}
        {isLoading ? (
          <Box textAlign="center" py="60px">
            <Text fontSize="18px" color="gray.400">Loading e-resources...</Text>
          </Box>
        ) : filteredEresources.length > 0 ? (
          /* E-Resources Grid */
          <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={{ base: '24px', md: '32px' }}>
            {filteredEresources.map((book, index) => (
              <MotionBox key={book.id} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
                <Box
                  bg="rgba(30, 41, 59, 0.6)"
                  border="1px solid"
                  borderColor="rgba(100, 181, 246, 0.2)"
                  borderRadius="16px"
                  overflow="hidden"
                  backdropFilter="blur(10px)"
                  p={{ base: '24px', md: '28px' }}
                  height="100%"
                  display="flex"
                  flexDirection="column"
                  transition="all 0.3s ease"
                  _hover={{
                    borderColor: 'rgba(100, 181, 246, 0.4)',
                  }}
                >
                  {/* Header */}
                  <Box display="flex" alignItems="flex-start" gap="12px" mb="20px">
                    <Box
                      bg="linear-gradient(135deg, #64B5F6, #42A5F5)"
                      width="44px"
                      height="44px"
                      borderRadius="12px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <HiOutlineBookOpen size={24} color="white" />
                    </Box>
                    <Box flex="1">
                      <Text fontSize={{ base: '16px', md: '18px' }} fontWeight="800" color="white" lineHeight="1.3">
                        {book.book_name}
                      </Text>
                      {book.description && (
                        <Text fontSize="sm" color="gray.400" mt="4px">{book.description}</Text>
                      )}
                    </Box>
                  </Box>

                  {/* Metadata Badges */}
                  <Box display="flex" gap="8px" flexWrap="wrap" mb="20px">
                    <Badge bg="rgba(255, 140, 0, 0.2)" color="#FF8C00" px="10px" py="4px" borderRadius="6px" fontSize="xs" fontWeight="600">
                      {book.course_name}
                    </Badge>
                    <Badge bg="rgba(100, 181, 246, 0.2)" color="#64B5F6" px="10px" py="4px" borderRadius="6px" fontSize="xs" fontWeight="600">
                      {book.semester_name}
                    </Badge>
                    <Badge bg="rgba(139, 92, 246, 0.2)" color="#A78BFA" px="10px" py="4px" borderRadius="6px" fontSize="xs" fontWeight="600">
                      {book.chapters.length} Chapters
                    </Badge>
                  </Box>

                  {/* Divider */}
                  <Box height="1px" bg="linear-gradient(to-r, transparent, rgba(100, 181, 246, 0.2), transparent)" my="16px" />

                  {/* Chapters Section */}
                  <Box flex="1">
                    <Box 
                      display="flex" 
                      justifyContent="space-between" 
                      alignItems="center" 
                      mb="12px"
                      cursor="pointer"
                      onClick={() => setExpandedBookId(expandedBookId === book.id ? null : book.id)}
                    >
                      <Text fontSize="xs" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="1px">
                        Chapters & Resources
                      </Text>
                      {expandedBookId === book.id ? (
                        <HiChevronUp size={18} color="#64B5F6" />
                      ) : (
                        <HiChevronDown size={18} color="#64B5F6" />
                      )}
                    </Box>

                    {/* Collapsed: Show first 3 chapters */}
                    {expandedBookId !== book.id && book.chapters.length > 0 && (
                      <Box display="flex" flexDirection="column" gap="8px">
                        {book.chapters.slice(0, 3).map((chapter) => (
                          <Box key={chapter.id} display="flex" gap="8px" alignItems="center" justifyContent="space-between">
                            <Box display="flex" gap="8px" alignItems="center" flex="1">
                              <Text color="#FF8C00" fontWeight="900" fontSize="sm">•</Text>
                              <Text fontSize="sm" color="gray.300" lineHeight="1.5" noOfLines={1}>
                                {chapter.chapter_name}
                              </Text>
                            </Box>
                            {chapter.doc_link && (
                              <a
                                href={chapter.doc_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '4px 8px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  color: 'white',
                                  backgroundColor: '#319795',
                                  borderRadius: '4px',
                                  textDecoration: 'none',
                                  flexShrink: 0
                                }}
                              >
                                <HiLink style={{ marginRight: '4px' }} />
                                View
                              </a>
                            )}
                          </Box>
                        ))}
                        {book.chapters.length > 3 && (
                          <Text fontSize="xs" color="#64B5F6" fontWeight="600" cursor="pointer" onClick={() => setExpandedBookId(book.id)}>
                            + {book.chapters.length - 3} more chapters
                          </Text>
                        )}
                      </Box>
                    )}

                    {/* Expanded: Show all chapters */}
                    {expandedBookId === book.id && book.chapters.length > 0 && (
                      <Box display="flex" flexDirection="column" gap="10px">
                        {book.chapters.map((chapter) => (
                          <Box 
                            key={chapter.id} 
                            display="flex" 
                            gap="10px" 
                            alignItems="center" 
                            justifyContent="space-between"
                            p="10px"
                            bg="rgba(15, 23, 42, 0.4)"
                            borderRadius="8px"
                          >
                            <Box display="flex" gap="10px" alignItems="center" flex="1">
                              <Badge bg="rgba(139, 92, 246, 0.3)" color="#A78BFA" px="8px" py="2px" borderRadius="4px" fontSize="xs" fontWeight="700">
                                {chapter.chapter_number}
                              </Badge>
                              <Text fontSize="sm" color="gray.200" lineHeight="1.4">
                                {chapter.chapter_name}
                              </Text>
                            </Box>
                            {chapter.doc_link ? (
                              <a
                                href={chapter.doc_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  color: 'white',
                                  backgroundColor: '#319795',
                                  borderRadius: '6px',
                                  textDecoration: 'none',
                                  flexShrink: 0
                                }}
                              >
                                <HiLink style={{ marginRight: '6px' }} />
                                View Doc
                              </a>
                            ) : (
                              <Badge bg="rgba(113, 128, 150, 0.3)" color="gray.400" px="8px" py="4px" borderRadius="4px" fontSize="xs">
                                No Link
                              </Badge>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}

                    {book.chapters.length === 0 && (
                      <Text fontSize="sm" color="gray.500" fontStyle="italic">
                        No chapters available
                      </Text>
                    )}
                  </Box>
                </Box>
              </MotionBox>
            ))}
          </Box>
        ) : (
          /* Empty State */
          <MotionBox variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} textAlign="center" py="60px">
            <Box mb="24px">
              <HiMagnifyingGlass size={64} style={{ margin: '0 auto', color: 'rgba(100, 181, 246, 0.3)' }} />
            </Box>
            <Text fontSize="24px" fontWeight="800" color="white" mb="12px">
              No E-Resources Found
            </Text>
            <Text fontSize="16px" color="gray.400">
              {eresources.length === 0 
                ? 'No e-resources have been added yet. Check back later!' 
                : 'Try adjusting your filters or search terms to find what you\'re looking for.'}
            </Text>
          </MotionBox>
        )}
      </Container>
    </Box>
  );
}
