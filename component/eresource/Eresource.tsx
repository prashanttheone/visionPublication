'use client';

import { Box, Container, Text, Badge, Input } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState, useMemo, ChangeEvent } from 'react';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { HiOutlineBookOpen } from 'react-icons/hi';
import { INC_EBOOKS } from './data';

const MotionBox = motion.create(Box);

type ProgramKey = 'BSc_Nursing' | 'PostBasic_BSc_Nursing' | 'GNM';

interface FilteredSubject {
  subject: string;
  approvedBooks: string[];
  year?: string;
  semester?: string;
}

export default function Eresource() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<ProgramKey>('BSc_Nursing');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'books'>('name');

  // Get program data
  const programData = INC_EBOOKS[selectedProgram];

  // Get available years
  const availableYears = useMemo(() => {
    if (!programData) return [];
    return Object.keys(programData).filter((key) => key.startsWith('Year'));
  }, [programData]);

  // Get available semesters based on selected year
  const availableSemesters = useMemo(() => {
    if (!selectedYear || !programData) return [];
    const yearData = programData[selectedYear as keyof typeof programData];
    if (!yearData || typeof yearData !== 'object') return [];
    if (Array.isArray(yearData)) return [];
    return Object.keys(yearData).filter((key) => key.startsWith('Semester'));
  }, [selectedYear, programData]);

  // Get all subjects based on filters
  const filteredSubjects: FilteredSubject[] = useMemo(() => {
    if (!programData) return [];

    const subjects: FilteredSubject[] = [];

    if (selectedYear && selectedSemester) {
      // Specific semester selected
      const yearData = programData[selectedYear as keyof typeof programData];
      if (yearData && typeof yearData === 'object' && !Array.isArray(yearData)) {
        const semesterData = yearData[selectedSemester as keyof typeof yearData];
        if (Array.isArray(semesterData)) {
          (semesterData as any[]).forEach((subject: any) => {
            subjects.push({
              ...subject,
              year: selectedYear,
              semester: selectedSemester,
            });
          });
        }
      }
    } else if (selectedYear) {
      // All subjects in selected year
      const yearData = programData[selectedYear as keyof typeof programData];
      if (yearData && typeof yearData === 'object') {
        if (Array.isArray(yearData)) {
          (yearData as any[]).forEach((subject: any) => {
            subjects.push({
              ...subject,
              year: selectedYear,
            });
          });
        } else {
          // Handle semester structure
          Object.entries(yearData).forEach(([semKey, semData]: [string, any]) => {
            if (Array.isArray(semData)) {
              (semData as any[]).forEach((subject: any) => {
                subjects.push({
                  ...subject,
                  year: selectedYear,
                  semester: semKey,
                });
              });
            }
          });
        }
      }
    } else {
      // All subjects in program
      Object.entries(programData).forEach(([yearKey, yearData]: [string, any]) => {
        if (yearData && typeof yearData === 'object') {
          if (Array.isArray(yearData)) {
            (yearData as any[]).forEach((subject: any) => {
              subjects.push({
                ...subject,
                year: yearKey,
              });
            });
          } else {
            Object.entries(yearData).forEach(([semKey, semData]: [string, any]) => {
              if (Array.isArray(semData)) {
                (semData as any[]).forEach((subject: any) => {
                  subjects.push({
                    ...subject,
                    year: yearKey,
                    semester: semKey,
                  });
                });
              }
            });
          }
        }
      });
    }

    // Apply search filter
    let filtered = subjects.filter(
      (subject) =>
        subject.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.approvedBooks.some((book) => book.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.subject.localeCompare(b.subject);
      } else {
        return b.approvedBooks.length - a.approvedBooks.length;
      }
    });

    return filtered;
  }, [programData, selectedYear, selectedSemester, searchTerm, sortBy]);

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

  const programOptions = [
    { value: 'BSc_Nursing', label: 'B.Sc Nursing' },
    { value: 'PostBasic_BSc_Nursing', label: 'Post-Basic B.Sc Nursing' },
    { value: 'GNM', label: 'GNM (General Nursing & Midwifery)' },
  ];

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
              Approved Curriculum
            </Text>
            <Text fontSize={{ base: '42px', md: '56px', lg: '64px' }} fontWeight="900" lineHeight="1.2" bgGradient="linear(to-r, #64B5F6, #90CAF9)" bgClip="text">
              Resources
            </Text>
          </MotionBox>

          <MotionBox variants={itemVariants} maxW="700px" mx="auto">
            <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" lineHeight="1.6">
              Access comprehensive e-books and approved resources for all nursing programs and specializations.
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
            {/* Program Selection */}
            <Box mb={{ base: '20px', md: '24px' }} position="relative" zIndex={5}>
              <Text fontSize="sm" fontWeight="700" color="gray.300" mb="12px" textTransform="uppercase" letterSpacing="1px">
                Select Program
              </Text>
              <select
                value={selectedProgram}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  setSelectedProgram(e.target.value as ProgramKey);
                  setSelectedYear('');
                  setSelectedSemester('');
                }}
                style={selectStyle}
              >
                {programOptions.map((option) => (
                  <option key={option.value} value={option.value} style={{ background: '#1a2332', color: 'white', padding: '8px' }}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Box>

            {/* Grid for other filters */}
            <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={{ base: '12px', md: '16px' }} position="relative" zIndex={4}>
              <Box>
                <Text fontSize="sm" fontWeight="700" color="gray.300" mb="12px" textTransform="uppercase" letterSpacing="1px">
                  Year
                </Text>
                <select
                  value={selectedYear}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    setSelectedYear(e.target.value);
                    setSelectedSemester('');
                  }}
                  style={selectStyle}
                >
                  <option value="" style={{ background: '#1a2332', color: 'white', padding: '8px' }}>
                    All Years
                  </option>
                  {availableYears.map((year) => (
                    <option key={year} value={year} style={{ background: '#1a2332', color: 'white', padding: '8px' }}>
                      {year.replace('_', ' ')}
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
                  value={selectedSemester}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedSemester(e.target.value)}
                  disabled={!selectedYear || availableSemesters.length === 0}
                  style={{
                    ...selectStyle,
                    opacity: !selectedYear || availableSemesters.length === 0 ? 0.5 : 1,
                    cursor: !selectedYear || availableSemesters.length === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <option value="" style={{ background: '#1a2332', color: 'white', padding: '8px' }}>
                    All Semesters
                  </option>
                  {availableSemesters.map((semester) => (
                    <option key={semester} value={semester} style={{ background: '#1a2332', color: 'white', padding: '8px' }}>
                      {semester.replace('_', ' ')}
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
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'name' | 'books')}
                  style={selectStyle}
                >
                  <option value="name" style={{ background: '#1a2332', color: 'white', padding: '8px' }}>
                    Subject Name (A-Z)
                  </option>
                  <option value="books" style={{ background: '#1a2332', color: 'white', padding: '8px' }}>
                    Most Books
                  </option>
                </select>
              </Box>
            </Box>

            {/* Search Bar */}
            <Box mt={{ base: '16px', md: '24px' }} position="relative">
              <HiMagnifyingGlass size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64B5F6' }} />
              <Input
                placeholder="Search subjects or books..."
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
            Showing <Text as="span" color="#64B5F6" fontWeight="700">{filteredSubjects.length}</Text> {filteredSubjects.length === 1 ? 'subject' : 'subjects'}
          </Text>
        </MotionBox>

        {/* Subjects Grid */}
        {filteredSubjects.length > 0 ? (
          <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={{ base: '24px', md: '32px' }}>
            {filteredSubjects.map((subjectData, index) => (
              <MotionBox key={`${subjectData.subject}-${index}`} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
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
                        {subjectData.subject}
                      </Text>
                    </Box>
                  </Box>

                  {/* Metadata Badges */}
                  <Box display="flex" gap="8px" flexWrap="wrap" mb="20px">
                    {subjectData.year && (
                      <Badge bg="rgba(255, 140, 0, 0.2)" color="#FF8C00" px="10px" py="4px" borderRadius="6px" fontSize="xs" fontWeight="600">
                        {subjectData.year.replace('_', ' ')}
                      </Badge>
                    )}
                    {subjectData.semester && (
                      <Badge bg="rgba(100, 181, 246, 0.2)" color="#64B5F6" px="10px" py="4px" borderRadius="6px" fontSize="xs" fontWeight="600">
                        {subjectData.semester.replace('_', ' ')}
                      </Badge>
                    )}
                    <Badge bg="rgba(139, 92, 246, 0.2)" color="#A78BFA" px="10px" py="4px" borderRadius="6px" fontSize="xs" fontWeight="600">
                      {subjectData.approvedBooks.length} Books
                    </Badge>
                  </Box>

                  {/* Divider */}
                  <Box height="1px" bg="linear-gradient(to-r, transparent, rgba(100, 181, 246, 0.2), transparent)" my="20px" />

                  {/* Approved Books */}
                  <Box flex="1">
                    <Text fontSize="xs" fontWeight="700" color="gray.400" mb="12px" textTransform="uppercase" letterSpacing="1px">
                      Approved Books
                    </Text>
                    <Box display="flex" flexDirection="column" gap="10px">
                      {subjectData.approvedBooks.map((book, idx) => (
                        <Box key={idx} display="flex" gap="8px" alignItems="flex-start">
                          <Text color="#FF8C00" fontWeight="900" fontSize="sm" mt="2px">
                            •
                          </Text>
                          <Text fontSize="sm" color="gray.300" lineHeight="1.5">
                            {book}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </MotionBox>
            ))}
          </Box>
        ) : (
          <MotionBox variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} textAlign="center" py="60px">
            <Box mb="24px">
              <HiMagnifyingGlass size={64} style={{ margin: '0 auto', color: 'rgba(100, 181, 246, 0.3)' }} />
            </Box>
            <Text fontSize="24px" fontWeight="800" color="white" mb="12px">
              No Resources Found
            </Text>
            <Text fontSize="16px" color="gray.400">
              Try adjusting your filters or search terms to find what you're looking for.
            </Text>
          </MotionBox>
        )}
      </Container>
    </Box>
  );
}
