'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book } from '@/services/books';
import { OrganicFlower } from './OrganicFlower';
import { Flower2, Book as BookIcon } from 'lucide-react';

interface GardenProps {
  books: Book[];
  onSelectBook?: (book: Book) => void;
}

// Genera un tamaño de chunk entre 15 y 20 de forma pseudoaleatoria predecible
function getChunkSize(index: number) {
  return 15 + (index % 6); // 15, 16, 17, 18, 19, 20
}

function chunkBooks(books: Book[]) {
  const chunks: Book[][] = [];
  let i = 0;
  let flowerIndex = 0;
  while (i < books.length) {
    const size = getChunkSize(flowerIndex);
    chunks.push(books.slice(i, i + size));
    i += size;
    flowerIndex++;
  }
  return chunks;
}

// Posiciones armónicas en 2.5D para el jardín
const FLOWER_POSITIONS = [
  { bottom: '15%', left: '50%', scale: 1.1, zIndex: 30, curve: 0, colorVariant: 'default' as const, stemHeight: 1 }, // Centro principal
  { bottom: '20%', left: '68%', scale: 0.9, zIndex: 25, curve: 0.6, colorVariant: 'warm' as const, stemHeight: 0.8 }, // Derecha
  { bottom: '22%', left: '32%', scale: 0.85, zIndex: 20, curve: -0.5, colorVariant: 'cool' as const, stemHeight: 1.1 }, // Izquierda atrás
  { bottom: '28%', left: '80%', scale: 0.7, zIndex: 15, curve: 0.3, colorVariant: 'mixed' as const, stemHeight: 0.9 }, // Derecha lejos
  { bottom: '25%', left: '18%', scale: 0.75, zIndex: 18, curve: -0.7, colorVariant: 'default' as const, stemHeight: 1.2 }, // Izquierda lejos
  { bottom: '32%', left: '58%', scale: 0.65, zIndex: 12, curve: 0.2, colorVariant: 'warm' as const, stemHeight: 0.85 }, // Centro atrás derecha
  { bottom: '30%', left: '42%', scale: 0.68, zIndex: 14, curve: -0.2, colorVariant: 'cool' as const, stemHeight: 1.05 }, // Centro atrás izquierda
  { bottom: '12%', left: '85%', scale: 1, zIndex: 28, curve: 0.8, colorVariant: 'mixed' as const, stemHeight: 0.7 }, // Derecha muy frente
  { bottom: '14%', left: '15%', scale: 1.05, zIndex: 29, curve: -0.8, colorVariant: 'default' as const, stemHeight: 0.75 }, // Izquierda muy frente
];

function getPosition(index: number) {
  // Si hay más flores que posiciones, repetimos el patrón pero las hacemos ligeramente más pequeñas y más atrás
  const pos = FLOWER_POSITIONS[index % FLOWER_POSITIONS.length];
  const layer = Math.floor(index / FLOWER_POSITIONS.length);
  
  if (layer === 0) return pos;

  return {
    ...pos,
    bottom: `${parseFloat(pos.bottom) + (layer * 5)}%`,
    scale: pos.scale * Math.pow(0.8, layer),
    zIndex: pos.zIndex - (layer * 10),
  };
}

export function Garden({ books, onSelectBook }: GardenProps) {
  const [activeFlowerIndex, setActiveFlowerIndex] = useState<number | null>(null);
  const [previousBookCount, setPreviousBookCount] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem('garden_book_count');
    if (stored) {
      setPreviousBookCount(parseInt(stored, 10));
    }
    // Update stored count slightly after mount to allow animations to know if it's new
    const timer = setTimeout(() => {
      localStorage.setItem('garden_book_count', books.length.toString());
      setPreviousBookCount(books.length);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [books.length]);

  const flowerChunks = useMemo(() => chunkBooks(books), [books]);
  
  // Determinamos cuántas flores había antes
  const prevChunks = chunkBooks(books.slice(0, previousBookCount));
  const previousFlowerCount = prevChunks.length;

  return (
    <div className="relative w-full max-w-[900px] h-[500px] sm:h-[600px] mx-auto overflow-visible rounded-3xl mt-4 mb-12">
      
      {/* Cielos / Entorno */}
      <div className="absolute inset-0 pointer-events-none opacity-50 z-0">
         {/* Mariposas flotantes del jardín */}
         <motion.div 
            className="absolute left-[20%] top-[30%]"
            animate={{ 
              x: [0, 50, -20, 0], 
              y: [0, -30, 20, 0], 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M10,10 C15,0 20,5 15,15 C10,12 10,10 10,10 Z" fill="#ECA586" opacity="0.6"/>
              <path d="M10,10 C5,0 0,5 5,15 C10,12 10,10 10,10 Z" fill="#ECA586" opacity="0.4"/>
            </svg>
          </motion.div>
      </div>

      {/* Colinas / Suelo */}
      <div className="absolute bottom-0 left-0 w-full h-[40%] pointer-events-none z-10 flex items-end">
        <svg viewBox="0 0 1000 200" className="w-full h-full preserve-3d" preserveAspectRatio="none">
          <path d="M0,200 L0,120 Q250,180 500,100 T1000,140 L1000,200 Z" fill="rgba(196, 172, 148, 0.15)" />
          <path d="M0,200 L0,150 Q200,80 450,130 T1000,90 L1000,200 Z" fill="rgba(196, 172, 148, 0.1)" />
          <path d="M-100,200 L-100,180 Q300,120 600,160 T1100,150 L1100,200 Z" fill="rgba(196, 172, 148, 0.2)" />
        </svg>
      </div>

      {/* Flores */}
      {flowerChunks.map((chunk, index) => {
        const isNewFlower = isClient && index >= previousFlowerCount && previousFlowerCount > 0;
        const pos = getPosition(index);
        const isActive = activeFlowerIndex === index;

        // Estadísticas de la flor
        const firstBook = chunk[0];
        const lastBook = chunk[chunk.length - 1];
        const reviewsCount = chunk.filter(b => b.review && b.review.length > 0).length;

        return (
          <div 
            key={`flower-${index}`}
            className="absolute w-[300px] h-[450px] transform -translate-x-1/2 flex flex-col items-center justify-end"
            style={{ 
              bottom: pos.bottom, 
              left: pos.left, 
              zIndex: isActive ? 50 : pos.zIndex 
            }}
          >
            <OrganicFlower 
              books={chunk} 
              onSelectBook={onSelectBook}
              isNew={isNewFlower}
              colorVariant={pos.colorVariant}
              stemCurve={pos.curve}
              stemHeight={pos.stemHeight}
              scale={pos.scale}
            />

            {/* Base interactiva de la flor para ver el Tooltip de la flor */}
            <div 
              className="absolute bottom-4 w-16 h-16 rounded-full cursor-pointer z-50 flex items-center justify-center group"
              onClick={() => setActiveFlowerIndex(isActive ? null : index)}
            >
              <div className="w-3 h-3 rounded-full bg-[#7B9E89]/20 group-hover:bg-[#ECA586]/40 transition-colors animate-pulse" />
            </div>

            {/* Modal/Tooltip de la Flor (Nivel Jardín) */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="absolute bottom-20 bg-card/95 backdrop-blur-md border border-[#ECA586]/30 p-4 rounded-2xl shadow-xl w-[260px] z-50"
                >
                  <button 
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1"
                    onClick={(e) => { e.stopPropagation(); setActiveFlowerIndex(null); }}
                  >
                    ×
                  </button>
                  <div className="flex items-center gap-2 mb-3 border-b border-border/50 pb-2">
                    <Flower2 className="text-[#ECA586]" size={18} />
                    <h4 className="font-serif font-bold text-base text-primary">Flor {index + 1}</h4>
                  </div>
                  
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex justify-between items-center bg-background/50 p-1.5 rounded-md">
                      <span>Pétalos:</span>
                      <span className="font-medium text-foreground">{chunk.length} libros</span>
                    </div>
                    <div className="flex justify-between items-center bg-background/50 p-1.5 rounded-md">
                      <span>Recuerdos:</span>
                      <span className="font-medium text-foreground flex items-center gap-1"><BookIcon size={12}/> {reviewsCount}</span>
                    </div>
                    
                    <div className="mt-2 text-xs border-l-2 border-[#ECA586]/30 pl-2">
                      <p className="text-foreground/80 mb-1">
                        <span className="italic">Brote:</span> {new Date(firstBook.read_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                      </p>
                      {chunk.length > 1 && (
                        <p className="text-foreground/80">
                          <span className="italic">Último:</span> {new Date(lastBook.read_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
