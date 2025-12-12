'use client';

import { Box, Container, Text, Button } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { HiTrash, HiCheckCircle, HiXCircle } from 'react-icons/hi2';

interface ContactInquiry {
  id: number;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface AuthorApplication {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  experience: string;
  book_title: string;
  book_description: string;
  publishing_goal: string;
  status: string;
  created_at: string;
}

export default function FormView() {
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);
  const [authorApplications, setAuthorApplications] = useState<AuthorApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'contact' | 'author'>('contact');

  // Fetch form submissions
  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch contact inquiries
      const contactRes = await fetch('/api/form?type=contact');
      const contactData = await contactRes.json();
      if (contactData.success) {
        setContactInquiries(contactData.data);
      }

      // Fetch author applications
      const authorRes = await fetch('/api/form?type=author');
      const authorData = await authorRes.json();
      if (authorData.success) {
        setAuthorApplications(authorData.data);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to fetch form submissions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleMarkAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/form/${id}?type=contact`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true }),
      });

      if (response.ok) {
        await fetchSubmissions();
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleUpdateApplicationStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/form/${id}?type=author`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchSubmissions();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDelete = async (id: number, type: 'contact' | 'author') => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const response = await fetch(`/api/form/${id}?type=${type}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchSubmissions();
      }
    } catch (err) {
      console.error('Error deleting submission:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" minH="100vh" py={{ base: '40px', md: '60px' }}>
      <Container maxW="1400px" px={{ base: '16px', md: '32px' }}>
        <Text fontSize={{ base: '28px', md: '36px' }} fontWeight="900" color="white" mb="40px">
          Form Submissions Manager
        </Text>

        {/* Error Message */}
        {error && (
          <Box bg="red.900" color="red.100" p="16px" borderRadius="8px" mb="24px">
            <Text>{error}</Text>
          </Box>
        )}

        {isLoading ? (
          <Box textAlign="center" py="60px">
            <Text color="white" fontSize="18px" fontWeight="700">
              Loading submissions...
            </Text>
          </Box>
        ) : (
          <Box>
            {/* Tab Buttons */}
            <Box display="flex" gap="8px" mb="24px" bg="rgba(30, 41, 59, 0.6)" border="1px solid rgba(100, 181, 246, 0.2)" borderRadius="8px" p="8px" width="fit-content">
              <Button
                onClick={() => setActiveTab('contact')}
                bg={activeTab === 'contact' ? 'rgba(100, 181, 246, 0.2)' : 'transparent'}
                color={activeTab === 'contact' ? '#64B5F6' : 'gray.400'}
                fontSize="14px"
                fontWeight="600"
                border="none"
                borderRadius="6px"
                px="16px"
                py="8px"
                cursor="pointer"
                transition="all 0.3s ease"
                _hover={{ bg: 'rgba(100, 181, 246, 0.15)' }}
              >
                Contact Inquiries ({contactInquiries.length})
              </Button>
              <Button
                onClick={() => setActiveTab('author')}
                bg={activeTab === 'author' ? 'rgba(100, 181, 246, 0.2)' : 'transparent'}
                color={activeTab === 'author' ? '#64B5F6' : 'gray.400'}
                fontSize="14px"
                fontWeight="600"
                border="none"
                borderRadius="6px"
                px="16px"
                py="8px"
                cursor="pointer"
                transition="all 0.3s ease"
                _hover={{ bg: 'rgba(100, 181, 246, 0.15)' }}
              >
                Author Applications ({authorApplications.length})
              </Button>
            </Box>

            {/* Tab Content */}
            {activeTab === 'contact' && (
              <Box>
                {contactInquiries.length === 0 ? (
                  <Box textAlign="center" py="40px">
                    <Text color="gray.300">No contact inquiries yet</Text>
                  </Box>
                ) : (
                  <Box display="flex" flexDirection="column" gap="16px" mt="24px">
                    {contactInquiries.map((inquiry) => (
                      <Box
                        key={inquiry.id}
                        bg="rgba(30, 41, 59, 0.6)"
                        border={`1px solid ${inquiry.is_read ? 'rgba(100, 181, 246, 0.1)' : 'rgba(255, 140, 0, 0.3)'}`}
                        borderRadius="12px"
                        p="20px"
                        transition="all 0.3s ease"
                        _hover={{ borderColor: 'rgba(100, 181, 246, 0.4)' }}
                      >
                        {/* Header */}
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb="12px">
                          <Box flex="1">
                            <Text fontSize="16px" fontWeight="700" color={inquiry.is_read ? 'gray.300' : 'white'} mb="4px">
                              {inquiry.subject}
                            </Text>
                            <Text fontSize="13px" color="gray.400">
                              From: <strong>{inquiry.full_name}</strong> ({inquiry.email})
                            </Text>
                            <Text fontSize="12px" color="gray.500" mt="4px">
                              {formatDate(inquiry.created_at)}
                            </Text>
                          </Box>
                          <Box display="flex" gap="8px">
                            {!inquiry.is_read && (
                              <Button
                                onClick={() => handleMarkAsRead(inquiry.id)}
                                bg="rgba(76, 175, 80, 0.2)"
                                color="#4CAF50"
                                size="sm"
                                fontSize="12px"
                                border="1px solid rgba(76, 175, 80, 0.3)"
                                _hover={{ bg: 'rgba(76, 175, 80, 0.3)' }}
                              >
                                <HiCheckCircle size={14} style={{ marginRight: '4px' }} />
                                Mark Read
                              </Button>
                            )}
                            <Button
                              onClick={() => handleDelete(inquiry.id, 'contact')}
                              bg="rgba(244, 67, 54, 0.2)"
                              color="#F44336"
                              size="sm"
                              fontSize="12px"
                              border="1px solid rgba(244, 67, 54, 0.3)"
                              _hover={{ bg: 'rgba(244, 67, 54, 0.3)' }}
                            >
                              <HiTrash size={14} />
                            </Button>
                          </Box>
                        </Box>

                        {/* Message */}
                        <Box bg="rgba(15, 23, 42, 0.5)" border="1px solid rgba(100, 181, 246, 0.1)" borderRadius="6px" p="12px">
                          <Text fontSize="13px" color="gray.300" lineHeight="1.6" whiteSpace="pre-wrap">
                            {inquiry.message}
                          </Text>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 'author' && (
              <Box>
                {authorApplications.length === 0 ? (
                  <Box textAlign="center" py="40px">
                    <Text color="gray.300">No author applications yet</Text>
                  </Box>
                ) : (
                  <Box display="flex" flexDirection="column" gap="16px" mt="24px">
                    {authorApplications.map((app) => (
                      <Box
                        key={app.id}
                        bg="rgba(30, 41, 59, 0.6)"
                        border="1px solid rgba(100, 181, 246, 0.2)"
                        borderRadius="12px"
                        p="20px"
                        transition="all 0.3s ease"
                        _hover={{ borderColor: 'rgba(100, 181, 246, 0.4)' }}
                      >
                        {/* Header */}
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb="16px" flexWrap="wrap" gap="12px">
                          <Box flex="1" minW="250px">
                            <Text fontSize="16px" fontWeight="700" color="white" mb="4px">
                              {app.full_name}
                            </Text>
                            <Text fontSize="13px" color="gray.400" mb="4px">
                              {app.email} | {app.phone}
                            </Text>
                            <Text fontSize="12px" color="gray.500">
                              {formatDate(app.created_at)}
                            </Text>
                          </Box>
                          <Box display="flex" gap="8px" flexWrap="wrap">
                            <Button
                              onClick={() => handleUpdateApplicationStatus(app.id, 'approved')}
                              bg={app.status === 'approved' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)'}
                              color="#4CAF50"
                              size="sm"
                              fontSize="12px"
                              border="1px solid rgba(76, 175, 80, 0.3)"
                              _hover={{ bg: 'rgba(76, 175, 80, 0.3)' }}
                            >
                              <HiCheckCircle size={14} style={{ marginRight: '4px' }} />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                              bg={app.status === 'rejected' ? 'rgba(244, 67, 54, 0.3)' : 'rgba(244, 67, 54, 0.2)'}
                              color="#F44336"
                              size="sm"
                              fontSize="12px"
                              border="1px solid rgba(244, 67, 54, 0.3)"
                              _hover={{ bg: 'rgba(244, 67, 54, 0.3)' }}
                            >
                              <HiXCircle size={14} style={{ marginRight: '4px' }} />
                              Reject
                            </Button>
                            <Button
                              onClick={() => handleDelete(app.id, 'author')}
                              bg="rgba(244, 67, 54, 0.2)"
                              color="#F44336"
                              size="sm"
                              fontSize="12px"
                              border="1px solid rgba(244, 67, 54, 0.3)"
                              _hover={{ bg: 'rgba(244, 67, 54, 0.3)' }}
                            >
                              <HiTrash size={14} />
                            </Button>
                          </Box>
                        </Box>

                        {/* Status Badge */}
                        <Box mb="16px">
                          <Box
                            display="inline-block"
                            px="12px"
                            py="6px"
                            borderRadius="4px"
                            fontSize="12px"
                            fontWeight="600"
                            bg={
                              app.status === 'approved'
                                ? 'rgba(76, 175, 80, 0.2)'
                                : app.status === 'rejected'
                                  ? 'rgba(244, 67, 54, 0.2)'
                                  : 'rgba(255, 152, 0, 0.2)'
                            }
                            color={
                              app.status === 'approved' ? '#4CAF50' : app.status === 'rejected' ? '#F44336' : '#FF9800'
                            }
                          >
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </Box>
                        </Box>

                        {/* Details Grid */}
                        <Box
                          display="grid"
                          gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                          gap="16px"
                          mb="16px"
                          fontSize="13px"
                        >
                          <Box>
                            <Text color="gray.400" fontWeight="600" mb="4px">
                              Qualification
                            </Text>
                            <Text color="white">{app.qualification}</Text>
                          </Box>
                          <Box>
                            <Text color="gray.400" fontWeight="600" mb="4px">
                              Specialization
                            </Text>
                            <Text color="white">{app.specialization}</Text>
                          </Box>
                          <Box>
                            <Text color="gray.400" fontWeight="600" mb="4px">
                              Experience
                            </Text>
                            <Text color="white">{app.experience}</Text>
                          </Box>
                          <Box>
                            <Text color="gray.400" fontWeight="600" mb="4px">
                              Book Title
                            </Text>
                            <Text color="white">{app.book_title}</Text>
                          </Box>
                        </Box>

                        {/* Expandable Content */}
                        <Box display="flex" flexDirection="column" gap="12px">
                          <Box bg="rgba(15, 23, 42, 0.5)" border="1px solid rgba(100, 181, 246, 0.1)" borderRadius="6px" p="12px">
                            <Text fontSize="12px" fontWeight="600" color="gray.400" mb="6px">
                              Book Description
                            </Text>
                            <Text fontSize="13px" color="gray.300" lineHeight="1.6" whiteSpace="pre-wrap">
                              {app.book_description}
                            </Text>
                          </Box>
                          <Box bg="rgba(15, 23, 42, 0.5)" border="1px solid rgba(100, 181, 246, 0.1)" borderRadius="6px" p="12px">
                            <Text fontSize="12px" fontWeight="600" color="gray.400" mb="6px">
                              Publishing Goal
                            </Text>
                            <Text fontSize="13px" color="gray.300" lineHeight="1.6" whiteSpace="pre-wrap">
                              {app.publishing_goal}
                            </Text>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
