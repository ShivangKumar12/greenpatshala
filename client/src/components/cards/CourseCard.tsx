// client/src/components/cards/CourseCard.tsx - WITH LOGO PLACEHOLDER
import { Link } from 'wouter';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, BookOpen, Star, GraduationCap } from 'lucide-react';
import { useState } from 'react';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  instructor: string;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  originalPrice: number;
  discountPrice?: number;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  isFree?: boolean;
}

export default function CourseCard({
  id,
  title,
  description,
  thumbnail,
  instructor,
  duration,
  lessons,
  students,
  rating,
  originalPrice,
  discountPrice,
  category,
  level,
  isFree = false,
}: CourseCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasDiscount = discountPrice !== undefined && discountPrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    : 0;

  const levelColors = {
    Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const showPlaceholder = !thumbnail || imageError;

  return (
    <Card className="group overflow-hidden glass-panel premium-shadow flex flex-col h-full" data-testid={`card-course-${id}`}>
      <div className="aspect-video bg-muted relative overflow-hidden rounded-t-xl">
        {showPlaceholder ? (
          // Logo Placeholder - Same gradient style as original
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <GraduationCap className="w-16 h-16 text-primary mb-2" />
            <p className="text-sm font-semibold text-primary">Unchi Udaan</p>
            <p className="text-xs text-muted-foreground mt-1 text-center px-4 line-clamp-2">
              {title}
            </p>
          </div>
        ) : (
          // Actual Image
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}

        {/* Discount/Free Badge */}
        {hasDiscount && !isFree && (
          <Badge className="absolute top-3 left-3 bg-red-500/90 hover:bg-red-500 backdrop-blur-sm text-white border-0 shadow-sm rounded-md px-2.5 py-0.5">
            {discountPercent}% OFF
          </Badge>
        )}
        {isFree && (
          <Badge className="absolute top-3 left-3 bg-emerald-500/90 hover:bg-emerald-500 backdrop-blur-sm text-white border-0 shadow-sm rounded-md px-2.5 py-0.5 tracking-wide">
            FREE
          </Badge>
        )}

        {/* Level Badge */}
        <Badge variant="secondary" className={`absolute top-3 right-3 shadow-sm rounded-md px-2.5 py-0.5 backdrop-blur-sm border-0 ${levelColors[level]}`}>
          {level}
        </Badge>
      </div>

      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted/30 border-border/50 rounded-md">
            {category}
          </Badge>
          <div className="flex items-center gap-1 text-sm font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-2 py-0.5 rounded-md">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {description}
        </p>

        {/* Instructor */}
        <p className="text-sm text-muted-foreground mb-3">
          by <span className="text-foreground font-medium">{instructor}</span>
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border/40">
          <span className="flex items-center gap-1.5 font-medium" title="Duration">
            <Clock className="w-4 h-4 text-primary/70" />
            {duration}
          </span>
          <span className="flex items-center gap-1.5 font-medium" title="Lessons">
            <BookOpen className="w-4 h-4 text-primary/70" />
            {lessons}
          </span>
          <span className="flex items-center gap-1.5 font-medium" title="Students">
            <Users className="w-4 h-4 text-primary/70" />
            {students.toLocaleString()}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-5 bg-muted/20 border-t flex items-center justify-between gap-3">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          {isFree ? (
            <span className="text-lg font-bold text-green-600">Free</span>
          ) : (
            <>
              <span className="text-lg font-bold">
                ₹{(discountPrice ?? originalPrice).toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{originalPrice.toLocaleString()}
                </span>
              )}
            </>
          )}
        </div>

        {/* View Button */}
        <Link href={`/courses/${id}`}>
          <Button size="sm" className="btn-premium font-medium rounded-full px-5" data-testid={`button-view-course-${id}`}>
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card >
  );
}
