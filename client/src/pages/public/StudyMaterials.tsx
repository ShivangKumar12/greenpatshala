// client/src/pages/public/StudyMaterials.tsx - WITH PURCHASE TRACKING
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudyMaterialCard from '@/components/cards/StudyMaterialCard';
import { Search, Filter, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import {
  getStudyMaterials,
  getUserPurchasedMaterialIds,
  type StudyMaterial,
} from '@/services/studyMaterialsApi';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const categories = ['All', 'UPSC', 'SSC', 'Banking', 'Railways', 'State PSC'];
const subjects = ['All', 'History', 'Geography', 'Polity', 'Economy', 'Science', 'Maths', 'English', 'Reasoning'];

export default function StudyMaterials() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [purchasedIds, setPurchasedIds] = useState<Set<number>>(new Set());

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch purchased materials when user logs in
  useEffect(() => {
    if (user) {
      fetchPurchasedMaterials();
    } else {
      setPurchasedIds(new Set());
    }
  }, [user]);

  // Fetch materials when filters change
  useEffect(() => {
    fetchMaterials(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedSubject, priceFilter]);

  // Refetch on page visibility (when returning from payment)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchPurchasedMaterials();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const fetchPurchasedMaterials = async () => {
    try {
      const ids = await getUserPurchasedMaterialIds();
      setPurchasedIds(new Set(ids));
      console.log('[StudyMaterials] Purchased IDs:', ids);
    } catch (error: any) {
      console.error('[StudyMaterials] Failed to fetch purchased materials:', error);
      // Don't show error toast - not critical
    }
  };

  const fetchMaterials = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const currentPage = reset ? 1 : page;
      const filters: any = { page: currentPage, limit: 20 };

      if (priceFilter === 'free') {
        filters.isFree = true;
      } else if (priceFilter === 'paid') {
        filters.isFree = false;
      }

      if (selectedCategory !== 'All') {
        filters.category = selectedCategory;
      }

      if (selectedSubject !== 'All') {
        filters.subject = selectedSubject;
      }

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const res = await getStudyMaterials(filters);

      if (reset) {
        setMaterials(res.items || []);
      } else {
        setMaterials((prev) => [...prev, ...(res.items || [])]);
      }

      setHasMore(currentPage < res.pagination.totalPages);
      if (!reset) setPage(currentPage + 1);
    } catch (error: any) {
      console.error('Failed to fetch study materials:', error);
      toast({
        title: 'Error',
        description: 'Failed to load study materials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    setIsFilterOpen(false);
    fetchMaterials(true);
  };

  const handleLoadMore = () => {
    fetchMaterials(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSubject('All');
    setPriceFilter('all');
    setPage(1);
  };

  const activeFiltersCount = 
    (selectedSubject !== 'All' ? 1 : 0) + 
    (priceFilter !== 'all' ? 1 : 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
              Study Materials
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              Download comprehensive study materials, notes, and resources for your exam preparation
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading study materials...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
            Study Materials
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Download comprehensive study materials, notes, and resources for your exam preparation
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search study materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-10 sm:h-11"
                data-testid="input-search-materials"
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden sm:flex gap-2">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-36" data-testid="select-subject">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priceFilter} onValueChange={(v) => setPriceFilter(v as any)}>
                <SelectTrigger className="w-28" data-testid="select-price">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Filter Sheet */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="sm:hidden relative h-10 w-10 shrink-0"
                >
                  <Filter className="w-4 h-4" />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Filter study materials by your preferences
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger data-testid="select-subject-mobile">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price</label>
                    <Select value={priceFilter} onValueChange={(v) => setPriceFilter(v as any)}>
                      <SelectTrigger data-testid="select-price-mobile">
                        <SelectValue placeholder="Select price" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        handleClearFilters();
                        setIsFilterOpen(false);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleSearch}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Apply
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button onClick={handleSearch} className="hidden sm:flex">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="inline-flex h-auto p-1 bg-muted w-full sm:w-auto min-w-min">
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
                    data-testid={`tab-category-${category.toLowerCase().replace(' ', '-')}`}
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{materials.length}</span> material{materials.length !== 1 ? 's' : ''}
            {purchasedIds.size > 0 && user && (
              <span className="ml-2 text-green-600 font-medium">
                • {purchasedIds.size} purchased
              </span>
            )}
          </p>
          {(selectedSubject !== 'All' || priceFilter !== 'all') && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClearFilters}
              data-testid="button-clear-filters"
              className="w-full sm:w-auto"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Materials List */}
        <div className="space-y-3 sm:space-y-4">
          {materials.map((material) => (
            <StudyMaterialCard
              key={material.id}
              id={String(material.id)}
              title={material.title}
              description={material.description || ''}
              category={material.category}
              subject={material.subject}
              fileType={material.fileType}
              downloads={material.downloads}
              originalPrice={material.price || 0}
              discountPrice={material.discountPrice || undefined}
              isFree={!material.isPaid}
              isPurchased={purchasedIds.has(material.id)}
              tags={[]}
              fileUrl={material.fileUrl}
              totalPages={material.totalPages || undefined}
            />
          ))}
        </div>

        {/* Empty State */}
        {materials.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">No materials found matching your criteria</p>
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              data-testid="button-reset-filters"
            >
              <X className="w-4 h-4 mr-2" />
              Reset All Filters
            </Button>
          </div>
        )}

        {/* Load More */}
        {materials.length > 0 && hasMore && (
          <div className="mt-6 sm:mt-8 text-center">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full sm:w-auto min-w-[200px]"
            >
              {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Loading...
                </>
              ) : (
                'Load More Materials'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
