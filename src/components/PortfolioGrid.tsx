import React, { useState } from 'react';
import { Work, CompanyConfig } from '../types';
import { Calendar, MapPin, Tag, ChevronRight, ChevronLeft, X, Clock } from 'lucide-react';
import { getSectionBgStyle } from '../utils/bgHelper';
import DirectEditButton from './DirectEditButton';
import { motion } from 'motion/react';

interface PortfolioGridProps {
  works: Work[];
  config: CompanyConfig;
  isAdmin?: boolean;
  onDirectEdit?: (tab: 'company' | 'services' | 'works' | 'passcode', fieldId?: string) => void;
  isDarkMode?: boolean;
}

export default function PortfolioGrid({ works, config, isAdmin, onDirectEdit, isDarkMode = false }: PortfolioGridProps) {
  const { style, className, isLight } = getSectionBgStyle('portfolio', config, 'py-24 bg-slate-50 relative', isDarkMode);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState<number>(0);
  const [cardImgIndices, setCardImgIndices] = useState<Record<string, number>>({});

  const hasBgImage = !!style.backgroundImage;
  const outerStyle = { ...style };
  if (hasBgImage) {
    delete outerStyle.backgroundImage;
    delete outerStyle.backgroundSize;
    delete outerStyle.backgroundPosition;
    delete outerStyle.backgroundRepeat;
  }

  // Touch swipe tracking states
  const [touchStartX, setTouchStartX] = useState<number>(0);
  const [touchStartId, setTouchStartId] = useState<string | null>(null);
  const [modalTouchStartX, setModalTouchStartX] = useState<number>(0);

  // Extract all unique categories dynamically
  const categories = ['All', ...Array.from(new Set(works.map(w => w.category)))];

  const filteredWorks = selectedCategory === 'All' 
    ? works 
    : works.filter(w => w.category === selectedCategory);

  return (
    <section id="portfolio" style={outerStyle} className={`${className} relative`}>
      {/* Responsive Background Image Layer */}
      {hasBgImage && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div 
            style={{ backgroundImage: style.backgroundImage }}
            className="absolute inset-0 bg-cover bg-center"
          />
          {/* Ambient overlays to ensure text readability */}
          <div className={`absolute inset-0 ${
            isLight 
              ? 'bg-white/50' 
              : 'bg-slate-950/55'
          }`} />
        </div>
      )}
      {/* Direct CMS Edit Buttons */}
      <div className="absolute top-4 right-4 sm:right-6 md:right-8 flex flex-col sm:flex-row gap-2 z-30">
        <DirectEditButton 
          isAdmin={isAdmin} 
          onClick={() => onDirectEdit?.('works')} 
          label="บันทึกผลงาน/ภารกิจ"
          className="!relative !top-auto !right-auto"
        />
        <DirectEditButton 
          isAdmin={isAdmin} 
          onClick={() => onDirectEdit?.('company', 'cms-bg-portfolio')} 
          label="พื้นหลังส่วนนี้"
          className="!relative !top-auto !right-auto bg-blue-600 hover:bg-blue-500 border-blue-500 hover:border-blue-400"
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <span className="text-rose-500 text-xs font-bold tracking-widest uppercase block">
            OUR WORKS • ผลงานและกิจกรรมที่ผ่านมา
          </span>
          <h2 
            style={config.portfolioTextColor ? { color: config.portfolioTextColor } : undefined}
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
          >
            บันทึกภารกิจและกิจกรรมการสแตนด์บาย
          </h2>
          <div className="h-1 w-12 bg-rose-500 mx-auto rounded" />
          <p 
            style={config.portfolioTextColor ? { color: config.portfolioTextColor, opacity: 0.9 } : undefined}
            className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
          >
            ความภาคภูมิใจในทุกภารกิจการดูแลชีวิต ไม่ว่าจะเป็นงานเฝ้าระวังเหตุในคอนเสิร์ตใหญ่ระดับโลก หรือการเคลื่อนย้ายผู้ป่วยทางไกลด้วยความอุ่นใจและปลอดภัย
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? (isDarkMode ? 'bg-rose-600 border-rose-600 text-white shadow-md' : 'bg-slate-900 border-slate-900 text-white shadow-md')
                  : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900')
              }`}
            >
              {cat === 'All' ? 'ทั้งหมด' : cat}
            </button>
          ))}
        </motion.div>

        {/* Portfolio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWorks.map((work, index) => (
            <motion.article 
              key={work.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              onClick={() => { 
                setSelectedWork(work); 
                setCurrentImgIndex(cardImgIndices[work.id] || 0); 
              }}
              className={`group rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
            >
              <div>
                {/* Image Wrap (Interactive Slider with Loop & Swipe) */}
                <div 
                  className="relative h-56 w-full overflow-hidden bg-slate-100 group/card-img"
                  onTouchStart={(e) => {
                    setTouchStartX(e.targetTouches[0].clientX);
                    setTouchStartId(work.id);
                  }}
                  onTouchEnd={(e) => {
                    if (touchStartId !== work.id) return;
                    const diffX = touchStartX - e.changedTouches[0].clientX;
                    const urls = work.imageUrls && work.imageUrls.length > 0
                      ? work.imageUrls
                      : [work.imageUrl || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80"];
                    const totalImages = urls.length;
                    const currentIdx = cardImgIndices[work.id] || 0;

                    if (Math.abs(diffX) > 40 && totalImages > 1) {
                      if (diffX > 0) {
                        // swipe left -> next image
                        const nextIdx = currentIdx === totalImages - 1 ? 0 : currentIdx + 1;
                        setCardImgIndices(prev => ({ ...prev, [work.id]: nextIdx }));
                      } else {
                        // swipe right -> prev image
                        const prevIdx = currentIdx === 0 ? totalImages - 1 : currentIdx - 1;
                        setCardImgIndices(prev => ({ ...prev, [work.id]: prevIdx }));
                      }
                    }
                  }}
                >
                  {(() => {
                    const urls = work.imageUrls && work.imageUrls.length > 0
                      ? work.imageUrls
                      : [work.imageUrl || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80"];
                    const totalImages = urls.length;
                    const currentIdx = cardImgIndices[work.id] || 0;
                    const activeImg = urls[currentIdx] || urls[0];

                    const nextImg = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      const nextIdx = currentIdx === totalImages - 1 ? 0 : currentIdx + 1;
                      setCardImgIndices(prev => ({ ...prev, [work.id]: nextIdx }));
                    };

                    const prevImg = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      const prevIdx = currentIdx === 0 ? totalImages - 1 : currentIdx - 1;
                      setCardImgIndices(prev => ({ ...prev, [work.id]: prevIdx }));
                    };

                    return (
                      <>
                        <img 
                          src={activeImg} 
                          alt={`${work.title} - ${currentIdx + 1}`}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80";
                          }}
                          className="w-full h-full object-cover group-hover/card-img:scale-105 transition-transform duration-500"
                        />

                        {/* Slide Left/Right Controls on Hover/Active */}
                        {totalImages > 1 && (
                          <>
                            <button
                              onClick={prevImg}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover/card-img:opacity-100 transition-opacity duration-200 z-10 cursor-pointer"
                              title="ภาพก่อนหน้า"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={nextImg}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover/card-img:opacity-100 transition-opacity duration-200 z-10 cursor-pointer"
                              title="ภาพถัดไป"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Image Counter Badge */}
                        {totalImages > 1 && (
                          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded-full z-10">
                            {currentIdx + 1} / {totalImages}
                          </div>
                        )}

                        {/* Dots Indicators */}
                        {totalImages > 1 && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10 bg-black/20 px-1.5 py-0.5 rounded-full backdrop-blur-[2px]">
                            {urls.map((_, i) => (
                              <button
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCardImgIndices(prev => ({ ...prev, [work.id]: i }));
                                }}
                                className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${
                                  i === currentIdx ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/70'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {/* Category overlay */}
                  <span className={`absolute top-3 left-3 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[9px] font-bold text-rose-600 tracking-wider uppercase border z-10 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-100'}`}>
                    {work.category}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className={`w-3.5 h-3.5 ${isDarkMode ? 'text-slate-550' : 'text-slate-300'}`} />
                      {work.date}
                    </span>
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      <MapPin className={`w-3.5 h-3.5 ${isDarkMode ? 'text-slate-550' : 'text-slate-300'}`} />
                      {work.location}
                    </span>
                  </div>

                  <h3 className={`font-bold text-lg group-hover:text-rose-500 transition-colors line-clamp-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {work.title}
                  </h3>
                  
                  <p className={`text-xs sm:text-sm font-light leading-relaxed line-clamp-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {work.description}
                  </p>
                </div>
              </div>

              {/* Action bar */}
              <div className={`p-6 sm:px-8 sm:pb-8 pt-0 border-t flex items-center justify-between text-xs font-semibold text-rose-500 group-hover:text-rose-600 ${isDarkMode ? 'border-slate-800' : 'border-slate-50/50'}`}>
                <span>อ่านบันทึกปฏิบัติการ</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>

            </motion.article>
          ))}
        </div>

        {/* Empty State */}
        {filteredWorks.length === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl">
            <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700">ไม่มีผลงานในหมวดหมู่นี้</h4>
            <p className="text-xs text-slate-400 mt-1">แอดมินสามารถเพิ่มผลงานใหม่ในหมวดหมู่นี้ผ่านระบบหลังบ้านได้ทันที</p>
          </div>
        )}

        {/* Dynamic Detail Modal */}
        {selectedWork && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`relative rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'}`}>
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedWork(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image Banner Carousel */}
              <div 
                className="h-64 sm:h-80 w-full overflow-hidden bg-slate-100 relative group/carousel flex-shrink-0 rounded-t-3xl"
                onTouchStart={(e) => setModalTouchStartX(e.targetTouches[0].clientX)}
                onTouchEnd={(e) => {
                  const urls = selectedWork.imageUrls && selectedWork.imageUrls.length > 0
                    ? selectedWork.imageUrls
                    : [selectedWork.imageUrl || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80"];
                  const totalImages = urls.length;
                  const diffX = modalTouchStartX - e.changedTouches[0].clientX;
                  
                  if (Math.abs(diffX) > 40 && totalImages > 1) {
                    if (diffX > 0) {
                      // swipe left -> next image
                      setCurrentImgIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
                    } else {
                      // swipe right -> prev image
                      setCurrentImgIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
                    }
                  }
                }}
              >
                {(() => {
                  const urls = selectedWork.imageUrls && selectedWork.imageUrls.length > 0
                    ? selectedWork.imageUrls
                    : [selectedWork.imageUrl || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80"];
                  const totalImages = urls.length;
                  const activeImg = urls[currentImgIndex] || urls[0];

                  const prevImage = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    setCurrentImgIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
                  };

                  const nextImage = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    setCurrentImgIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
                  };

                  return (
                    <>
                      {/* Current Image */}
                      <img 
                        src={activeImg} 
                        alt={`${selectedWork.title} - ${currentImgIndex + 1}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80";
                        }}
                        className="w-full h-full object-cover transition-all duration-500"
                      />
                      
                      {/* Left/Right Controls */}
                      {totalImages > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/45 hover:bg-black/70 text-white rounded-full cursor-pointer transition-all duration-200 shadow-md backdrop-blur-sm z-10"
                            title="ภาพก่อนหน้า"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/45 hover:bg-black/70 text-white rounded-full cursor-pointer transition-all duration-200 shadow-md backdrop-blur-sm z-10"
                            title="ภาพถัดไป"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Top Right Counter Indicator */}
                      {totalImages > 1 && (
                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold font-mono px-2.5 py-1 rounded-full z-10">
                          {currentImgIndex + 1} / {totalImages}
                        </div>
                      )}

                      {/* Navigation Dots */}
                      {totalImages > 1 && (
                        <div className="absolute bottom-6 right-6 flex gap-1.5 z-10 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                          {urls.map((_, i) => (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImgIndex(i);
                              }}
                              className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                                i === currentImgIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
                      
                      {/* Title & Category over image bottom */}
                      <div className="absolute bottom-6 left-6 right-24 space-y-1.5 pointer-events-none z-10">
                        <span className="bg-rose-500 text-[9px] font-bold text-white px-2.5 py-0.5 rounded-md tracking-wider uppercase inline-block">
                          {selectedWork.category}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-white leading-tight drop-shadow-md">
                          {selectedWork.title}
                        </h3>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Metas */}
                <div className={`grid grid-cols-2 gap-4 border-b pb-4 text-xs font-semibold ${isDarkMode ? 'border-slate-800 text-slate-350' : 'border-slate-100 text-slate-600'}`}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-rose-500" />
                    <div>
                      <span className={`block text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>วันที่ดำเนินภารกิจ</span>
                      <span>{selectedWork.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <div>
                      <span className={`block text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>สถานที่ปฏิบัติภารกิจ</span>
                      <span className="truncate">{selectedWork.location}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>รายละเอียดการปฏิบัติภารกิจ</h4>
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap font-light ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {selectedWork.description}
                  </p>
                </div>

                {/* Trust Footer inside Modal */}
                <div className={`rounded-2xl p-4 flex items-start gap-3 border ${isDarkMode ? 'bg-rose-950/20 border-rose-900/30 text-rose-300' : 'bg-rose-50/50 border-rose-100/50 text-slate-600'}`}>
                  <Clock className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span className="font-bold block text-rose-500">ข้อมูลอ้างอิงทางการแพทย์:</span>
                    ทุกการเคลื่อนย้ายและสแตนด์บาย มีการจดบันทึกตามมาตรฐาน สพฉ. (สถาบันการแพทย์ฉุกเฉินแห่งชาติ) เพื่อประเมินคุณภาพและติดตามความคืบหน้าของสุขสภาวะผู้ป่วยอย่างเข้มงวด
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className={`p-6 border-t flex justify-end ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'}`}>
                <button 
                  onClick={() => setSelectedWork(null)}
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow transition-colors cursor-pointer ${isDarkMode ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                >
                  ปิดหน้าต่าง
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
