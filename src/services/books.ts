import { supabase } from '@/lib/supabase/client';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover_url?: string | null;
  publisher?: string | null;
  publish_year?: number | null;
  description?: string | null;
  isbn?: string | null;
  categories?: string[] | null;
  review?: string | null;
  rating: number;
  read_date: string;
  created_at?: string;
}

export const getBooks = async (): Promise<Book[]> => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('read_date', { ascending: false });

  if (error) {
    console.error('Error fetching books:', error);
    throw new Error(error.message);
  }
  
  return data as Book[];
};

export const createBook = async (book: Omit<Book, 'id' | 'created_at'>): Promise<Book> => {
  const { data, error } = await supabase
    .from('books')
    .insert([book])
    .select()
    .single();

  if (error) {
    console.error('Error insertando libro:', JSON.stringify(error, null, 2), error);
    throw new Error(error.message || 'Error al guardar el libro');
  }
  
  return data as Book;
};

export const updateBook = async (id: string, updates: Partial<Book>): Promise<Book> => {
  const { data, error } = await supabase
    .from('books')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating book:', error);
    throw new Error(error.message);
  }
  
  return data as Book;
};

export const deleteBook = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting book:', error);
    throw new Error(error.message);
  }
};
