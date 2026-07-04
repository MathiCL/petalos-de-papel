'use client';
import { motion } from 'framer-motion';
import { Book } from '@/services/books';
import { PetalGeometry } from '../utils/geometry';

interface PetalProps {
  book: Book;
  geometry: PetalGeometry;
  index: number;
}

export function Petal({ book, geometry, index }: PetalProps) {
  // Ajustamos el path del pétalo para que sea alargado y su base se adentre hacia el centro.
  // Base en y=55, punta en y=-45. Total 100px.
  // Con los nuevos radios, esto asegurará que el pétalo se superponga orgánicamente con el núcleo.
  
  return (
    <motion.g
      initial={{ 
        x: 200, 
        y: 200, 
        scale: 0, 
        opacity: 0,
        rotate: geometry.rotation
      }}
      animate={{ 
        x: geometry.x, 
        y: geometry.y, 
        scale: 1, 
        opacity: 0.85,
        rotate: geometry.rotation
      }}
      transition={{ 
        duration: 0.8, 
        ease: "easeOut",
        delay: Math.min(index * 0.05, 1.5)
      }}
    >
      <motion.path
        d="M 0, 55 C -25, 15 -35, -25 0, -45 C 35, -25 25, 15 0, 55"
        fill="#E7A6B8"
        stroke="#d68a9f"
        strokeWidth="1"
        whileHover={{
          scale: 1.05,
          opacity: 1,
          filter: "drop-shadow(0px 3px 6px rgba(0,0,0,0.15))"
        }}
        style={{ cursor: 'pointer', transformOrigin: '0px 0px' }}
      />
    </motion.g>
  );
}
