// client/src/pages/public/CurrentAffairs.tsx
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CurrentAffairCard from '@/components/cards/CurrentAffairCard';
import { Search, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getCurrentAffairs,
  type CurrentAffair,
} from '@/services/currentAffairsApi';

const categories = [
  'All',
  'National',
  'International Relations',
  'Economy',
  'Science & Technology',
  'Sports',
  'Environment',
  'Education',
  'Defence',
  'Judiciary',
  'Agriculture',
  'Health',
];

export default function CurrentAffairs() {
  const { toast } = useToast();

  const [affairs, setAffairs] = useState<CurrentAffair[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchAffairs(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedMonth]);

  const fetchAffairs = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const currentPage = reset ? 1 : page;
      const filters: any = { page: currentPage, limit: 12 };

      if (searchQuery.trim()) filters.search = searchQuery.trim();
      if (selectedCategory !== 'All') filters.category = selectedCategory;

      if (selectedMonth !== 'All') {
        // selectedMonth format: "November 2024"
        const [monthName, year] = selectedMonth.split(' ');
        const monthMap: Record<string, string> = {
          January: '01',
          February: '02',
          March: '03',
          April: '04',
          May: '05',
          June: '06',
          July: '07',
          August: '08',
          September: '09',
          October: '10',
          November: '11',
          December: '12',
        };
        const month = monthMap[monthName];
        if (month && year) {
          filters.fromDate = `${year}-${month}-01T00:00:00`;
          filters.toDate = `${year}-${month}-31T23:59:59`;
        }
      }

      const res = await getCurrentAffairs(filters);

      if (reset) {
        setAffairs(res.items);
      } else {
        setAffairs((prev) => [...prev, ...res.items]);
      }

      setHasMore(currentPage < res.pagination.totalPages);
      if (!reset) setPage(currentPage + 1);
    } catch (error: any) {
      console.error('Failed to fetch current affairs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load current affairs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    fetchAffairs(true);
  };

  const handleLoadMore = () => {
    fetchAffairs(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedMonth('All');
    setPage(1);
  };

  // Generate last 6 months for dropdown
  const months = ['All'];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleString('en-US', { month: 'long' });
    const year = d.getFullYear();
    months.push(`${monthName} ${year}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              Daily Updates
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Current Affairs
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Stay updated with the latest national and international news
              curated for competitive exam preparation
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading current affairs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Daily Updates
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Current Affairs
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Stay updated with the latest national and international news curated
            for competitive exam preparation
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search current affairs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
              data-testid="input-search-affairs"
            />
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48" data-testid="select-month">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        <div className="mb-8 overflow-x-auto">
          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full"
          >
            <TabsList className="inline-flex h-auto p-1 bg-muted">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="px-4 py-2"
                  data-testid={`tab-category-${category.toLowerCase()}`}
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          Showing {affairs.length} articles
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {affairs.map((affair) => (
            <CurrentAffairCard
              key={affair.id}
              id={String(affair.id)}
              title={affair.title}
              description={affair.summary || affair.content.substring(0, 150)}
              date={affair.date}
              category={affair.category}
              tags={Array.isArray(affair.tags) ? affair.tags : []}
            />
          ))}
        </div>

        {affairs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No articles found matching your criteria
            </p>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              data-testid="button-reset-filters"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {affairs.length > 0 && hasMore && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loadingMore}
              data-testid="button-load-more"
            >
              {loadingMore ? 'Loading...' : 'Load More Articles'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
