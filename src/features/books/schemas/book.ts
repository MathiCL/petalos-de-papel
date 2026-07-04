import { z } from 'zod';

export const bookSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(100, 'El título es demasiado largo'),
  author: z.string().min(1, 'El autor es obligatorio').max(100, 'El autor es demasiado largo'),
  cover_url: z.string().url().optional().nullable(),
  publisher: z.string().optional().nullable(),
  publish_year: z.number().optional().nullable(),
  description: z.string().optional().nullable(),
  isbn: z.string().optional().nullable(),
  categories: z.array(z.string()).optional().nullable(),
  review: z.string().max(500, 'La reseña no debe exceder los 500 caracteres').optional(),
  rating: z.number().min(1, 'La puntuación debe ser al menos 1').max(5, 'La puntuación máxima es 5'),
  read_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Fecha no válida',
  }),
});

export type BookFormData = z.infer<typeof bookSchema>;
