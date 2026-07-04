'use client';
import { motion } from 'framer-motion';

interface FlowerCenterProps {
  totalBooks: number;
}

export function FlowerCenter({ totalBooks }: FlowerCenterProps) {
  let r = 3;
  let color = "#D8B36A";

  if (totalBooks >= 1 && totalBooks <= 4) {
    r = 6;
  } else if (totalBooks >= 5 && totalBooks <= 15) {
    r = 9;
  } else if (totalBooks >= 16 && totalBooks <= 30) {
    r = 11;
  } else if (totalBooks > 30) {
    r = 12;
  }
  
  return (
    <motion.circle
      cx="200"
      cy="200"
      r={r}
      fill={color}
      initial={{ scale: 0 }}
      animate={{ scale: 1, r }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))" }}
    />
  );
}
