import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight } from 'lucide-react';

interface CurrentAffairCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  imageUrl?: string;
}

export default function CurrentAffairCard({
  id,
  title,
  description,
  date,
  category,
  tags,
  imageUrl,
}: CurrentAffairCardProps) {
  return (
    <Card className="group hover-elevate overflow-hidden" data-testid={`card-affair-${id}`}>
      {imageUrl && (
        <div className="aspect-video bg-muted overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge>{category}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(date).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })}
          </span>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
        </div>
        
        <Link href={`/current-affairs/${id}`}>
          <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all" data-testid={`link-read-affair-${id}`}>
            Read More
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </CardContent>
    </Card>
  );
}
