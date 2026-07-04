'use client';
import { Book } from '@/services/books';
import { 
  SeedState, 
  ClosedBudState, 
  OpeningBudState, 
  FirstPetalState, 
  SmallFlowerState,
  OpenFlowerState
} from './ArtisticStates';

interface InteractiveFlowerProps {
  books: Book[];
}

export function InteractiveFlower({ books }: InteractiveFlowerProps) {
  const totalBooks = books.length;
  
  // Renderizamos el estado visual puramente artesanal basado en la cantidad de libros
  const renderState = () => {
    if (totalBooks === 0) return <SeedState />;
    if (totalBooks === 1) return <ClosedBudState books={books} />;
    if (totalBooks === 2) return <OpeningBudState books={books} />;
    if (totalBooks >= 3 && totalBooks <= 4) return <FirstPetalState books={books} />;
    if (totalBooks >= 5 && totalBooks <= 9) return <SmallFlowerState books={books} />;
    
    // Para >= 10 usamos el estado de flor abierta (que por ahora usa la base de SmallFlower)
    return <OpenFlowerState books={books} />;
  };
  
  return (
    <div className="relative w-full max-w-[320px] sm:max-w-[400px] aspect-square mx-auto flex items-center justify-center -my-4">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full overflow-visible"
        style={{ filter: 'drop-shadow(0px 8px 12px rgba(0,0,0,0.04))' }}
      >
        {renderState()}
      </svg>
    </div>
  );
}
