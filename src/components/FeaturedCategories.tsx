import React from 'react';
import { ArrowRight, ArrowLeft, Droplets, Sparkles, Wind, Flame } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ProductCategory } from '../types';

interface FeaturedCategoriesProps {
  onSelectCategory: (category: ProductCategory) => void;
}

export const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ onSelectCategory }) => {
  const { language, isRTL, t } = useLanguage();

  const categories: {
    id: ProductCategory;
    name: string;
    description: { ckb: string; ar: string; en: string };
    count: number;
    bgClass: string;
    borderClass: string;
    icon: React.ElementType;
    tag: string;
  }[] = [
    {
      id: 'skincare',
      name: t('catSkincare'),
      description: {
        ckb: 'سێرۆم، کرێمی پێپتاید، دژەخۆری کانزایی',
        ar: 'سيرومات، كريمات الببتيد، واقيات شمس معدنية',
        en: 'Active serums, barrier creams, mineral veils',
      },
      count: 24,
      bgClass: 'from-[#FAF4EE] to-[#EFE4D8]',
      borderClass: 'border-[#EADBCC]',
      icon: Droplets,
      tag: 'Restorative',
    },
    {
      id: 'makeup',
      name: t('catMakeup'),
      description: {
        ckb: 'سووراوی مەخمەڵی، فۆندەیشنی ئاوریشمی، هایلایتەر',
        ar: 'أحمر شفاه كوتور، أساس كوشن، إشراقة مخملية',
        en: 'Couture satin lipsticks, silk cushions, radiance',
      },
      count: 18,
      bgClass: 'from-[#FDF2F2] to-[#F3DCDD]',
      borderClass: 'border-[#E8C5C8]',
      icon: Sparkles,
      tag: 'Couture',
    },
    {
      id: 'haircare',
      name: t('catHaircare'),
      description: {
        ckb: 'ڕۆنی ئارگان، کیراتینی سروشتی، ماسکی خاویار',
        ar: 'زيوت الأرغان، كيراتين نقي، علاج الأطراف',
        en: 'Moroccan argan nectars, biomimetic keratin',
      },
      count: 12,
      bgClass: 'from-[#FAF7EE] to-[#EFE6CF]',
      borderClass: 'border-[#E7D9B8]',
      icon: Wind,
      tag: 'Botanical',
    },
    {
      id: 'fragrance',
      name: t('catFragrance'),
      description: {
        ckb: 'عوودی کەمپۆدی، زەعفەرانی تائیف، میستی یاسەمین',
        ar: 'عطور العود المعتق، مستخلص الزعفران الملكي',
        en: 'Prestige Cambodian agarwood, rare florals',
      },
      count: 15,
      bgClass: 'from-[#F6F2EC] to-[#E8DDD1]',
      borderClass: 'border-[#DCDEC6]',
      icon: Flame,
      tag: 'Artisanal',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#EAE3D9] gap-4 text-start">
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8C532B] block mb-2">
              Curated Taxonomy
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-medium text-[#1A1816]">
              {t('categories')}
            </h2>
          </div>
          <p className="text-sm text-[#706456] max-w-md">
            {t('categorySubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group relative text-start p-6 rounded-sm bg-gradient-to-br ${cat.bgClass} border ${cat.borderClass} hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[220px] cursor-pointer`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-11 h-11 rounded-sm bg-white/80 backdrop-blur-xs flex items-center justify-center text-[#1A1816] shadow-xs group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-[#8C532B]" />
                    </div>
                    <span className="text-[11px] font-mono text-[#7D6E60] bg-white/60 px-2 py-0.5 rounded-sm">
                      {cat.count} {t('itemsCount')}
                    </span>
                  </div>

                  <span className="text-[10px] tracking-widest uppercase text-[#8C532B] font-semibold block mb-1">
                    {cat.tag}
                  </span>

                  <h3 className="text-xl font-display font-medium text-[#1A1816] mb-2 group-hover:text-[#8C532B] transition-colors">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-[#6B5E52] leading-relaxed line-clamp-2">
                    {cat.description[language] || cat.description.en}
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-2 text-xs font-medium text-[#1A1816] group-hover:text-[#8C532B] transition-colors">
                  <span>{t('viewDetails')}</span>
                  {isRTL ? (
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
