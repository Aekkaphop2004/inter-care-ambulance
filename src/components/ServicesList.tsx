import { Service, CompanyConfig } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { ChevronRight } from 'lucide-react';
import DirectEditButton from './DirectEditButton';
import { motion } from 'motion/react';
import { getSectionBgStyle } from '../utils/bgHelper';

interface ServicesListProps {
  services: Service[];
  config: CompanyConfig;
  onContactClick: () => void;
  isAdmin?: boolean;
  onDirectEdit?: (tab: 'company' | 'services' | 'works' | 'passcode', fieldId?: string) => void;
  isDarkMode?: boolean;
}

const CARD_THEMES = [
  {
    // ALS - Royal Blue
    gradientStart: 'from-blue-600',
    gradientEnd: 'to-blue-500',
    borderColor: 'group-hover:border-blue-500/50',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400'
  },
  {
    // BLS - Deep Teal
    gradientStart: 'from-cyan-600',
    gradientEnd: 'to-cyan-500',
    borderColor: 'group-hover:border-cyan-500/50',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400'
  },
  {
    // Event Standby - Emerald Green
    gradientStart: 'from-emerald-600',
    gradientEnd: 'to-emerald-500',
    borderColor: 'group-hover:border-emerald-500/50',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400'
  },
  {
    // Home Care - Amber / Gold
    gradientStart: 'from-amber-600',
    gradientEnd: 'to-amber-500',
    borderColor: 'group-hover:border-amber-500/50',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400'
  }
];

export default function ServicesList({ services, config, onContactClick, isAdmin, onDirectEdit, isDarkMode = false }: ServicesListProps) {
  const { style: bgStyle, className: bgClassName, isLight } = getSectionBgStyle('services', config, 'py-24 relative overflow-hidden bg-slate-950 text-white', isDarkMode);
  const descColor = config.servicesDescColor === '#ffffff' ? '#fca5a5' : (config.servicesDescColor || config.servicesTextColor);

  const hasBgImage = !!bgStyle.backgroundImage;
  const outerStyle = { ...bgStyle };
  if (hasBgImage) {
    delete outerStyle.backgroundImage;
    delete outerStyle.backgroundSize;
    delete outerStyle.backgroundPosition;
    delete outerStyle.backgroundRepeat;
  }

  return (
    <section 
      id="services" 
      style={outerStyle}
      className={`${bgClassName} relative`}
    >
      {/* Responsive Background Image Layer */}
      {hasBgImage && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div 
            style={{ backgroundImage: bgStyle.backgroundImage }}
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
      {/* Subtle, premium grid overlay for professional architectural feel */}
      {!config.servicesBgVal && (
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
      )}
      
      {/* Soft, non-distracting ambient light flares */}
      {!isLight && (
        <>
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-[130px] pointer-events-none" />
        </>
      )}

      {/* Direct CMS Edit Buttons */}
      <div className="absolute top-4 right-4 sm:right-6 md:right-8 flex flex-col sm:flex-row gap-2 z-30">
        <DirectEditButton 
          isAdmin={isAdmin} 
          onClick={() => onDirectEdit?.('services')} 
          label="รายการบริการ"
          className="!relative !top-auto !right-auto"
        />
        <DirectEditButton 
          isAdmin={isAdmin} 
          onClick={() => onDirectEdit?.('company', 'cms-bg-services')} 
          label="พื้นหลังส่วนนี้"
          className="!relative !top-auto !right-auto bg-blue-600 hover:bg-blue-500 border-blue-500 hover:border-blue-400"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <span className="text-rose-500 text-xs font-bold tracking-widest uppercase block">
            OUR AMBULANCE SERVICES • บริการรถพยาบาลฉุกเฉิน
          </span>
          <h2 
            style={config.servicesTitleColor || config.servicesTextColor ? { color: config.servicesTitleColor || config.servicesTextColor } : undefined}
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${config.servicesTitleColor || config.servicesTextColor ? '' : (isLight ? 'text-slate-900' : 'text-white')}`}
          >
            ครอบคลุมทุกการเคลื่อนย้ายและดูแลฉุกเฉิน
          </h2>
          <div className="h-1 w-12 bg-rose-500 mx-auto rounded" />
          <p 
            style={descColor ? { color: descColor } : undefined}
            className={`text-sm sm:text-base leading-relaxed font-semibold text-white`}
          >
            อินเตอร์ แคร์ แอมบูแลนซ์ พร้อมให้บริการคุณด้วยกองรถพยาบาลมาตรฐานที่เพียบพร้อม และบุคลากรที่อุทิศตนเพื่อความปลอดภัยสูงสุดในทุกการนำส่ง
          </p>
        </motion.div>

        {/* Services Grid - Human-crafted, clean, and extremely professional */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {services.map((service, index) => {
            const theme = CARD_THEMES[index % CARD_THEMES.length];

            return (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative ${isLight ? 'bg-white/95 hover:bg-white border-slate-200/80 hover:border-slate-300' : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80'} border ${theme.borderColor} rounded-2xl p-6 sm:p-8 flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isLight ? 'hover:shadow-slate-200/50' : 'hover:shadow-black/40'}`}
              >
                <div className="space-y-6">
                  {/* Clean static icon container with subtle coloring */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.iconBg} ${theme.iconColor} border border-white/5 shadow-inner`}>
                    <DynamicIcon name={service.iconName} className="w-6 h-6" />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className={`font-bold text-lg transition-colors ${isLight ? 'text-slate-800 group-hover:text-black' : 'text-slate-100 group-hover:text-white'}`}>
                      {service.title}
                    </h3>
                    <p className={`text-xs sm:text-sm font-light leading-relaxed transition-colors ${isLight ? 'text-slate-600 group-hover:text-slate-700' : 'text-slate-200 group-hover:text-white'}`}>
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className={`pt-6 mt-6 border-t ${isLight ? 'border-slate-100' : 'border-slate-800/60'} flex items-center justify-between`}>
                  <button 
                    onClick={onContactClick}
                    className={`px-4 py-2 ${isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900' : 'bg-slate-800/50 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'} rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer`}
                  >
                    <span>สอบถามเพิ่มเติม</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                  
                  {/* Humble clean index indicator */}
                  <span className={`font-mono text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-600'} font-semibold tracking-wider`}>
                    0{index + 1}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic CTA Banner bottom */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className={`mt-16 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-gradient-to-r from-slate-900/80 to-slate-950 border-slate-800/80 text-white'} border rounded-2xl p-8 sm:p-12 relative overflow-hidden shadow-xl`}
        >
          {/* Subtle background light glow */}
          {!isLight && (
            <div className="absolute right-0 bottom-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
          )}
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl text-center md:text-left">
              <h3 className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>มีเคสเร่งด่วน หรือต้องการเช่าเหมาสแตนด์บาย?</h3>
              <p className={`text-sm font-light ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                ติดต่อเจ้าหน้าที่เพื่อรับใบเสนอราคาอย่างรวดเร็ว บริการระดับพรีเมียมในราคามิตรภาพ ประสานงานส่งตัวได้ 24 ชั่วโมง ทั่วประเทศ
              </p>
            </div>
            <button 
              onClick={onContactClick}
              className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-8 py-4 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer whitespace-nowrap"
            >
              ติดต่อฝ่ายบริการลูกค้า
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
