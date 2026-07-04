'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useState } from 'react';
import { updateBook, Book } from '@/services/books';
import { toast } from 'sonner';

// Esquema de validación solo para los campos editables
const editBookSchema = z.object({
  rating: z.number().min(1).max(5),
  read_date: z.string(),
  review: z.string().optional(),
});

type EditBookFormData = z.infer<typeof editBookSchema>;

interface EditBookFormProps {
  book: Book;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditBookForm({ book, onSuccess, onCancel }: EditBookFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditBookFormData>({
    resolver: zodResolver(editBookSchema),
    defaultValues: {
      rating: book.rating,
      read_date: book.read_date,
      review: book.review || '',
    },
  });

  const onSubmit = async (data: EditBookFormData) => {
    setIsSubmitting(true);
    try {
      await updateBook(book.id, {
        rating: data.rating,
        read_date: data.read_date,
        review: data.review,
      });
      toast.success('¡Memoria botánica actualizada! 🌸');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el libro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in duration-300">
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-secondary-foreground font-serif">Puntuación (1-5)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    max={5} 
                    className="border-muted/60 focus-visible:ring-accent/30 bg-background/50"
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
                <FormLabel className="text-secondary-foreground font-serif">Fecha de lectura</FormLabel>
                <FormControl>
                  <Input type="date" className="border-muted/60 focus-visible:ring-accent/30 bg-background/50" {...field} />
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
              <FormLabel className="text-secondary-foreground font-serif">Tu reseña personal</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="¿Qué sentimientos o memorias te dejó este libro?" 
                  className="resize-none h-32 bg-background/50 focus:bg-background transition-colors border-muted/60 focus-visible:ring-accent/30" 
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
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
