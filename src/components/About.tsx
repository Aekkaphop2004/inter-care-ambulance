import { Shield, Award, Sparkles, Activity, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import { CompanyConfig, TeamMember } from '../types';
import { getSectionBgStyle } from '../utils/bgHelper';
import DirectEditButton from './DirectEditButton';
import { motion } from 'motion/react';

interface AboutProps {
  config: CompanyConfig;
  members?: TeamMember[];
  isAdmin?: boolean;
  onDirectEdit?: (tab: 'company' | 'services' | 'works' | 'passcode' | 'team', fieldId?: string) => void;
  isDarkMode?: boolean;
}

export default function About({ config, members, isAdmin, onDirectEdit, isDarkMode = false }: AboutProps) {
  const { style, className, isLight } = getSectionBgStyle('about', config, 'py-24 bg-slate-50 overflow-hidden', isDarkMode);
  const companyTitle = config.title;

  const hasBgImage = !!style.backgroundImage;
  const outerStyle = { ...style };
  if (hasBgImage) {
    delete outerStyle.backgroundImage;
    delete outerStyle.backgroundSize;
    delete outerStyle.backgroundPosition;
    delete outerStyle.backgroundRepeat;
  }

  // Find the director/leadership team member if available in the database list
  const directorMember = members?.find(m => 
    m.id === 'member-1' || 
    m.role.includes('Director') || 
    m.role.includes('ผู้อำนวยการ') || 
    m.name.includes('รณเดช')
  );

  const directorName = directorMember?.name || config.directorName || "นพ. รณเดช อัศวเวชศาสตร์";
  const directorTitle = directorMember?.role || config.directorTitle || `ผู้อำนวยการด้านการดูแลผู้ป่วย ${companyTitle}`;
  const directorQuote = directorMember?.description || config.directorQuote || "ความรวดเร็วและปลอดภัยของคนไข้คือสิ่งที่พวกเรายึดมั่นที่สุด ทุกวินาทีในรถพยาบาลคือภารกิจช่วยชีวิตที่ต้องอาศัยความถูกต้องแม่นยำระดับมืออาชีพ";
  const finalProfileImageUrl = directorMember?.imageUrl || config.profileImageUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&h=400&q=80";

  return (
    <section id="about" style={outerStyle} className={`${className} relative`}>
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
          onClick={() => onDirectEdit?.('company', 'cms-description')} 
          label="รายละเอียดเกี่ยวกับเรา"
          className="!relative !top-auto !right-auto"
        />
        <DirectEditButton 
          isAdmin={isAdmin} 
          onClick={() => onDirectEdit?.('company', 'cms-bg-about')} 
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
            ABOUT US • เกี่ยวกับเรา
          </span>
          <h2 
            style={config.aboutTextColor ? { color: config.aboutTextColor } : undefined}
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
          >
            มาตรฐานรถพยาบาลและการดูแลระดับมืออาชีพ
          </h2>
          <div className="h-1 w-12 bg-rose-500 mx-auto rounded" />
          
          <p 
            style={config.aboutTextColor ? { color: config.aboutTextColor, opacity: 0.9 } : undefined}
            className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
          >
            เราไม่ใช่เพียงแค่บริการรถพยาบาลรับส่ง แต่เราคือผู้ร่วมดูแลสุขอนามัยและความปลอดภัยของผู้ป่วยทุกคนในครอบครัวของคุณ ด้วยมาตรฐานระดับสากลและความเอาใจใส่ประหนึ่งญาติมิตร
          </p>
        </motion.div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Strengths / Core Pillars */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h3 
              style={config.aboutTextColor ? { color: config.aboutTextColor } : undefined}
              className={`text-2xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
            >
              ทำไมโรงพยาบาลชั้นนำและคนไข้จำนวนมากถึงไว้วางใจเลือกใช้บริการของเรา?
            </h3>
            
            <p 
              style={config.aboutTextColor ? { color: config.aboutTextColor, opacity: 0.9 } : undefined}
              className={`leading-relaxed font-light ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
            >
              อินเตอร์ แคร์ แอมบูแลนซ์ มุ่งมั่นรักษามาตรฐานสูงสุดในทุกภารกิจการช่วยเหลือและเคลื่อนย้ายผู้ป่วย รถพยาบาลทุกคันติดตั้งเทคโนโลยีช่วยชีวิตและเวชภัณฑ์ครบครัน มีระบบกำจัดเชื้อโรคหลังการทำงานทุกเคสเพื่อความสะอาดปราศจากเชื้อโรค
            </p>

            {/* Core list */}
            <div className="space-y-8">
              
              {/* Strength 1 */}
              <div className="space-y-1.5">
                <h4 className={`font-bold text-base flex items-center gap-2.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  ระบบความปลอดภัยและเทคโนโลยีครบครัน
                </h4>
                <p className={`text-xs sm:text-sm pl-4 leading-relaxed font-light ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  ติดตั้ง GPS ติดตามพยาบาลตลอด 24 ชั่วโมง พร้อมระบบกล้องวงจรปิดเรียลไทม์ภายในตู้พยาบาล เพื่อประสานงานแพทย์เฉพาะทางและศูนย์กู้ชีพได้อย่างไร้รอยต่อ
                </p>
              </div>

              {/* Strength 2 */}
              <div className="space-y-1.5">
                <h4 className={`font-bold text-base flex items-center gap-2.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  ทีมบุคลากรทางการแพทย์มืออาชีพ
                </h4>
                <p className={`text-xs sm:text-sm pl-4 leading-relaxed font-light ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  ประกอบด้วย แพทย์ พยาบาลวิชาชีพเวชปฏิบัติฉุกเฉิน (EN) และเจ้าหน้าที่กู้ชีพ (EMT) ที่ได้รับการอบรมหลักสูตรช่วยชีวิตระดับสูง (ACLS) และการปฐมพยาบาลสากล
                </p>
              </div>

              {/* Strength 3 */}
              <div className="space-y-1.5">
                <h4 className={`font-bold text-base flex items-center gap-2.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  มาตรฐานความสะอาดและปลอดเชื้อสูงสุด
                </h4>
                <p className={`text-xs sm:text-sm pl-4 leading-relaxed font-light ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  ทำความสะอาดฉีดพ่นและอบรังสีฆ่าเชื้อโรค (Ozone/UVC) ทันทีหลังปฏิบัติภารกิจเสร็จสิ้นทุกครั้ง เพื่อปกป้องคนไข้รายถัดไปจากการติดเชื้อแทรกซ้อนอย่างรัดกุม
                </p>
              </div>

            </div>

            {/* Leadership Profile Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl flex flex-col sm:flex-row gap-6 items-center mt-10 relative overflow-hidden group">
              <DirectEditButton 
                isAdmin={isAdmin} 
                onClick={() => {
                  if (directorMember) {
                    onDirectEdit?.('team', `member-edit-${directorMember.id}`);
                  } else {
                    onDirectEdit?.('company', 'cms-director-name');
                  }
                }} 
                label="ข้อมูลผู้บริหาร & คำคม"
                className="absolute bottom-3 right-3 sm:top-3 sm:bottom-auto !right-3 scale-90 sm:scale-100"
              />
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
              <img 
                src={finalProfileImageUrl} 
                alt="Medical Director" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&h=400&q=80";
                }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-rose-500/50 shadow-lg shadow-rose-950/40 transition-all duration-300 group-hover:scale-105 flex-shrink-0"
              />
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <span className="font-bold text-base sm:text-lg text-white">{directorName}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    แพทย์ที่ปรึกษาหลัก
                  </span>
                </div>
                <p className="text-xs text-rose-400 font-semibold tracking-wide uppercase">{directorTitle}</p>
                <p className="text-[11px] sm:text-xs text-slate-350 font-light leading-relaxed italic">
                  "{directorQuote}"
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual Infographics card */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Visual background card */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-rose-500/10 rounded-3xl blur-2xl opacity-70" />
            
            <div className={`relative border rounded-3xl shadow-xl p-8 sm:p-10 space-y-8 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <h3 className={`font-bold text-xl border-b pb-4 ${isDarkMode ? 'text-white border-slate-800' : 'text-slate-900 border-slate-100'}`}>
                ขั้นตอนมาตรฐานการทำงาน (SOP)
              </h3>

              <div className="space-y-6">
                
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${isDarkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                    1
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>รับข้อมูลและประเมินสภาวะแพทย์</h4>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      เจ้าหน้าที่วิทยุและพยาบาลคัดกรองรับสายด่วนเพื่อประเมินสภาวะผู้ป่วย ประเภทอุปกรณ์ และแพทย์เฉพาะทางที่เหมาะสมในทันที
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${isDarkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                    2
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>จัดส่งทีมแพทย์พร้อมออกปฏิบัติการใน 5 นาที</h4>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      ทีมเวชกิจฉุกเฉินสแตนด์บายพร้อมกระเป๋ายาและอุปกรณ์ช่วยชีวิต พร้อมเคลื่อนรถออกจากศูนย์พยาบาลด้วยความรวดเร็วและปลอดภัย
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${isDarkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                    3
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>ดูแลระหว่างนำส่งพร้อมรายงานแพทย์ปลายทาง</h4>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      วัดสัญญาณชีพอย่างต่อเนื่อง ดูแลความสุขสบาย และประสานรายงานแพทย์โรงพยาบาลปลายทางเพื่อเตรียมตัวรับรักษาต่อทันที
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${isDarkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                    4
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>ทำความสะอาดฆ่าเชื้อสเตอริไลซ์ห้องตู้พยาบาล</h4>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      พ่นสารฆ่าเชื้อโรคตามตารางงาน และอบโอนโซนห้องโดยสาร 15-20 นาที ก่อนสแตนด์บายรับเคสถัดไปในระบบ
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
