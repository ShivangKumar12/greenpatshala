// client/src/pages/public/Courses.tsx - OPTIMIZED & PRODUCTION READY - FIXED
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import CourseCard from '@/components/cards/CourseCard';
import {
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import apiClient from '@/lib/axios'; // ✅ ADDED

const levels = ['Beginner', 'Intermediate', 'Advanced'] as const;

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
};

type Course = {
  id: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  videoUrl?: string | null;
  instructor: string;
  instructorId?: number;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  originalPrice: number;
  discountPrice?: number;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  isFree?: boolean;
  isFeatured?: boolean;
};

export default function Courses() {
  const { toast } = useToast();

  // State
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  // ✅ DEBOUNCED SEARCH - Performance Optimization
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ✅ FETCH COURSES - FIXED with apiClient
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/courses'); // ✅ CHANGED

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to load courses');
      }

      const courses = (response.data.courses || []).map((c: any) => ({
        id: String(c.id),
        title: c.title,
        description: c.description,
        thumbnail: c.thumbnail || null,
        videoUrl: c.videoUrl || c.video_url || null,
        instructor: c.instructor || c.instructorName || 'Expert Instructor',
        instructorId: c.instructorId || c.instructor_id,
        duration: c.duration || 'Self-paced',
        lessons: c.totalLessons || c.total_lessons || c.lessons || 0,
        students: c.totalStudents || c.total_students || c.students || 0,
        rating: Number(c.rating || 0),
        originalPrice: Number(c.originalPrice || c.original_price || 0),
        discountPrice: c.discountPrice || c.discount_price
          ? Number(c.discountPrice || c.discount_price)
          : undefined,
        category: c.category || 'General',
        level: (c.level as any) || 'Beginner',
        isFree: Boolean(c.isFree || c.is_free),
        isFeatured: Boolean(c.isFeatured || c.is_featured),
      }));

      setAllCourses(courses);
    } catch (error: any) {
      console.error('[FETCH COURSES ERROR]', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load courses'; // ✅ CHANGED
      setError(errorMessage);
      toast({
        title: 'Error Loading Courses',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ✅ FETCH CATEGORIES - FIXED with apiClient
  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiClient.get('/categories'); // ✅ CHANGED

      if (response.data.success) {
        // Only show active categories
        const activeCategories = (response.data.categories || []).filter(
          (cat: Category) => cat.isActive !== false
        );
        setDbCategories(activeCategories);
      }
    } catch (error) {
      console.error('[FETCH CATEGORIES ERROR]', error);
      // Non-fatal error - categories are optional
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [fetchCourses, fetchCategories]);

  // ✅ FILTER TOGGLE FUNCTIONS - Memoized
  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  const toggleLevel = useCallback((level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setPriceFilter('all');
    setSearchQuery('');
    setDebouncedSearch('');
    setShowFeaturedOnly(false);
  }, []);

  // ✅ ACTIVE FILTERS COUNT
  const hasActiveFilters = useMemo(
    () =>
      selectedCategories.length > 0 ||
      selectedLevels.length > 0 ||
      priceFilter !== 'all' ||
      debouncedSearch.trim() !== '' ||
      showFeaturedOnly,
    [selectedCategories, selectedLevels, priceFilter, debouncedSearch, showFeaturedOnly]
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    count += selectedCategories.length;
    count += selectedLevels.length;
    if (priceFilter !== 'all') count += 1;
    if (showFeaturedOnly) count += 1;
    return count;
  }, [selectedCategories, selectedLevels, priceFilter, showFeaturedOnly]);

  // ✅ FILTERED & SORTED COURSES - Memoized for Performance
  const filteredCourses = useMemo(() => {
    let courses = [...allCourses];

    // Search filter
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      courses = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.instructor.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      courses = courses.filter((course) =>
        selectedCategories.includes(course.category)
      );
    }

    // Level filter
    if (selectedLevels.length > 0) {
      courses = courses.filter((course) => selectedLevels.includes(course.level));
    }

    // Price filter
    if (priceFilter === 'free') {
      courses = courses.filter((course) => course.isFree);
    } else if (priceFilter === 'paid') {
      courses = courses.filter((course) => !course.isFree);
    }

    // Featured filter
    if (showFeaturedOnly) {
      courses = courses.filter((course) => course.isFeatured);
    }

    // Sort
    courses.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.students - a.students;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return parseInt(b.id) - parseInt(a.id);
        case 'price-low': {
          const priceA = a.discountPrice ?? a.originalPrice;
          const priceB = b.discountPrice ?? b.originalPrice;
          return priceA - priceB;
        }
        case 'price-high': {
          const priceA = a.discountPrice ?? a.originalPrice;
          const priceB = b.discountPrice ?? b.originalPrice;
          return priceB - priceA;
        }
        default:
          return 0;
      }
    });

    return courses;
  }, [
    allCourses,
    debouncedSearch,
    selectedCategories,
    selectedLevels,
    priceFilter,
    showFeaturedOnly,
    sortBy,
  ]);

  // ✅ FILTER SIDEBAR COMPONENT - Reusable
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Featured Toggle */}
      <div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="featured-only"
            checked={showFeaturedOnly}
            onCheckedChange={(checked) => setShowFeaturedOnly(!!checked)}
          />
          <Label htmlFor="featured-only" className="text-sm font-medium cursor-pointer">
            ⭐ Featured Courses Only
          </Label>
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Category
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {dbCategories.length > 0 ? (
            dbCategories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <Checkbox
                  id={`category-${cat.id}`}
                  checked={selectedCategories.includes(cat.name)}
                  onCheckedChange={() => toggleCategory(cat.name)}
                  data-testid={`checkbox-category-${cat.slug}`}
                />
                <Label
                  htmlFor={`category-${cat.id}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {cat.name}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No categories available</p>
          )}
        </div>
      </div>

      {/* Level Filter */}
      <div>
        <h4 className="font-medium mb-3">Level</h4>
        <div className="space-y-2">
          {levels.map((level) => (
            <div key={level} className="flex items-center gap-2">
              <Checkbox
                id={`level-${level}`}
                checked={selectedLevels.includes(level)}
                onCheckedChange={() => toggleLevel(level)}
                data-testid={`checkbox-level-${level.toLowerCase()}`}
              />
              <Label
                htmlFor={`level-${level}`}
                className="text-sm font-normal cursor-pointer"
              >
                {level}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h4 className="font-medium mb-3">Price</h4>
        <div className="space-y-2">
          {[
            { value: 'all' as const, label: 'All Courses' },
            { value: 'free' as const, label: 'Free Courses' },
            { value: 'paid' as const, label: 'Paid Courses' },
          ].map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <Checkbox
                id={`price-${option.value}`}
                checked={priceFilter === option.value}
                onCheckedChange={() => setPriceFilter(option.value)}
                data-testid={`checkbox-price-${option.value}`}
              />
              <Label
                htmlFor={`price-${option.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
          data-testid="button-clear-filters"
        >
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Explore Our Courses
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Comprehensive collection of courses designed for competitive exam
            preparation. Start your journey to success today.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search & Sort Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses by title, instructor, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-courses"
            />
          </div>
          <div className="flex gap-2">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="lg:hidden"
                  data-testid="button-mobile-filters"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 bg-primary">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filter Courses</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <h3 className="font-semibold mb-4 text-lg">Filters</h3>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Active Filters Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {showFeaturedOnly && (
                  <Badge variant="secondary" className="gap-1">
                    ⭐ Featured
                    <button
                      onClick={() => setShowFeaturedOnly(false)}
                      className="ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="gap-1">
                    {cat}
                    <button onClick={() => toggleCategory(cat)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {selectedLevels.map((level) => (
                  <Badge key={level} variant="secondary" className="gap-1">
                    {level}
                    <button onClick={() => toggleLevel(level)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {priceFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {priceFilter === 'free' ? 'Free' : 'Paid'}
                    <button
                      onClick={() => setPriceFilter('all')}
                      className="ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4 text-sm text-muted-foreground">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading courses...
                </div>
              ) : (
                `Showing ${filteredCourses.length} ${
                  filteredCourses.length === 1 ? 'course' : 'courses'
                }`
              )}
            </div>

            {/* Error State */}
            {error && !loading && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchCourses}
                    className="ml-4"
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-8 w-1/3" />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Courses Grid */}
            {!loading && !error && (
              <>
                {filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                      <CourseCard key={course.id} {...course} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No courses found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {hasActiveFilters
                        ? 'Try adjusting your filters to see more results'
                        : 'No courses available at the moment'}
                    </p>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        data-testid="button-clear-search"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
