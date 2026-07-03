import { Phone, MessageSquare, Shield, Activity, Clock, HeartPulse } from 'lucide-react';
import { CompanyConfig } from '../types';
import { getSectionBgStyle } from '../utils/bgHelper';
import DirectEditButton from './DirectEditButton';
import { motion } from 'motion/react';

interface HeroProps {
  config: CompanyConfig;
  onContactClick: () => void;
  isAdmin?: boolean;
  onDirectEdit?: (tab: 'company' | 'services' | 'works' | 'passcode', fieldId?: string) => void;
  isDarkMode?: boolean;
}

export default function Hero({ config, onContactClick, isAdmin, onDirectEdit, isDarkMode = false }: HeroProps) {
  const { style, className, isLight } = getSectionBgStyle('hero', config, 'relative overflow-hidden bg-slate-900 text-white py-20 lg:py-32', isDarkMode);

  // Extract background image from inline style to manage it responsively for mobile
  const hasBgImage = !!style.backgroundImage;
  const sectionStyle = { ...style };
  
  if (hasBgImage) {
    delete sectionStyle.backgroundImage;
    delete sectionStyle.backgroundSize;
    delete sectionStyle.backgroundPosition;
    delete sectionStyle.backgroundRepeat;
  }

  return (
    <section style={sectionStyle} className={`${className} ${isLight ? 'text-slate-900' : 'text-white'} relative`}>
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
          onClick={() => onDirectEdit?.('company', 'cms-brand-name')} 
          label="ข้อมูลหัวเรื่อง & สโลแกน"
          className="!relative !top-auto !right-auto"
        />
        <DirectEditButton 
          isAdmin={isAdmin} 
          onClick={() => onDirectEdit?.('company', 'cms-bg-hero')} 
          label="พื้นหลังส่วนนี้"
          className="!relative !top-auto !right-auto bg-blue-600 hover:bg-blue-500 border-blue-500 hover:border-blue-400"
        />
      </div>
      {/* Decorative Background Elements */}
      {!isLight && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(244,63,94,0.1),transparent_50%)]" />
        </>
      )}

      {/* SVG ECG Heartbeat (Life-saving) Line Overlay */}
      <div className="absolute inset-x-0 bottom-0 overflow-hidden pointer-events-none h-40">
        <svg 
          className={`w-full h-full ${isLight ? 'text-rose-500/10' : 'text-blue-500/15'}`} 
          viewBox="0 0 1000 100" 
          preserveAspectRatio="none" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
        >
          {/* Animated Heartbeat stroke */}
          <path 
            className="animate-pulse"
            style={{ animationDuration: '3.5s' }}
            d="M 0 50 L 150 50 L 170 30 L 190 70 L 210 10 L 230 90 L 250 40 L 270 55 L 290 50 L 450 50 L 470 30 L 490 70 L 510 10 L 530 90 L 550 40 L 570 55 L 590 50 L 750 50 L 770 30 L 790 70 L 810 10 L 830 90 L 850 40 L 870 55 L 890 50 L 1000 50" 
          />
        </svg>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-8 max-w-3xl mx-auto"
        >
          {/* Tag / Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
            isLight 
              ? 'bg-rose-50 border border-rose-200 text-rose-600' 
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}>
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLight ? 'bg-rose-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLight ? 'bg-rose-500' : 'bg-rose-500'}`}></span>
            </span>
            บริการช่วยเหลือฉุกเฉินตลอด 24 ชั่วโมง
          </div>

          {/* Slogan */}
          <h2 
            style={config.heroTextColor ? { color: config.heroTextColor } : undefined}
            className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}
          >
            {config.title}
            <span 
              style={config.heroTextColor ? { color: config.heroTextColor } : undefined}
              className={`block text-3xl sm:text-4xl lg:text-5xl mt-3 font-medium ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}
            >
              {config.tagline}
            </span>
          </h2>

          {/* Description */}
          <p 
            style={config.heroTextColor ? { color: config.heroTextColor } : undefined}
            className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-semibold ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            {config.description}
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href={`tel:${config.emergencyPhone}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-rose-950/30 hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
            >
              <Phone className="w-5 h-5 animate-pulse" />
              สายด่วนฉุกเฉิน {config.emergencyPhone}
            </a>
            
            <a
              href={`https://line.me/R/ti/p/~${config.lineId.replace('@', '')}`}
              target="_blank"
              referrerPolicy="no-referrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-emerald-950/20 hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 11.5c0-5.247-5.385-9.5-12-9.5S0 6.253 0 11.5c0 4.695 4.27 8.619 10.05 9.355.39.084.92.258 1.05.592.12.308.08.79.04 1.103l-.16 1.048c-.05.308-.23 1.201.99.654 1.22-.547 6.58-3.87 8.98-6.627C22.9 15.936 24 13.856 24 11.5zM7.55 14.2h-2.1c-.28 0-.5-.22-.5-.5V8.8c0-.28.22-.5.5-.5s.5.22.5.5v4.4h1.6c.28 0 .5.22.5.5s-.22.5-.5.5zm2.84-.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V8.8c0-.28.22-.5.5-.5s.5.22.5.5v4.9zm5.56 0c0 .21-.13.39-.33.46-.2.07-.42.01-.56-.14l-2.43-2.61v2.29c0 .28-.22.5-.5.5s-.5-.22-.5-.5V8.8c0-.21.13-.39.33-.46.2-.07.42-.01.56.14l2.43 2.61V8.8c0-.28.22-.5.5-.5s.5.22.5.5v4.9zm4.25-1.9c.28 0 .5.22.5.5s-.22.5-.5.5h-1.6v1.4h1.6c.28 0 .5.22.5.5s-.22.5-.5.5H18c-.28 0-.5-.22-.5-.5V8.8c0-.28.22-.5.5-.5h2.1c.28 0 .5.22.5.5s-.22.5-.5.5H18.5v1.4h1.6z"/>
              </svg>
              แชทติดต่อทาง LINE (คลิกแอดไลน์)
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
