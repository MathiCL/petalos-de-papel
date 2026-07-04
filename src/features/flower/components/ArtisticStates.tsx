'use client';
import { motion } from 'framer-motion';
import { Book } from '@/services/books';

// Paleta inspirada en acuarelas (translúcidos para simular superposición de pigmento)
const COLORS = [
  'rgba(231, 166, 184, 0.85)', // Rosa base
  'rgba(214, 138, 159, 0.75)', // Rosa empolvado más oscuro
  'rgba(242, 196, 209, 0.90)', // Rosa claro/luminoso
  'rgba(224, 152, 158, 0.70)', // Tono salmón/melocotón suave
];

const getColor = (index: number) => COLORS[index % COLORS.length];

export function SeedState() {
  return (
    <g>
      <motion.ellipse 
        cx="200" cy="210" rx="15" ry="3" 
        fill="rgba(123, 158, 137, 0.15)" 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
      />
      <motion.circle
        cx="200" cy="205" r="4.5"
        fill="#D8B36A"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.9 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </g>
  );
}

export function ClosedBudState({ books }: { books: Book[] }) {
  // books[0] representa el capullo cerrado
  return (
    <g>
      {/* Tallo muy fino y curvado con gracia */}
      <motion.path 
        d="M200,200 Q196,240 205,280" 
        stroke="#7B9E89" strokeWidth="2.5" fill="none" 
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}
      />
      <motion.g 
        whileHover={{ filter: "brightness(1.1)" }} 
        style={{ cursor: 'pointer' }}
      >
        {/* Hojas protectoras (sépalos) */}
        <motion.path d="M200,200 C188,185 192,165 200,155" stroke="#7B9E89" strokeWidth="2" fill="none" />
        <motion.path d="M200,200 C212,185 208,165 200,155" stroke="#7B9E89" strokeWidth="2" fill="none" />
        {/* Pétalo rosado asomando tímidamente */}
        <motion.path 
          d="M196,165 C200,150 200,150 204,165 Z" 
          fill={getColor(0)} 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
        />
        <motion.circle cx="200" cy="200" r="3" fill="#D8B36A" />
      </motion.g>
    </g>
  );
}

export function OpeningBudState({ books }: { books: Book[] }) {
  // 2 libros: El capullo se abre, revelando 2 pétalos superpuestos
  return (
    <g>
      <motion.path d="M200,200 Q192,250 200,290" stroke="#7B9E89" strokeWidth="3" fill="none" />
      {/* Hojita sutil */}
      <motion.path d="M196,250 C180,240 175,220 185,240" fill="rgba(123, 158, 137, 0.6)" />
      
      {books[0] && (
        <motion.path 
          d="M200,200 C180,170 185,140 200,135 C205,150 200,180 200,200" 
          fill={getColor(0)} whileHover={{ filter: "brightness(1.1)" }} style={{ cursor: 'pointer' }}
        />
      )}
      {books[1] && (
        <motion.path 
          d="M200,200 C215,170 215,140 205,135 C200,150 205,180 200,200" 
          fill={getColor(1)} whileHover={{ filter: "brightness(1.1)" }} style={{ cursor: 'pointer' }}
        />
      )}
      {/* Sépalos relajados */}
      <motion.path d="M195,195 Q200,208 205,195 Q200,200 195,195" fill="#7B9E89" />
      <motion.circle cx="200" cy="200" r="4" fill="#D8B36A" />
    </g>
  );
}

export function FirstPetalState({ books }: { books: Book[] }) {
  // 3-4 libros
  const slots = [
    "M200,200 C160,160 140,100 190,90 C220,110 200,160 200,200", // Pétalo principal grande
    "M200,200 C240,170 250,110 220,95 C190,110 210,160 200,200", // Segundo pétalo asimétrico
    "M200,200 C170,200 130,220 150,180 C170,170 185,185 200,200", // Pétalo inferior izquierdo
    "M200,200 C225,200 270,220 250,180 C230,170 215,185 200,200", // Pétalo inferior derecho
  ];

  return (
    <g>
      <motion.path d="M200,200 Q188,260 195,310" stroke="#7B9E89" strokeWidth="3.5" fill="none" />
      <motion.path d="M194,240 C160,220 150,180 170,230" fill="rgba(123, 158, 137, 0.7)" />
      
      {books.map((book, i) => {
        if (i >= slots.length) return null;
        return (
          <motion.path 
            key={book.id} 
            d={slots[i]} 
            fill={getColor(i)}
            whileHover={{ filter: "brightness(1.1) drop-shadow(0px 2px 4px rgba(0,0,0,0.15))" }}
            style={{ cursor: 'pointer' }}
            initial={{ scale: 0, originX: '200px', originY: '200px' }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
          />
        );
      })}
      
      {/* Centro texturizado */}
      <motion.circle cx="200" cy="200" r="6" fill="#D8B36A" />
      <motion.circle cx="197" cy="198" r="1.5" fill="rgba(255,255,255,0.4)" />
    </g>
  );
}

export function SmallFlowerState({ books }: { books: Book[] }) {
  // 5-9 libros: Diseño botánico suelto, similar a una anémona o rosa silvestre joven
  const slots = [
    "M200,200 C160,170 120,90 190,70 C230,90 200,160 200,200", // Superior principal
    "M200,200 C240,170 280,90 210,70 C170,90 200,160 200,200", // Superior derecho
    "M200,200 C150,210 70,180 100,240 C140,260 170,220 200,200", // Inferior izquierdo
    "M200,200 C250,210 330,180 300,240 C260,260 230,220 200,200", // Inferior derecho
    "M200,200 C180,240 140,320 200,320 C260,320 220,240 200,200", // Inferior central
    // Superposiciones translúcidas (agregan cuerpo al centro)
    "M200,200 C180,150 160,100 200,90 C220,100 210,150 200,200", // Capa interna arriba
    "M200,200 C170,180 120,160 140,190 C160,200 180,190 200,200", // Capa interna izq
    "M200,200 C230,180 280,160 260,190 C240,200 220,190 200,200", // Capa interna der
    "M200,200 C190,210 170,260 200,260 C230,260 210,210 200,200", // Capa interna abajo
  ];

  return (
    <g>
      <motion.path d="M200,200 Q190,270 205,340" stroke="#7B9E89" strokeWidth="4.5" fill="none" />
      <motion.path d="M196,270 C150,250 130,190 170,240" fill="rgba(123, 158, 137, 0.7)" />
      <motion.path d="M203,280 C250,260 270,200 230,250" fill="rgba(123, 158, 137, 0.7)" />
      
      {books.map((book, i) => {
        if (i >= slots.length) return null;
        return (
          <motion.path 
            key={book.id} 
            d={slots[i]} 
            fill={getColor(i)}
            whileHover={{ filter: "brightness(1.1) drop-shadow(0px 3px 6px rgba(0,0,0,0.2))" }}
            style={{ cursor: 'pointer' }}
            initial={{ scale: 0, opacity: 0, originX: '200px', originY: '200px' }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.05 }}
          />
        );
      })}
      
      {/* Centro maduro */}
      <motion.circle cx="200" cy="200" r="8" fill="#D8B36A" />
      <motion.circle cx="196" cy="197" r="2" fill="rgba(255,255,255,0.4)" />
      <motion.circle cx="204" cy="203" r="1.5" fill="rgba(255,255,255,0.3)" />
      <motion.circle cx="203" cy="196" r="1" fill="rgba(255,255,255,0.5)" />
    </g>
  );
}

export function OpenFlowerState({ books }: { books: Book[] }) {
  // 10+ libros: Para este hito usaremos el diseño base de SmallFlower pero con más pétalos generados 
  // O podemos seguir expandiendo el array de slots artesanales.
  // Por ahora, renderizamos el SmallFlowerState para todos los >9 libros como fallback visual.
  return <SmallFlowerState books={books} />;
}
