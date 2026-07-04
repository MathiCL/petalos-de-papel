'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Book, deleteBook } from '@/services/books';
import { Book as BookIcon, Edit3, Trash2, Calendar, Star, Tag, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditBookForm } from './EditBookForm';
import { toast } from 'sonner';

interface BookDetailsModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onBookUpdated: () => void;
}

export function BookDetailsModal({ book, isOpen, onClose, onBookUpdated }: BookDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!book) return null;

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres podar esta flor de tu jardín? Esta acción no se puede deshacer.')) {
      setIsDeleting(true);
      try {
        await deleteBook(book.id);
        toast.success('Libro podado del jardín con éxito.');
        onBookUpdated();
        onClose();
      } catch (error: any) {
        toast.error(error.message || 'Error al eliminar el libro');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleUpdateSuccess = () => {
    setIsEditing(false);
    onBookUpdated();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setIsEditing(false);
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl bg-[#F7F4EF] border-[#ECA586]/30 shadow-2xl rounded-2xl overflow-hidden p-0 max-h-[90vh] flex flex-col">
        {/* Header Decorativo */}
        <div className="bg-gradient-to-b from-[#ECA586]/20 to-transparent pt-6 pb-2 px-6 flex justify-between items-start">
          <DialogTitle className="font-serif text-2xl text-primary flex-1 pr-4 leading-tight">
            {isEditing ? 'Editar Memoria' : book.title}
          </DialogTitle>
          {!isEditing && (
            <div className="flex gap-2 shrink-0">
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-accent rounded-full w-8 h-8">
                <Edit3 size={16} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting} className="text-muted-foreground hover:text-destructive rounded-full w-8 h-8">
                <Trash2 size={16} />
              </Button>
            </div>
          )}
        </div>

        <DialogDescription className="sr-only">Detalles del libro {book.title}</DialogDescription>

        {/* Content Area */}
        <div className="px-6 pb-6 overflow-y-auto custom-scrollbar">
          {isEditing ? (
            <div className="mt-4">
              <EditBookForm 
                book={book} 
                onSuccess={handleUpdateSuccess} 
                onCancel={() => setIsEditing(false)} 
              />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 mt-2">
              
              {/* Columna Izquierda: Portada y Metadatos */}
              <div className="flex flex-col shrink-0 w-full md:w-1/3 items-center md:items-start gap-4">
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.title} className="w-40 md:w-full object-cover rounded-md shadow-md border border-border/40" />
                ) : (
                  <div className="w-40 md:w-full aspect-[2/3] bg-muted/50 flex flex-col items-center justify-center rounded-md border border-border/50 shadow-inner">
                    <BookIcon className="w-10 h-10 text-muted-foreground/30 mb-2" />
                  </div>
                )}

                <div className="w-full space-y-3 bg-card/40 p-4 rounded-xl border border-border/30 text-sm">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <BookIcon size={14} className="mt-0.5 shrink-0" />
                    <span className="font-medium text-foreground">{book.author}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={14} className="shrink-0" />
                    <span>{new Date(book.read_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>

                  <div className="flex items-center gap-2 text-accent">
                    <Star size={14} className="shrink-0" fill="currentColor" />
                    <span className="font-medium">{book.rating} / 5</span>
                  </div>

                  {book.categories && book.categories.length > 0 && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Tag size={14} className="mt-0.5 shrink-0" />
                      <span className="italic line-clamp-2">{book.categories.join(', ')}</span>
                    </div>
                  )}

                  {(book.publisher || book.publish_year) && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Building size={14} className="mt-0.5 shrink-0" />
                      <span className="text-xs">
                        {book.publisher} {book.publish_year ? `(${book.publish_year})` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Columna Derecha: Reseña y Sinopsis */}
              <div className="flex flex-col flex-grow gap-6">
                
                {/* Reseña Personal */}
                <div className="flex flex-col">
                  <h4 className="font-serif text-lg text-primary/80 mb-2 border-b border-border/40 pb-1 flex items-center justify-between">
                    Tu Memoria
                    <span className="text-xs text-muted-foreground font-sans font-normal opacity-50 bg-background/50 px-2 py-0.5 rounded-full border border-border/30">
                      ID: {book.id.slice(0, 6)}...
                    </span>
                  </h4>
                  {book.review ? (
                    <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-sm italic bg-card/30 p-4 rounded-xl border border-[#ECA586]/20 relative">
                      <span className="absolute -top-2 -left-2 text-4xl text-[#ECA586]/30 font-serif">"</span>
                      {book.review}
                      <span className="absolute -bottom-6 -right-2 text-4xl text-[#ECA586]/30 font-serif">"</span>
                    </p>
                  ) : (
                    <p className="text-muted-foreground/60 text-sm italic">
                      No dejaste una reseña escrita para esta flor.
                    </p>
                  )}
                </div>

                {/* Sinopsis Original (si existe) */}
                {book.description && (
                  <div className="flex flex-col mt-4">
                    <h4 className="font-serif text-base text-muted-foreground mb-2">Sinopsis Original</h4>
                    <p className="text-muted-foreground/80 text-xs leading-relaxed line-clamp-6 hover:line-clamp-none transition-all">
                      {book.description}
                    </p>
                  </div>
                )}
                
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
