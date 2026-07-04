-- Script para crear la tabla de libros en Supabase

CREATE TABLE books (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  author text NOT NULL,
  cover_url text,
  review text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  read_date date NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Permitir acceso público completo para el MVP (sin autenticación)
CREATE POLICY "Allow public read access" ON books FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON books FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON books FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON books FOR DELETE USING (true);
