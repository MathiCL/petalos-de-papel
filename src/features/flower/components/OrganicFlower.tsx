'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book } from '@/services/books';

// Paletas de color por género literario (Biodiversidad)
const PALETTES: Record<string, string[]> = {
  default: ['#E67A73', '#ECA586', '#EEDCA1', '#F4E2CD', '#D75F66', '#E8928A'], // Cálidos (Coral/Rosa/Crema)
  fiction: ['#E67A73', '#ECA586', '#EEDCA1', '#F4E2CD', '#D75F66', '#E8928A'], // Cálidos
  science: ['#7B9E89', '#5A7D66', '#A3C4B3', '#C7D9D0', '#4A6955', '#EEDCA1'], // Fríos / Naturaleza (Verdes)
  history: ['#C4AC94', '#D4C1A8', '#EEDCA1', '#B39578', '#ECA586', '#8F7359'], // Sepia / Tierra (Marrones)
  fantasy: ['#B28DFF', '#C5A3FF', '#F4E2CD', '#9A66FF', '#D75F66', '#854DFF'], // Místicos (Morados/Lilas)
  mystery: ['#4A6955', '#2C3E32', '#7B9E89', '#5A7D66', '#1A251E', '#C4AC94'], // Oscuros (Verde Bosque/Marrón)
};

// Hash determinista simple basado en string (book.id)
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getFloralGroup(book: Book, index: number, totalBooks: number) {
  // Generamos variaciones deterministas únicas para cada libro
  const seed = hashString(book.id || String(index));
  
  const angleWobble = (seed % 20) - 10; // -10 a +10 grados de variación
  const scaleVariation = 0.85 + ((seed % 30) / 100); // 0.85 a 1.14
  
  // Filotaxis para distribución orgánica
  const baseAngleDegrees = index * 137.508;
  const finalAngleDegrees = baseAngleDegrees + angleWobble;
  const angleRadians = finalAngleDegrees * (Math.PI / 180);
  
  // spreadFactor dinámico: el ramo se expande sutilmente cuantos más libros hay
  const spreadFactor = 8 + Math.min(totalBooks * 0.15, 8);
  const radius = spreadFactor * Math.sqrt(index);
  
  // Determinar paleta basada en categorías
  let palette = PALETTES.default;
  if (book.categories && book.categories.length > 0) {
    const catsStr = book.categories.join(' ').toLowerCase();
    if (catsStr.includes('science') || catsStr.includes('ciencia') || catsStr.includes('technology')) palette = PALETTES.science;
    else if (catsStr.includes('history') || catsStr.includes('historia') || catsStr.includes('biography')) palette = PALETTES.history;
    else if (catsStr.includes('fantasy') || catsStr.includes('fantasía') || catsStr.includes('magic')) palette = PALETTES.fantasy;
    else if (catsStr.includes('mystery') || catsStr.includes('thriller') || catsStr.includes('misterio')) palette = PALETTES.mystery;
    else if (catsStr.includes('fiction') || catsStr.includes('ficción') || catsStr.includes('novel')) palette = PALETTES.fiction;
  }
  
  const colorIndex = seed % palette.length;
  const fill = palette[colorIndex];
  
  const size = 30 * scaleVariation;
  const width = size * 0.7;
  
  const x = 300 + radius * Math.cos(angleRadians);
  const y = 300 + radius * Math.sin(angleRadians);

  // Pétalo/capa principal
  const petalMainLeft = `M 0,0 C -${width},-${size*0.4} -${width*0.4},-${size*0.9} 0,-${size} Z`;
  const petalMainRight = `M 0,0 C ${width},-${size*0.4} ${width*0.4},-${size*0.9} 0,-${size} Z`;
  
  // Sub-pétalo (capa superior para dar volumen)
  const subSize = size * 0.65;
  const subWidth = subSize * 0.7;
  const petalSubLeft = `M 0,0 C -${subWidth},-${subSize*0.4} -${subWidth*0.4},-${subSize*0.9} 0,-${subSize} Z`;
  const petalSubRight = `M 0,0 C ${subWidth},-${subSize*0.4} ${subWidth*0.4},-${subSize*0.9} 0,-${subSize} Z`;

  return { 
    angleDegrees: finalAngleDegrees, 
    x, y, fill, size, 
    petalMainLeft, petalMainRight, 
    petalSubLeft, petalSubRight 
  };
}

export interface OrganicFlowerProps {
  books: Book[];
  onSelectBook?: (book: Book) => void;
  isNew?: boolean;
  colorVariant?: 'default' | 'warm' | 'cool' | 'mixed';
  stemCurve?: number;
  stemHeight?: number;
  scale?: number;
}

export function OrganicFlower({ books, onSelectBook, isNew = false, colorVariant = 'default', stemCurve = 0, stemHeight = 1, scale = 1 }: OrganicFlowerProps) {
  const [hoveredBook, setHoveredBook] = useState<Book | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const totalBooks = books.length;
  
  // En fase inicial (pocos libros), el arreglo está más pegado al suelo
  const centerOffsetY = totalBooks === 0 ? 150 : totalBooks <= 3 ? 80 : 0;
  const currentCenterY = 300 + centerOffsetY;

  // Invertimos para el z-index (los más viejos [índice 0] quedan arriba en el SVG)
  const floralGroups = books.map((book, index) => {
    return { book, index, ...getFloralGroup(book, index, totalBooks) };
  }).reverse();

  const handleMouseMove = (e: React.MouseEvent, book: Book) => {
    setHoveredBook(book);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredBook(null);
  };

  return (
    <>
      <div 
        className="relative w-full h-full flex items-center justify-center pointer-events-none"
        style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}
      >
        <svg
          viewBox="150 150 300 450"
          className="w-full h-full overflow-visible pointer-events-auto"
          style={{ filter: 'drop-shadow(0px 15px 25px rgba(0,0,0,0.06))' }}
        >
          <defs>
            {/* Patrón de texto simulando páginas de libros antiguos */}
            <pattern id="book-text" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(-15) scale(0.6)">
              <text x="5" y="20" fontSize="12" fontFamily="Playfair Display, serif" fill="rgba(0,0,0,0.08)" fontStyle="italic">et in Arcadia ego</text>
              <text x="25" y="45" fontSize="10" fontFamily="Playfair Display, serif" fill="rgba(0,0,0,0.07)">habent sua fata libelli</text>
              <text x="10" y="70" fontSize="13" fontFamily="Playfair Display, serif" fill="rgba(0,0,0,0.09)" fontStyle="italic">memoria viva</text>
              <text x="35" y="95" fontSize="11" fontFamily="Playfair Display, serif" fill="rgba(0,0,0,0.07)">litera scripta manet</text>
              <text x="0" y="120" fontSize="10" fontFamily="Playfair Display, serif" fill="rgba(0,0,0,0.08)">flor et folium</text>
            </pattern>
            
            <linearGradient id="stem-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5A7D66" />
              <stop offset="50%" stopColor="#7B9E89" />
              <stop offset="100%" stopColor="#4A6955" />
            </linearGradient>
          </defs>

          {/* Agrupamos toda la planta para animaciones globales */}
          <motion.g id="plant-system" initial={isNew ? { y: currentCenterY - 300 + 50, opacity: 0 } : { y: currentCenterY - 300, opacity: 1 }} animate={{ y: currentCenterY - 300, opacity: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }}>
            
            {/* Elementos Decorativos de Fondo omitidos porque ahora están en Garden */}

            <g id="background-decorations" opacity="0.6">
              {/* Ramas muy tenues y elegantes a los lados */}
              <motion.path d="M120,450 Q100,300 150,150" stroke="#7B9E89" strokeWidth="1" fill="none" opacity="0.2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5 }} />
              <motion.path d="M480,420 Q520,280 430,120" stroke="#7B9E89" strokeWidth="1" fill="none" opacity="0.2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.8 }} />
              
              {/* Mariposa Izquierda */}
              <motion.g 
                initial={{ x: 80, y: 250, opacity: 0 }}
                animate={{ 
                  x: [80, 100, 70, 80], 
                  y: [250, 220, 240, 250], 
                  opacity: [0, 0.7, 0.4, 0.7],
                  rotate: [-5, 10, -5]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                <path d="M0,0 C10,-10 20,-5 12,8 C5,12 0,8 0,0 Z" fill="#ECA586" opacity="0.7"/>
                <path d="M0,0 C-10,-10 -20,-5 -12,8 C-5,12 0,8 0,0 Z" fill="#ECA586" opacity="0.4"/>
                <circle cx="0" cy="0" r="1.5" fill="#4A6955" opacity="0.5"/>
              </motion.g>

              {/* Mariposa Derecha Arriba */}
              <motion.g 
                initial={{ x: 480, y: 150, opacity: 0 }}
                animate={{ 
                  x: [480, 460, 490, 480], 
                  y: [150, 130, 160, 150], 
                  opacity: [0, 0.6, 0.3, 0.6],
                  rotate: [5, -10, 5]
                }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                <path d="M0,0 C12,-12 25,-6 15,10 C6,15 0,10 0,0 Z" fill="#D75F66" opacity="0.6"/>
                <path d="M0,0 C-12,-12 -25,-6 -15,10 C-6,15 0,10 0,0 Z" fill="#D75F66" opacity="0.3"/>
                <circle cx="0" cy="0" r="2" fill="#4A6955" opacity="0.4"/>
              </motion.g>

              {/* Pétalos flotantes (polen) */}
              {[1,2,3,4,5,6].map(i => (
                <motion.circle 
                  key={`spore-${i}`}
                  cx={80 + i * 80} 
                  cy={120 + (i % 3) * 120} 
                  r={1 + (i % 2)} 
                  fill={PALETTES.default[i % PALETTES.default.length]}
                  animate={{ 
                    y: [0, -20, 0], 
                    x: [0, i % 2 === 0 ? 15 : -15, 0],
                    opacity: [0.2, 0.6, 0.2]
                  }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
              
              {/* Hojas translúcidas caídas de fondo */}
              <motion.path d="M130,350 C110,300 150,250 180,270 C160,310 150,330 130,350 Z" fill="#ECA586" opacity="0.1" animate={{ rotate: [-1, 1, -1] }} transition={{ duration: 6, repeat: Infinity }} style={{ originX: '130px', originY: '350px' }} />
              <motion.path d="M470,380 C490,330 450,280 420,300 C440,340 450,360 470,380 Z" fill="#D75F66" opacity="0.08" animate={{ rotate: [1, -1, 1] }} transition={{ duration: 7, repeat: Infinity }} style={{ originX: '470px', originY: '380px' }} />
            </g>

            {/* Suelo y raíces orgánicas */}
            <g id="ground">
              <motion.ellipse 
                cx="300" cy="520" rx="80" ry="12" 
                fill="rgba(196, 172, 148, 0.15)" 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
              />
              <motion.path 
                d="M280,520 Q290,535 270,545 M310,520 Q320,540 330,535" 
                stroke="rgba(196, 172, 148, 0.3)" strokeWidth="2" fill="none" 
                initial={{ opacity: 0 }} animate={{ opacity: totalBooks > 0 ? 1 : 0 }}
              />
            </g>

            {/* Tallo Robusto y con curva orgánica sutil */}
            <g id="stem">
              <motion.path 
                d={`M300,300 C${295 - stemCurve * 40},380 ${310 + stemCurve * 20},450 298,520`}
                stroke="url(#stem-grad)" 
                strokeWidth={totalBooks <= 3 ? 5 : totalBooks <= 15 ? 8 : 12} 
                strokeLinecap="round" 
                fill="none"
                initial={isNew ? { pathLength: 0, opacity: 0 } : { pathLength: totalBooks > 0 ? 1 : 0, opacity: totalBooks > 0 ? 1 : 0 }} 
                animate={{ pathLength: totalBooks > 0 ? 1 : 0, opacity: totalBooks > 0 ? 1 : 0 }} 
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
            </g>

            {/* Capullos secundarios a lo largo del tallo (visibles en etapa media) */}
            <g id="buds">
              {totalBooks >= 3 && (
                <motion.g id="bud-left" initial={{ opacity: 0, scale: 0, originX: '270px', originY: '360px' }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, duration: 1 }}>
                  <path d="M296,380 Q250,370 270,360" stroke="#7B9E89" strokeWidth="2" fill="none" />
                  <path d="M270,360 C260,345 265,335 270,335 C275,335 280,345 270,360 Z" fill="#E67A73" />
                  <path d="M270,360 C260,345 265,335 270,335 C275,335 280,345 270,360 Z" fill="url(#book-text)" opacity="0.6" />
                  <path d="M270,362 C255,355 250,340 262,336 C265,345 268,355 270,362 Z" fill="#6B8E77" stroke="#4A6955" strokeWidth="1" />
                  <path d="M270,362 C285,355 290,340 278,336 C275,345 272,355 270,362 Z" fill="#5A7D66" stroke="#4A6955" strokeWidth="1" />
                </motion.g>
              )}
              
              {totalBooks >= 8 && (
                <motion.g id="bud-right" initial={{ opacity: 0, scale: 0, originX: '335px', originY: '400px' }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, duration: 1 }}>
                  <path d="M304,430 Q345,410 335,400" stroke="#7B9E89" strokeWidth="2" fill="none" />
                  <path d="M335,400 C325,385 330,375 335,375 C340,375 345,385 335,400 Z" fill="#D75F66" />
                  <path d="M335,400 C325,385 330,375 335,375 C340,375 345,385 335,400 Z" fill="url(#book-text)" opacity="0.6" />
                  <path d="M335,402 C320,395 315,380 327,376 C330,385 333,395 335,402 Z" fill="#6B8E77" stroke="#4A6955" strokeWidth="1" />
                  <path d="M335,402 C350,395 355,380 343,376 C340,385 337,395 335,402 Z" fill="#5A7D66" stroke="#4A6955" strokeWidth="1" />
                </motion.g>
              )}
            </g>

            {/* Grupo de Flores Anidadas (El Ramo que crece) */}
            <g id="floral-groups">
              {floralGroups.map((group) => {
                const isHovered = hoveredBook?.id === group.book.id;
                
                return (
                  <motion.g
                    key={group.book.id}
                    initial={{ 
                      x: 300, y: 300, 
                      scale: 0, opacity: 0, 
                      rotate: group.angleDegrees 
                    }}
                    animate={isHovered ? {
                      x: group.x, y: group.y - 2, 
                      scale: 1.08, 
                      opacity: 1,
                      rotate: group.angleDegrees + 90 
                    } : { 
                      x: group.x, y: group.y, 
                      scale: 1, 
                      opacity: 1,
                      rotate: group.angleDegrees + 90 
                    }}
                    transition={{ 
                      duration: 0.7, 
                      ease: isHovered ? "easeInOut" : [0.34, 1.56, 0.64, 1], 
                      delay: isHovered ? 0 : Math.min(group.index * 0.04, 2) 
                    }}
                    style={{ 
                      cursor: 'pointer',
                      filter: isHovered ? "drop-shadow(0px 8px 20px rgba(230,122,115,0.4))" : "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"
                    }}
                    onClick={() => onSelectBook && onSelectBook(group.book)}
                    onMouseMove={(e) => handleMouseMove(e, group.book)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Capa inferior (Pétalo Principal) */}
                    <path d={group.petalMainLeft} fill={group.fill} />
                    <path d={group.petalMainLeft} fill="url(#book-text)" opacity="0.7" />
                    
                    <path d={group.petalMainRight} fill={group.fill} />
                    <path d={group.petalMainRight} fill="rgba(0,0,0,0.12)" />
                    <path d={group.petalMainRight} fill="url(#book-text)" opacity="0.7" />

                    {/* Capa superior (Sub-pétalo para volumen del mini-grupo) */}
                    <path d={group.petalSubLeft} fill={group.fill} />
                    <path d={group.petalSubLeft} fill="rgba(255,255,255,0.15)" />
                    
                    <path d={group.petalSubRight} fill={group.fill} />
                    <path d={group.petalSubRight} fill="rgba(0,0,0,0.15)" />

                    {/* Línea de pliegue central del origami */}
                    <path d={`M 0,0 L 0,-${group.size}`} stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" />
                  </motion.g>
                );
              })}
            </g>
          </motion.g>
        </svg>
      </div>

      {/* Tooltip HTML minimalista superpuesto */}
      <AnimatePresence>
        {hoveredBook && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 pointer-events-none bg-card/95 backdrop-blur-md border border-border/50 p-4 rounded-xl shadow-xl w-[260px] transform -translate-x-1/2 -translate-y-[calc(100%+20px)]"
            style={{ left: mousePos.x, top: mousePos.y }}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-start gap-3 border-b border-border/30 pb-2 mb-1">
                {hoveredBook.cover_url ? (
                  <img src={hoveredBook.cover_url} alt="Portada" className="w-12 h-16 object-cover rounded-sm shadow-sm flex-shrink-0" />
                ) : (
                  <div className="w-12 h-16 bg-muted flex-shrink-0 rounded-sm border border-border/50"></div>
                )}
                <div className="flex flex-col">
                  <h4 className="font-serif font-bold text-base text-primary leading-tight line-clamp-2">{hoveredBook.title}</h4>
                  <span className="text-xs text-muted-foreground mt-0.5">{hoveredBook.author}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1 text-accent">
                {'★'.repeat(hoveredBook.rating)}<span className="text-muted/30">{'★'.repeat(5-hoveredBook.rating)}</span>
              </div>
              {hoveredBook.review && (
                <p className="text-xs text-foreground/80 italic mt-2 line-clamp-3">
                  "{hoveredBook.review}"
                </p>
              )}
              <span className="text-[10px] text-muted-foreground mt-2 border-t border-border/30 pt-2 text-right">
                Leído el {new Date(hoveredBook.read_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
