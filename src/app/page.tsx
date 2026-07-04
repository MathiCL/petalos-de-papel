'use client';

import { useEffect, useState, useMemo } from 'react';
import { getBooks, Book } from '@/services/books';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, Flower2, Search as SearchIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AddBookForm } from '@/features/books/components/AddBookForm';
import { OrganicFlower } from '@/features/flower/components/OrganicFlower';
import { BookCard } from '@/features/books/components/BookCard';
import { BookDetailsModal } from '@/features/books/components/BookDetailsModal';
import { Input } from '@/components/ui/input';

function getEmotionalMessage(count: number) {
  if (count === 0) return "Tu jardín espera su primera historia";
  if (count === 1) return "Ha nacido una nueva historia";
  if (count >= 2 && count <= 4) return "Tu flor comienza a abrirse";
  if (count >= 5 && count <= 14) return "Tu flor cobra vida";
  if (count >= 15 && count <= 29) return "Tu jardín florece";
  return "Tu jardín ya guarda muchas historias";
}

type ViewMode = 'jardin' | 'biblioteca';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('jardin');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      setBooks(data.reverse()); // Los más antiguos primero para la flor
    } catch (err: any) {
      setError(err.message || 'Error al conectar con Supabase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBookAdded = () => {
    setIsModalOpen(false);
    fetchBooks();
  };

  // Derived Statistics
  const stats = useMemo(() => {
    if (books.length === 0) return null;
    const total = books.length;
    const avgRating = (books.reduce((acc, b) => acc + b.rating, 0) / total).toFixed(1);
    
    // Most read author
    const authors = books.map(b => b.author);
    const authorCounts = authors.reduce((acc, a) => {
      acc[a] = (acc[a] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topAuthor = Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0][0];

    // Favorite Genre
    const categories = books.flatMap(b => b.categories || []);
    const categoryCounts = categories.reduce((acc, c) => {
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topGenre = Object.entries(categoryCounts).length > 0 
      ? Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0] 
      : null;

    // Top rated book
    const topBook = [...books].sort((a, b) => b.rating - a.rating)[0];

    const lastBook = [...books].sort((a, b) => new Date(b.read_date).getTime() - new Date(a.read_date).getTime())[0];

    // Garden level
    let level = "Semilla";
    if (total >= 1 && total <= 4) level = "Brote";
    else if (total >= 5 && total <= 14) level = "Capullo";
    else if (total >= 15 && total <= 29) level = "Primera Flor";
    else if (total >= 30) level = "Jardín Abundante";

    return { total, avgRating, topAuthor, lastBook, topGenre, topBook, level };
  }, [books]);

  // Filtered books for library view (reversed to show newest first)
  const filteredBooks = useMemo(() => {
    let result = [...books].reverse();
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.author.toLowerCase().includes(q) ||
        (b.publish_year && b.publish_year.toString().includes(q))
      );
    }
    return result;
  }, [books, searchQuery]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F7F4EF] to-[#F3F0EB]">
        <p className="text-foreground animate-pulse font-serif text-lg">Despertando tu jardín...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F7F4EF] to-[#F3F0EB] p-4">
        <div className="bg-destructive/10 text-destructive p-6 rounded-md max-w-md border border-destructive/20">
          <h2 className="font-bold text-lg mb-2">Error de conexión ❌</h2>
          <p className="text-sm">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gradient-to-b from-[#F7F4EF] to-[#F3F0EB] text-foreground flex flex-col items-center overflow-x-hidden relative">
      
      {/* Fondo Global Decorativo - Pantalla Completa */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex justify-between items-end opacity-40">
        <svg width="300" height="400" viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="translate-y-20 -translate-x-10 opacity-70">
          <path d="M-50,400 Q100,200 250,50" stroke="#7B9E89" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
          <path d="M-20,400 Q80,250 180,100" stroke="#7B9E89" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
          <path d="M100,200 C150,180 180,220 160,250 C130,280 100,250 100,200 Z" fill="#ECA586" opacity="0.15"/>
          <circle cx="200" cy="150" r="3" fill="#D75F66" opacity="0.3"/>
          <circle cx="150" cy="100" r="2" fill="#ECA586" opacity="0.4"/>
        </svg>

        <svg width="300" height="400" viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="translate-y-10 translate-x-10 opacity-70">
          <path d="M350,400 Q200,250 50,150" stroke="#7B9E89" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
          <path d="M280,400 Q200,300 120,200" stroke="#7B9E89" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
          <path d="M150,250 C100,230 70,270 90,300 C120,330 150,300 150,250 Z" fill="#D75F66" opacity="0.15"/>
          <circle cx="100" cy="200" r="3" fill="#ECA586" opacity="0.3"/>
          <circle cx="150" cy="150" r="2" fill="#D75F66" opacity="0.4"/>
        </svg>
      </div>

      <div className="max-w-4xl w-full flex flex-col items-center relative z-10">
        
        <header className="flex flex-col items-center mt-2 mb-6 w-full">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-primary text-center tracking-tight drop-shadow-sm">
            Pétalos de Papel
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-center italic mt-2">
            Tu diario lector botánico
          </p>

          {/* Stats Panel */}
          {stats && (
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-6 bg-card/60 backdrop-blur-sm px-8 py-4 rounded-3xl border border-border/50 shadow-sm text-sm max-w-2xl">
              <span className="flex items-center gap-1.5 font-medium"><Flower2 size={16} className="text-[#D75F66]" /> {stats.level} ({stats.total})</span>
              <span className="flex items-center gap-1.5 text-accent" title="Promedio">⭐ {stats.avgRating}</span>
              <span className="flex items-center gap-1.5 text-secondary-foreground" title="Autor más leído">📚 {stats.topAuthor}</span>
              {stats.topGenre && <span className="hidden sm:flex items-center gap-1.5 text-muted-foreground" title="Género favorito">📖 {stats.topGenre}</span>}
              <span className="hidden md:flex items-center gap-1.5 text-muted-foreground">🏆 Mejor: {stats.topBook.title}</span>
            </div>
          )}

          {/* View Toggle */}
          <div className="flex bg-card/80 p-1 mt-6 rounded-full border border-border/40 shadow-inner">
            <button
              onClick={() => setViewMode('jardin')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 ${
                viewMode === 'jardin' ? 'bg-[#ECA586] text-white shadow-md' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Flower2 size={18} />
              <span className="font-medium text-sm">Jardín</span>
            </button>
            <button
              onClick={() => setViewMode('biblioteca')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 ${
                viewMode === 'biblioteca' ? 'bg-[#ECA586] text-white shadow-md' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid size={18} />
              <span className="font-medium text-sm">Biblioteca</span>
            </button>
          </div>
        </header>

        {viewMode === 'jardin' ? (
          <section className="w-full relative z-10 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 mb-32">
            <OrganicFlower books={books} onSelectBook={setSelectedBook} />
            
            <p className="font-serif text-2xl sm:text-3xl font-medium text-[#b3645c] mt-8 transition-all duration-1000 text-center drop-shadow-sm px-4">
              {getEmotionalMessage(books.length)}
            </p>
          </section>
        ) : (
          <section className="w-full max-w-3xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[500px]">
            <div className="w-full mb-6 flex justify-between items-center bg-card/60 p-3 rounded-xl border border-border/40 shadow-sm backdrop-blur-sm">
              <div className="relative w-full sm:max-w-xs">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Buscar autor, título o año..." 
                  className="pl-9 h-9 border-muted/40 focus-visible:ring-accent/30 bg-background/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredBooks.length > 0 ? (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
                {filteredBooks.map((book) => {
                  // Necesitamos el índice original para el rendering determinista de la flor
                  const originalIndex = books.findIndex(b => b.id === book.id);
                  return <BookCard key={book.id} book={book} index={originalIndex} onClick={setSelectedBook} />;
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center mt-12 text-muted-foreground/60">
                <SearchIcon className="w-12 h-12 mb-4 opacity-30" />
                <p>No se encontraron historias que coincidan con tu búsqueda.</p>
              </div>
            )}
          </section>
        )}

        {/* Global Add Button */}
        <div className="fixed bottom-8 z-50">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-[#d1555c] rounded-full px-8 py-6 shadow-xl flex items-center gap-2 text-md transition-all duration-300 hover:scale-105 hover:-translate-y-1 ring-4 ring-[#F7F4EF]/50"
          >
            <Plus size={22} strokeWidth={2.5} />
            <span className="font-medium font-serif tracking-wide">Plantar Semilla</span>
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg bg-[#F7F4EF] border-[#ECA586]/30 shadow-2xl rounded-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-serif text-2xl text-primary flex items-center gap-2">
              <Flower2 className="text-accent" /> Plantar una semilla
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Busca el libro que acabas de leer. Su historia germinará en tu jardín.
            </DialogDescription>
          </DialogHeader>
          <AddBookForm 
            onSuccess={handleBookAdded} 
            onCancel={() => setIsModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <BookDetailsModal 
        book={selectedBook} 
        isOpen={!!selectedBook} 
        onClose={() => setSelectedBook(null)}
        onBookUpdated={() => {
          setSelectedBook(null);
          fetchBooks();
        }}
      />
    </main>
  );
}
