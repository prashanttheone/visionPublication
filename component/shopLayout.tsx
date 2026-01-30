'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { Input, Badge, Button } from 'antd';
import { HiMagnifyingGlass, HiXMark, HiUser, HiShoppingCart, HiOutlineUserCircle } from 'react-icons/hi2';
import Footer from '@/component/footer/Footer';
import { authUtils } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface ShopLayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: { courseId: string; semesterId: string }) => void;
  cartCount?: number;
  hideFilters?: boolean;
}

export default function ShopLayout({ children, onSearch, onFilterChange, cartCount = 0, hideFilters = false }: ShopLayoutProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [semesters, setSemesters] = useState<{ id: number; semester_number: number; description: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Check auth status on mount
  useEffect(() => {
    setIsLoggedIn(authUtils.isAuthenticated());
  }, []);

  // Fetch courses on mount if filters are not hidden
  useEffect(() => {
    if (hideFilters) return;
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/course');
        const data = await response.json();
        if (data.success) {
          setCourses(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };
    fetchCourses();
  }, [hideFilters]);

  // Fetch semesters when course is selected
  useEffect(() => {
    if (hideFilters || !selectedCourse) {
      setSemesters([]);
      setSelectedSemester('');
      return;
    }
    const fetchSemesters = async () => {
      try {
        const response = await fetch(`/api/course/${selectedCourse}`);
        const data = await response.json();
        if (data.success && data.data.semesters) {
          setSemesters(data.data.semesters);
        }
      } catch (error) {
        console.error('Failed to fetch semesters:', error);
      }
    };
    fetchSemesters();
  }, [selectedCourse, hideFilters]);

  // Notify parent component of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({ courseId: selectedCourse, semesterId: selectedSemester });
    }
  }, [selectedCourse, selectedSemester, onFilterChange]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#000000]">
      {/* Shop Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b-2 border-[#64B5F6]/30 shadow-[0_8px_32px_rgba(100,181,246,0.1)]">
        <div className="max-w-full px-4 md:px-8">
          <div className="flex justify-between items-center py-2 md:py-3 min-h-[60px] gap-2 md:gap-4 flex-nowrap">
            {/* Logo */}
            <div className="flex-shrink-0 w-20 md:w-24 lg:w-40 transition-transform duration-300 hover:scale-105 cursor-pointer" onClick={() => router.push('/')}>
              <img
                src="/newlogo.png"
                alt="Vision Publications Logo"
                className="h-10 w-auto object-contain"
              />
            </div>

            {/* Middle Section: Search & Filters */}
            {!hideFilters && (
              <div className="flex-1 flex items-center gap-3 max-w-4xl">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
                    <HiMagnifyingGlass size={16} />
                  </div>
                  <Input
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-10 py-2 bg-[#1e293b]/60 border-[#64B5F6]/20 text-white placeholder-gray-400 rounded-lg hover:border-[#64B5F6]/40 focus:border-[#64B5F6]/60 transition-all duration-200"
                    style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(100, 181, 246, 0.2)', color: 'white' }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64B5F6] hover:text-[#FF8C00] transition-colors duration-200"
                    >
                      <HiXMark size={16} />
                    </button>
                  )}
                </div>

                {/* Desktop Filters */}
                <div className="hidden lg:flex gap-3">
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="bg-[#1e293b]/60 border border-[#64B5F6]/20 text-white rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#64B5F6]/50 cursor-pointer"
                  >
                    <option value="">Course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id} className="bg-[#1e293b]">{course.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    disabled={!selectedCourse || semesters.length === 0}
                    className={`bg-[#1e293b]/60 border border-[#64B5F6]/20 text-white rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#64B5F6]/50 cursor-pointer ${
                      (!selectedCourse || semesters.length === 0) ? 'opacity-50' : 'opacity-100'
                    }`}
                  >
                    <option value="">Semester</option>
                    {semesters.map((semester) => (
                      <option key={semester.id} value={semester.id} className="bg-[#1e293b]">
                        {semester.description || `Sem ${semester.semester_number}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Special search input for cases where hideFilters is true (like on Book page where we have custom filters) */}
            {hideFilters && onSearch && (
              <div className="flex-1 max-w-xl relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
                  <HiMagnifyingGlass size={16} />
                </div>
                <Input
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-10 py-2 bg-[#1e293b]/60 border-[#64B5F6]/20 text-white placeholder-gray-400 rounded-lg hover:border-[#64B5F6]/40 focus:border-[#64B5F6]/60 transition-all duration-200"
                  style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(100, 181, 246, 0.2)', color: 'white' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64B5F6] hover:text-[#FF8C00] transition-colors duration-200"
                  >
                    <HiXMark size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* User Button */}
              {!isLoggedIn ? (
                <Button
                  type="text"
                  icon={<HiUser size={18} />}
                  onClick={() => router.push('/login')}
                  className="flex items-center justify-center p-2 rounded-lg border border-[#64B5F6]/30 text-[#64B5F6] hover:bg-[#64B5F6]/10 hover:border-[#64B5F6]/50 transition-all duration-300 h-10 w-10 md:w-auto md:px-4"
                >
                  <span className="hidden md:inline ml-1">Login</span>
                </Button>
              ) : (
                <Button
                  type="text"
                  icon={<HiOutlineUserCircle size={22} />}
                  onClick={() => router.push('/profile')}
                  className="flex items-center justify-center p-2 rounded-lg border border-[#64B5F6]/30 text-[#64B5F6] bg-[#64B5F6]/10 hover:bg-[#64B5F6]/20 hover:border-[#64B5F6]/60 transition-all duration-300 h-10 w-10"
                />
              )}

              {/* Cart Button */}
              <button
                onClick={() => router.push('/books/cart')}
                className="relative group flex items-center justify-center p-2 rounded-lg border border-[#FF8C00]/30 bg-[#FF8C00]/5 text-[#FF8C00] hover:bg-[#FF8C00]/15 hover:border-[#FF8C00]/60 transition-all duration-300 h-10 w-10"
              >
                <HiShoppingCart size={20} />
                {cartCount > 0 && (
                  <Badge
                    count={cartCount > 99 ? '99+' : cartCount}
                    className="absolute -top-2 -right-2"
                    style={{ backgroundColor: '#FF8C00', boxShadow: 'none' }}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-4 md:py-8 relative">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      <style jsx global>{`
        .ant-input::placeholder {
          color: #94a3b8 !important;
        }
        .ant-input {
          color: white !important;
        }
      `}</style>
    </div>
  );
}
