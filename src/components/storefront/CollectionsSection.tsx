import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Collection, Product } from '../../types';

interface CollectionsSectionProps {
  collections: Collection[];
  selectedCategory: string;
  onSelectCategory: (name: string) => void;
  products?: Product[];
}

export const CollectionsSection: React.FC<CollectionsSectionProps> = ({
  collections,
  selectedCategory,
  onSelectCategory,
  products,
}) => {
  const activeCollections = collections.filter(
    (col) => col.visible !== false && !col.isDeleted
  );

  if (activeCollections.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7A582F]"></span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F]">
              Spring/Summer Capsule 2025
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#42240D] tracking-tight">
            Curated Pret &amp; Haute Collections
          </h2>
          <p className="text-xs text-[#50443D] max-w-xl mt-1">
            Explore bespoke ensembles organized into signature silhouettes, hand-dyed organza jacquards, and heirloom cutwork.
          </p>
        </div>

        <button
          onClick={() => onSelectCategory('all')}
          className="text-xs uppercase font-bold tracking-wider text-[#7A582F] hover:text-[#42240D] flex items-center gap-1 self-start md:self-auto transition-colors"
        >
          <span>View All Silhouettes</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeCollections.map((col) => {
          const isSelected = selectedCategory === col.name;
          return (
            <div
              key={col.id}
              onClick={() => onSelectCategory(col.name)}
              className={`group cursor-pointer rounded-2xl p-3.5 bg-white border transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? 'border-2 border-[#5C3A21] shadow-lg ring-2 ring-[#C49A6C]/30'
                  : 'border-[#D4C3B9]/50 shadow-sm hover:shadow-md hover:border-[#C49A6C]'
              }`}
            >
              <div>
                {/* Image */}
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#FAF7F2] mb-3">
                  <img
                    src={col.coverImage}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[9px] uppercase tracking-widest text-[#42240D] font-bold shadow-sm">
                      {col.slot}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-[#FFDCC6] text-[#2F1502] text-[9px] uppercase font-bold tracking-wider">
                      {products ? products.filter((p) => p.category === col.name).length : col.outfitCount} Outfits
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F] block">
                    {col.category}
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#42240D] group-hover:text-[#5C3A21] transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-xs text-[#50443D] line-clamp-2 leading-relaxed">
                    {col.tagline}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F0EDE9] flex items-center justify-between text-xs font-semibold text-[#5C3A21]">
                <span>{isSelected ? 'Currently Viewing' : 'Explore Capsule'}</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
