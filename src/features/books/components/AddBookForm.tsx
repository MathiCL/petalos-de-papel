'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookSchema, BookFormData } from '../schemas/book';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useState, useEffect, useCallback } from 'react';
import { createBook } from '@/services/books';
import { toast } from 'sonner';
import { Search, Book as BookIcon, ChevronLeft, Loader2 } from 'lucide-react';

interface AddBookFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    categories?: string[];
    industryIdentifiers?: { type: string, identifier: string }[];
    imageLinks?: {
      thumbnail?: string;
    };
  };
}

export function AddBookForm({ onSuccess, onCancel }: AddBookFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GoogleBookItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: '',
      author: '',
      cover_url: '',
      publisher: '',
      publish_year: undefined,
      description: '',
      isbn: '',
      categories: [],
      review: '',
      rating: 5,
      read_date: new Date().toISOString().split('T')[0],
    },
  });

  const searchGoogleBooks = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    let results: GoogleBookItem[] = [];

    try {
      // Intento primario: Google Books
      try {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=15`);
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            results = data.items;
          }
        }
      } catch (googleError) {
        console.warn('Google Books fetch falló (posible bloqueo CORS o red).', googleError);
      }

      // Intento secundario: Apple Books
      if (results.length === 0) {
        try {
          // Buscamos en Apple Books (iTunes API) que suele tener metadatos muy actualizados de libros comerciales
          const appleRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=ebook&limit=15`);
          if (appleRes.ok) {
            const appleData = await appleRes.json();
            if (appleData.results && appleData.results.length > 0) {
              results = appleData.results.map((doc: any) => ({
                id: doc.trackId?.toString() || String(Math.random()),
                volumeInfo: {
                  title: doc.trackName,
                  authors: doc.artistName ? [doc.artistName] : ['Autor Desconocido'],
                  publisher: undefined,
                  publishedDate: doc.releaseDate ? doc.releaseDate.split('T')[0] : undefined,
                  description: doc.description,
                  categories: doc.genres,
                  imageLinks: {
                    // Reemplazamos la URL de 100x100 para obtener una portada de mayor resolución (600x600)
                    thumbnail: doc.artworkUrl100 ? doc.artworkUrl100.replace('100x100bb', '600x600bb') : undefined
                  }
                }
              }));
            }
          }
        } catch (appleError) {
          console.warn('Apple Books fetch falló.', appleError);
        }
      }

      // Intento terciario (Fallback): OpenLibrary
      if (results.length === 0) {
        const fallbackRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
        if (!fallbackRes.ok) throw new Error('OpenLibrary fallback failed');
        
        const fallbackData = await fallbackRes.json();
        if (fallbackData.docs) {
          results = fallbackData.docs.map((doc: any) => ({
            id: doc.key || String(Math.random()),
            volumeInfo: {
              title: doc.title,
              authors: doc.author_name || ['Autor Desconocido'],
              publisher: doc.publisher ? doc.publisher[0] : undefined,
              publishedDate: doc.first_publish_year ? doc.first_publish_year.toString() : undefined,
              categories: doc.subject ? doc.subject.slice(0, 3) : [],
              imageLinks: {
                thumbnail: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined
              }
            }
          }));
        }
      }

      setSearchResults(results);
    } catch (error: any) {
      console.error('Error fetching books', error);
      toast.error('Error buscando libros. Revisa tu conexión.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchGoogleBooks(searchQuery);
    }, 500); // debounce 500ms
    return () => clearTimeout(timer);
  }, [searchQuery, searchGoogleBooks]);

  const handleSelectBook = (book: GoogleBookItem) => {
    const info = book.volumeInfo;
    form.setValue('title', info.title || '');
    form.setValue('author', info.authors ? info.authors.join(', ') : 'Autor Desconocido');
    form.setValue('cover_url', info.imageLinks?.thumbnail?.replace('http:', 'https:') || null);
    form.setValue('publisher', info.publisher || null);
    
    if (info.publishedDate) {
      const year = parseInt(info.publishedDate.split('-')[0], 10);
      form.setValue('publish_year', isNaN(year) ? null : year);
    } else {
      form.setValue('publish_year', null);
    }
    
    form.setValue('description', info.description || null);
    form.setValue('categories', info.categories || []);
    
    const isbn13 = info.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier;
    const isbn10 = info.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier;
    form.setValue('isbn', isbn13 || isbn10 || null);
    
    setStep(2);
  };

  const handleManualEntry = () => {
    form.setValue('title', searchQuery || 'Título Desconocido');
    form.setValue('author', 'Autor Desconocido');
    setStep(2);
  };

  const onSubmit = async (data: BookFormData) => {
    setIsSubmitting(true);
    try {
      await createBook({
        title: data.title,
        author: data.author,
        cover_url: data.cover_url,
        publisher: data.publisher,
        publish_year: data.publish_year,
        description: data.description,
        isbn: data.isbn,
        categories: data.categories,
        review: data.review,
        rating: data.rating,
        read_date: data.read_date,
      });
      form.reset();
      toast.success('¡Lectura añadida a tu jardín! 🌸');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el libro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Busca por título o autor..." 
              className="pl-9 h-12 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          <div className="min-h-[250px] max-h-[350px] overflow-y-auto space-y-2 pr-2">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary/60" />
                <span className="text-sm">Buscando en el catálogo...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <ul className="space-y-2">
                {searchResults.map((book) => {
                  const cover = book.volumeInfo.imageLinks?.thumbnail;
                  return (
                    <li key={book.id}>
                      <button 
                        type="button"
                        onClick={() => handleSelectBook(book)}
                        className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-accent/30 transition-colors border border-transparent hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        {cover ? (
                          <img src={cover.replace('http:', 'https:')} alt={book.volumeInfo.title} className="w-12 h-16 object-cover rounded-sm shadow-sm" />
                        ) : (
                          <div className="w-12 h-16 bg-muted flex items-center justify-center rounded-sm border border-border">
                            <BookIcon className="w-6 h-6 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-serif font-medium text-foreground truncate">{book.volumeInfo.title}</span>
                          <span className="text-sm text-muted-foreground truncate">{book.volumeInfo.authors?.join(', ') || 'Autor Desconocido'}</span>
                          <span className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">{book.volumeInfo.publishedDate?.split('-')[0]} • {book.volumeInfo.publisher}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : searchQuery.length > 2 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-3 text-center px-4">
                <p>No encontramos resultados para "{searchQuery}"</p>
                <Button variant="outline" size="sm" onClick={handleManualEntry}>
                  Introducir datos manualmente
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/60 text-center">
                <BookIcon className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">Escribe el nombre del libro para buscar su información y portada</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-2 border-t border-border/40">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
            {searchQuery.length > 0 && searchResults.length === 0 && !isSearching && (
              <Button type="button" onClick={handleManualEntry} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Añadir Manualmente
              </Button>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* Ficha Bibliográfica Previa */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-4 p-4 bg-card shadow-sm rounded-xl border border-border/60">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                {form.getValues('cover_url') ? (
                  <img src={form.getValues('cover_url')!} alt="Cover" className="w-24 h-36 object-cover rounded-md shadow-md border border-border/40" />
                ) : (
                  <div className="w-24 h-36 bg-[#F7F4EF] flex items-center justify-center rounded-md border border-[#EEDCA1]/50 shadow-inner">
                    <BookIcon className="w-8 h-8 text-[#D75F66]/30" />
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-grow pt-1 text-center sm:text-left">
                <h4 className="font-serif font-bold text-lg text-primary leading-tight mb-1">{form.getValues('title')}</h4>
                <span className="text-sm font-medium text-secondary-foreground mb-2">por {form.getValues('author')}</span>
                
                <div className="text-xs text-muted-foreground space-y-1 mb-2">
                  {form.getValues('publisher') && (
                    <p>{form.getValues('publisher')} {form.getValues('publish_year') ? `(${form.getValues('publish_year')})` : ''}</p>
                  )}
                  {form.getValues('categories') && form.getValues('categories')!.length > 0 && (
                    <p className="italic">{form.getValues('categories')!.join(', ')}</p>
                  )}
                </div>
                
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-xs text-accent hover:text-[#d1555c] mt-auto flex items-center justify-center sm:justify-start gap-1 w-fit transition-colors mx-auto sm:mx-0"
                >
                  <ChevronLeft className="w-3 h-3" /> Buscar otro libro
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Puntuación (1-5)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={5} 
                        {...field} 
                        onChange={e => field.onChange(Number(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="read_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de lectura</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="review"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tu reseña personal (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="¿Qué sentimientos o memorias te dejó este libro?" 
                      className="resize-none h-24 bg-background/50 focus:bg-background transition-colors" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-2">
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isSubmitting ? 'Plantando semilla...' : 'Añadir al Jardín 🌸'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
