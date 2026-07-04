'use client';

import { Book } from '@/services/books';
import { Book as BookIcon } from 'lucide-react';

interface BookCardProps {
  book: Book;
  index: number;
  onClick?: (book: Book) => void;
}

const COLORS = [
  '#E67A73', // Coral profundo
  '#ECA586', // Naranja pálido / Peach
  '#EEDCA1', // Oro suave
  '#F4E2CD', // Crema
  '#D75F66', // Rosa intenso / Magenta suave
  '#E8928A', // Coral claro
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function MiniFloralGroup({ book, index }: { book: Book, index: number }) {
  const seed = hashString(book.id || String(index));
  const colorIndex = seed % COLORS.length;
  const fill = COLORS[colorIndex];
  
  // Reutilizamos la silueta del pétalo principal
  const size = 16;
  const width = size * 0.7;
  const petalLeft = `M 0,0 C -${width},-${size*0.4} -${width*0.4},-${size*0.9} 0,-${size} Z`;
  const petalRight = `M 0,0 C ${width},-${size*0.4} ${width*0.4},-${size*0.9} 0,-${size} Z`;

  return (
    <div className="absolute -top-3 -right-3 rotate-[15deg] opacity-90 drop-shadow-sm">
      <svg width="40" height="40" viewBox="-20 -20 40 40">
        <path d={petalLeft} fill={fill} />
        <path d={petalRight} fill={fill} />
        <path d={petalRight} fill="rgba(0,0,0,0.1)" />
        <path d={`M 0,0 L 0,-${size}`} stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
}

export function BookCard({ book, index, onClick }: BookCardProps) {
  return (
    <div 
      onClick={() => onClick && onClick(book)}
      className={`group relative p-5 bg-card/80 backdrop-blur-sm shadow-sm rounded-xl border border-border/40 hover:shadow-lg hover:border-secondary/40 transition-all duration-300 hover:-translate-y-1 flex gap-4 ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Decorative Mini Flower */}
      <MiniFloralGroup book={book} index={index} />
      
      {/* Cover Image */}
      <div className="flex-shrink-0">
        {book.cover_url ? (
          <img 
            src={book.cover_url} 
            alt={`Portada de ${book.title}`} 
            className="w-20 h-28 sm:w-24 sm:h-36 object-cover rounded-md shadow-md border border-border/50 group-hover:shadow-lg transition-all"
          />
        ) : (
          <div className="w-20 h-28 sm:w-24 sm:h-36 bg-[#F7F4EF] flex items-center justify-center rounded-md border border-[#EEDCA1]/50 shadow-inner">
            <BookIcon className="w-8 h-8 text-[#D75F66]/30" />
          </div>
        )}
      </div>

      {/* Book Details */}
      <div className="flex flex-col flex-grow overflow-hidden">
        <h3 className="font-serif font-bold text-lg sm:text-xl text-primary leading-tight truncate" title={book.title}>
          {book.title}
        </h3>
        <span className="text-sm text-secondary-foreground italic mt-0.5 truncate" title={book.author}>
          por {book.author}
        </span>
        
        <div className="flex items-center gap-1 mt-2 text-sm text-accent" title={`${book.rating} estrellas`}>
          {'★'.repeat(book.rating)}
          <span className="text-muted/30">{'★'.repeat(5 - book.rating)}</span>
        </div>
        
        {book.review && (
          <p className="text-sm mt-3 text-foreground/80 italic leading-relaxed line-clamp-2 sm:line-clamp-3 relative pl-3 border-l-2 border-[#ECA586]/40">
            "{book.review}"
          </p>
        )}
        
        <div className="mt-auto pt-4 flex flex-wrap items-center justify-between text-xs text-muted-foreground">
          {book.publisher && book.publish_year && (
            <span className="truncate max-w-[50%]">{book.publisher}, {book.publish_year}</span>
          )}
          <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold opacity-70">
            {new Date(book.read_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
}
