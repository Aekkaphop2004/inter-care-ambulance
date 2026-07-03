import React, { useState, useEffect } from 'react';
import { Work, CompanyConfig, GalleryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Grid, 
  Image as ImageIcon, 
  ArrowLeft, 
  Maximize2,
  Calendar,
  MapPin,
  Tag
} from 'lucide-react';

interface GalleryPageProps {
  works: Work[];
  galleryItems: GalleryItem[];
  config: CompanyConfig;
  onBackToHome: () => void;
  isDarkMode?: boolean;
}

interface GalleryImage {
  url: string;
  title: string;
  category: string;
  description?: string;
  date?: string;
  location?: string;
}

// Default high-quality professional ambulance and healthcare images
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  {
    url: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80",
    title: "รถพยาบาลฉุกเฉินและอุปกรณ์ช่วยชีวิตพร้อมปฏิบัติการ",
    category: "รถพยาบาล",
    description: "รถพยาบาลขั้นสูงมาตรฐานสากล สแตนด์บายพร้อมดูแลคนไข้ตลอด 24 ชั่วโมง",
    date: "2026-06-10",
    location: "กรุงเทพมหานคร"
  },
  {
    url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    title: "ห้องฉุกเฉินเคลื่อนที่ระดับเตียงวิกฤต (ALS Cabin)",
    category: "อุปกรณ์แพทย์",
    description: "ห้องโดยสารรถพยาบาล ALS เพียบพร้อมด้วยเตียงลดแรงกระแทก ถังออกซิเจน และเครื่องกระตุกหัวใจ",
    date: "2026-06-12",
    location: "กรุงเทพมหานคร"
  },
  {
    url: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80",
    title: "การประสานงานของทีมแพทย์และกู้ชีพวิชาชีพ",
    category: "ทีมงาน",
    description: "แพทย์เวชศาสตร์ฉุกเฉินและพยาบาลส่งต่อข้อมูลและตรวจสัญญาณชีพอย่างรอบคอบ",
    date: "2026-06-15",
    location: "ศูนย์บัญชาการระบบวิทยุ"
  },
  {
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    title: "ทีมงานสแตนด์บายเฝ้าระวังเหตุในเทศกาลดนตรี",
    category: "การทำภารกิจ",
    description: "เตรียมพร้อมเผชิญเหตุ ณ จุดปฐมพยาบาลหลักเพื่อความปลอดภัยสูงสุดของทุกคนในงาน",
    date: "2026-05-15",
    location: "สนามราชมังคลากีฬาสถาน"
  },
  {
    url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80",
    title: "อุปกรณ์ตรวจวัดสัญญาณชีพและประเมินอาการเบื้องต้น",
    category: "อุปกรณ์แพทย์",
    description: "ความแม่นยำของอุปกรณ์ช่วยส่งผ่านข้อมูลผู้ป่วยแบบ Real-time ไปยังโรงพยาบาลปลายทาง",
    date: "2026-05-20",
    location: "รถพยาบาลเคลื่อนที่"
  },
  {
    url: "https://images.unsplash.com/photo-1513224502586-d1e602410265?auto=format&fit=crop&w=1200&q=80",
    title: "รถกู้ชีพและการฝึกซ้อมการเคลื่อนย้ายทางดิ่ง",
    category: "การทำภารกิจ",
    description: "เพิ่มทักษะและทบทวนมาตรฐานการช่วยเหลือผู้ประสบภัยในพื้นที่ลาดชันและอพยพสูง",
    date: "2026-04-10",
    location: "ศูนย์ฝึกอบรมการกู้ชีพ"
  }
];

export default function GalleryPage({ works, galleryItems, config, onBackToHome, isDarkMode = false }: GalleryPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);

  // Consolidate static defaults, gallery items, and dynamic database works pictures
  useEffect(() => {
    const list: GalleryImage[] = galleryItems.map(item => ({
      url: item.url,
      title: item.title,
      category: item.category,
      description: item.description,
      date: item.date,
      location: item.location
    }));

    // If there are no custom gallery items, use the gorgeous defaults
    const mainGalleryList = list.length > 0 ? list : DEFAULT_GALLERY_IMAGES;

    const workImages: GalleryImage[] = [];
    works.forEach(w => {
      if (w.imageUrl && !mainGalleryList.some(gi => gi.url === w.imageUrl)) {
        workImages.push({
          url: w.imageUrl,
          title: w.title,
          category: w.category || "ผลงาน/กิจกรรม",
          description: w.description,
          date: w.date,
          location: w.location
        });
      }
      if (w.imageUrls && Array.isArray(w.imageUrls)) {
        w.imageUrls.forEach((url, subIdx) => {
          if (url && url !== w.imageUrl && !mainGalleryList.some(gi => gi.url === url)) {
            workImages.push({
              url: url,
              title: `${w.title} (${subIdx + 1})`,
              category: w.category || "ผลงาน/กิจกรรม",
              description: w.description,
              date: w.date,
              location: w.location
            });
          }
        });
      }
    });

    setImages([...mainGalleryList, ...workImages]);
  }, [galleryItems, works]);

  // Extract all categories
  const categories = ['ทั้งหมด', ...Array.from(new Set(images.map(img => img.category)))];

  const filteredImages = selectedCategory === 'ทั้งหมด'
    ? images
    : images.filter(img => img.category === selectedCategory);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex(prev => (prev === null || prev === 0) ? filteredImages.length - 1 : prev - 1);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex(prev => (prev === null || prev === filteredImages.length - 1) ? 0 : prev + 1);
  };

  // Keyboard navigation support for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setLightboxIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredImages]);

  return (
    <div className={`py-12 min-h-[calc(100vh-80px)] transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb & Back button */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBackToHome}
            className={`flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer px-4 py-2 rounded-xl shadow-sm border ${isDarkMode ? 'bg-slate-900 text-slate-300 hover:text-white border-slate-800' : 'bg-white text-slate-600 hover:text-blue-600 border-slate-100'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้าหลัก</span>
          </button>
          
          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            HOME &bull; PHOTO GALLERY
          </div>
        </div>

        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border ${isDarkMode ? 'bg-blue-950/25 border-blue-900/40 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
            <ImageIcon className="w-3.5 h-3.5" />
            <span>MEDIC PHOTO GALLERY • คลังภาพปฏิบัติการ</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-black tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            คลังภาพและภาพรวมการทำงานของเรา
          </h2>
          <div className="h-1 w-16 bg-blue-600 mx-auto rounded-full" />
          <p className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            รวบรวมภาพบรรยากาศการสแตนด์บาย คลาสฝึกอบรมปฏิบัติการกู้ชีพ ยานพาหนะรถพยาบาลฉุกเฉินระดับสูง (ALS) 
            รวมถึงอุปกรณ์อำนวยความสะดวกครบครัน เพื่อยืนยันคุณภาพและการปฏิบัติงานจริงของเรา
          </p>
        </div>

        {/* Filter Categories Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? (isDarkMode ? 'bg-rose-600 border-rose-600 text-white shadow-lg' : 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20')
                  : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white' : 'bg-white border-slate-200/80 text-slate-600 hover:border-slate-300 hover:text-slate-900')
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Overview Layout (ภาพรวม) */}
        {filteredImages.length === 0 ? (
          <div className={`text-center py-20 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>ไม่พบรูปภาพในหมวดหมู่นี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8">
            {filteredImages.map((img, index) => (
              <motion.article 
                key={`${img.url}-${index}`}
                layoutId={`gallery-card-${img.url}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => setLightboxIndex(index)}
                className={`group rounded-3xl overflow-hidden border hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer flex flex-col h-full justify-between relative ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-b from-white to-slate-50/70 border-slate-200/60 hover:border-blue-300'}`}
              >
                {/* Museum-style padded photo container */}
                <div className="p-3.5 pb-0">
                  <div className={`relative overflow-hidden aspect-video bg-slate-900 rounded-2xl border shadow-inner ${isDarkMode ? 'border-slate-800' : 'border-slate-200/50'}`}>
                    <img 
                      src={img.url} 
                      alt={img.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Hover icon zoom overlay */}
                    <div className="absolute inset-0 bg-blue-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-3 bg-white/20 backdrop-blur-md text-white rounded-full border border-white/30 transform scale-75 group-hover:scale-100 transition-transform">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Text & Metadata below image */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Category & Index Header Row */}
                    <div className="flex items-center justify-between text-[10px] font-bold tracking-wider">
                      <span className={`px-2 py-0.5 rounded-md uppercase text-[9px] border ${isDarkMode ? 'bg-blue-950/40 border-blue-900/30 text-blue-400' : 'bg-blue-50 border-blue-100/50 text-blue-600'}`}>
                        {img.category}
                      </span>
                      <span className={`font-mono text-[9px] tracking-wider px-1.5 py-0.5 rounded ${isDarkMode ? 'text-slate-500 bg-slate-950' : 'text-slate-400 bg-slate-100'}`}>
                        N° {(index + 1).toString().padStart(2, '0')}
                      </span>
                    </div>

                    <h3 className={`font-bold text-sm sm:text-base group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {img.title}
                    </h3>
                    
                    {img.description ? (
                      <p className={`text-xs line-clamp-2 leading-relaxed font-light ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {img.description}
                      </p>
                    ) : (
                      <p className={`text-xs italic font-light ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        ปฏิบัติการช่วยเหลือและนำส่งผู้ป่วยอย่างรวดเร็วและปลอดภัยระดับชีพวิกฤต
                      </p>
                    )}
                  </div>

                  {/* Metadata display & Interactive Bottom Row */}
                  <div className={`pt-3.5 border-t space-y-3 ${isDarkMode ? 'border-slate-800/85' : 'border-slate-100/85'}`}>
                    {(img.date || img.location) && (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold text-slate-400">
                        {img.date && (
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-100/60'}`}>
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{img.date}</span>
                          </span>
                        )}
                        {img.location && (
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md truncate max-w-[150px] ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-100/60'}`}>
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{img.location}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Expand Trigger Bar */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-blue-600 group-hover:text-blue-700 pt-0.5 transition-colors">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        คลิกดูรูปภาพขนาดใหญ่
                      </span>
                      <span className="flex items-center gap-1 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                        <span>ขยาย</span>
                        <Maximize2 className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

      </div>

      {/* Lightbox / Slideshow Overlay (ชุดเลื่อนรูปภาพ) */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <div 
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex flex-col justify-between p-4 md:p-8"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Header / Controls */}
            <div className="flex items-center justify-between text-white z-50">
              <div className="space-y-0.5">
                <span className="text-[10px] sm:text-xs font-mono font-bold text-blue-400 tracking-wider uppercase block">
                  IMAGE SHOWCASE • กำลังเลื่อนดู
                </span>
                <h4 className="font-bold text-sm sm:text-lg line-clamp-1">
                  {filteredImages[lightboxIndex].title}
                </h4>
              </div>
              
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2 sm:p-2.5 bg-slate-900/80 hover:bg-slate-800 rounded-full border border-slate-850 text-white transition-colors cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Middle Main Content Carousel */}
            <div className="relative flex-grow flex items-center justify-center max-h-[70vh] my-4">
              {/* Prev Button */}
              <button
                onClick={handlePrev}
                className="absolute left-0 xs:left-2 sm:left-4 z-50 p-3 sm:p-4 bg-slate-900/60 hover:bg-slate-900/95 text-white rounded-full border border-slate-800/80 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
                aria-label="Previous Image"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Main Image Slider with motion */}
              <div 
                className="relative max-w-5xl w-full h-full flex items-center justify-center pointer-events-none px-12"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={filteredImages[lightboxIndex].url}
                    src={filteredImages[lightboxIndex].url}
                    alt={filteredImages[lightboxIndex].title}
                    referrerPolicy="no-referrer"
                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl pointer-events-auto select-none"
                  />
                </AnimatePresence>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-0 xs:right-2 sm:right-4 z-50 p-3 sm:p-4 bg-slate-900/60 hover:bg-slate-900/95 text-white rounded-full border border-slate-800/80 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
                aria-label="Next Image"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Bottom Details/Status */}
            <div className="text-center text-white z-50 max-w-xl mx-auto space-y-3">
              {filteredImages[lightboxIndex].description && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  {filteredImages[lightboxIndex].description}
                </p>
              )}
              
              <div className="flex items-center justify-center gap-5 text-[11px] text-slate-450 font-semibold bg-slate-900/50 backdrop-blur-md py-1.5 px-4 rounded-full border border-slate-850 inline-flex">
                <span className="text-blue-400 font-bold uppercase tracking-wider">
                  {filteredImages[lightboxIndex].category}
                </span>
                <span>•</span>
                <span>รูปที่ {lightboxIndex + 1} จากทั้งหมด {filteredImages.length} รูป</span>
                {filteredImages[lightboxIndex].location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-sans">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{filteredImages[lightboxIndex].location}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
