import { Phone, MessageSquare, MapPin, Clock, Facebook, Mail, ExternalLink } from 'lucide-react';
import { CompanyConfig } from '../types';
import { getSectionBgStyle } from '../utils/bgHelper';
import DirectEditButton from './DirectEditButton';
import { motion } from 'motion/react';

interface ContactSectionProps {
  config: CompanyConfig;
  isAdmin?: boolean;
  onDirectEdit?: (tab: 'company' | 'services' | 'works' | 'passcode', fieldId?: string) => void;
  isDarkMode?: boolean;
}

export default function ContactSection({ config, isAdmin, onDirectEdit, isDarkMode = false }: ContactSectionProps) {
  const { style, className, isLight } = getSectionBgStyle('contact', config, 'py-24 bg-slate-900 text-white relative', isDarkMode);

  const hasBgImage = !!style.backgroundImage;
  const outerStyle = { ...style };
  if (hasBgImage) {
    delete outerStyle.backgroundImage;
    delete outerStyle.backgroundSize;
    delete outerStyle.backgroundPosition;
    delete outerStyle.backgroundRepeat;
  }

  return (
    <section id="contact" style={outerStyle} className={`${className} ${isLight ? 'text-slate-900' : 'text-white'} relative`}>
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
          onClick={() => onDirectEdit?.('company', 'cms-emergency-phone')} 
          label="ช่องทาง & เบอร์ติดต่อ"
          className="!relative !top-auto !right-auto"
        />
        <DirectEditButton 
          isAdmin={isAdmin} 
          onClick={() => onDirectEdit?.('company', 'cms-bg-contact')} 
          label="พื้นหลังส่วนนี้"
          className="!relative !top-auto !right-auto bg-blue-600 hover:bg-blue-500 border-blue-500 hover:border-blue-400"
        />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.05),transparent_40%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <span className="text-rose-500 text-xs font-bold tracking-widest uppercase block">
            CONTACT US • ช่องทางการติดต่อ
          </span>
          <h2 
            style={config.contactTextColor ? { color: config.contactTextColor } : undefined}
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}
          >
            ติดต่อสอบถามบริการ หรือส่งทีมพยาบาลด่วน
          </h2>
          <div className="h-1 w-12 bg-rose-500 mx-auto rounded" />
          <p 
            style={config.contactTextColor ? { color: config.contactTextColor, opacity: 0.9 } : undefined}
            className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-300'}`}
          >
            ศูนย์วิทยุสื่อสารและกู้ชีพของเราเปิดสแตนด์บายรับประสานงานดูแลตลอด 24 ชั่วโมง ไม่มีวันหยุด ยินดีให้คำแนะนำประเภทรถพยาบาลและการเตรียมผู้ป่วยล่วงหน้า
          </p>
        </motion.div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Contact Details Cards (lg:col-span-5) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col justify-between space-y-6"
          >
            
            <div className="space-y-6">
              <h3 
                style={config.contactTextColor ? { color: config.contactTextColor } : undefined}
                className={`text-xl font-bold border-b pb-3 ${isLight ? 'text-slate-900 border-slate-200' : 'text-white border-slate-800'}`}
              >
                อินเตอร์ แคร์ แอมบูแลนซ์ (สำนักงานใหญ่)
              </h3>
              
              {/* Address */}
              <div className="flex gap-4">
                <div className={`flex-none w-10 h-10 rounded-xl flex items-center justify-center text-rose-500 ${isLight ? 'bg-rose-50' : 'bg-slate-800'}`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>ที่อยู่สำนักงาน</h4>
                  <p className={`text-sm font-light leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                    {config.address}
                  </p>
                </div>
              </div>

              {/* Emergency Hotline */}
              <div className={`flex gap-4 p-4 rounded-2xl border ${
                isLight 
                  ? 'bg-rose-50/50 border-rose-200/60' 
                  : 'bg-rose-950/20 border border-rose-500/20'
              }`}>
                <div className="flex-none w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-rose-900/30">
                  <Phone className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">สายด่วนติดต่อฉุกเฉิน (24 ชั่วโมง)</h4>
                  <a 
                    href={`tel:${config.emergencyPhone}`}
                    className={`text-xl font-extrabold hover:underline ${isLight ? 'text-rose-600' : 'text-white'}`}
                  >
                    {config.emergencyPhone}
                  </a>
                </div>
              </div>

              {/* General Phone */}
              <div className="flex gap-4">
                <div className={`flex-none w-10 h-10 rounded-xl flex items-center justify-center text-blue-500 ${isLight ? 'bg-blue-50' : 'bg-slate-800'}`}>
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>เบอร์โทรศัพท์สำนักงานใหญ่ / ประสานงาน</h4>
                  <a 
                    href={`tel:${config.contactPhone}`}
                    className={`text-sm font-semibold hover:underline ${isLight ? 'text-blue-600' : 'text-slate-200'}`}
                  >
                    {config.contactPhone}
                  </a>
                </div>
              </div>

              {/* Social Contacts: Line and Facebook */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Line ID */}
                <a
                  href={`https://line.me/R/ti/p/~${config.lineId.replace('@', '')}`}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className={`flex items-center gap-3 p-3.5 rounded-xl transition-all border ${
                    isLight 
                      ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm' 
                      : 'bg-slate-800 hover:bg-slate-700/80 border-slate-800'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-[#06C755]" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 11.5c0-5.247-5.385-9.5-12-9.5S0 6.253 0 11.5c0 4.695 4.27 8.619 10.05 9.355.39.084.92.258 1.05.592.12.308.08.79.04 1.103l-.16 1.048c-.05.308-.23 1.201.99.654 1.22-.547 6.58-3.87 8.98-6.627C22.9 15.936 24 13.856 24 11.5zM7.55 14.2h-2.1c-.28 0-.5-.22-.5-.5V8.8c0-.28.22-.5.5-.5s.5.22.5.5v4.4h1.6c.28 0 .5.22.5.5s-.22.5-.5.5zm2.84-.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V8.8c0-.28.22-.5.5-.5s.5.22.5.5v4.9zm5.56 0c0 .21-.13.39-.33.46-.2.07-.42.01-.56-.14l-2.43-2.61v2.29c0 .28-.22.5-.5.5s-.5-.22-.5-.5V8.8c0-.21.13-.39.33-.46.2-.07.42-.01.56.14l2.43 2.61V8.8c0-.28.22-.5.5-.5s.5.22.5.5v4.9zm4.25-1.9c.28 0 .5.22.5.5s-.22.5-.5.5h-1.6v1.4h1.6c.28 0 .5.22.5.5s-.22.5-.5.5H18c-.28 0-.5-.22-.5-.5V8.8c0-.28.22-.5.5-.5h2.1c.28 0 .5.22.5.5s-.22.5-.5.5H18.5v1.4h1.6z"/>
                  </svg>
                  <div className="text-left">
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">Line ID</span>
                    <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                      {config.lineId.replace(/\D/g, '').length >= 9 ? 'คลิกเพื่อแอดไลน์แชท' : config.lineId}
                    </span>
                  </div>
                </a>

                {/* Facebook Page */}
                <a
                  href={config.facebookUrl}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className={`flex items-center gap-3 p-3.5 rounded-xl transition-all border ${
                    isLight 
                      ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm' 
                      : 'bg-slate-800 hover:bg-slate-700/80 border-slate-800'
                  }`}
                >
                  <Facebook className="w-5 h-5 text-blue-500" />
                  <div className="text-left">
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">Facebook</span>
                    <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'} truncate max-w-[120px]`}>Inter Care</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Work Hours and Legal */}
            <div className={`pt-6 border-t space-y-2 text-xs ${isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'}`}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>เวลาทำการ: เปิดให้บริการรับส่งผู้ป่วย ตลอด 24 ชั่วโมง ทุกวัน</span>
              </div>
              <p className="font-light">
                * บริการครอบคลุมพื้นที่กรุงเทพฯ-ปริมณฑล และเคลื่อนย้ายทางไกลข้ามจังหวัดทั่วประเทศ ดำเนินการโดยแพทย์เวชศาสตร์ฉุกเฉินและพยาบาลวิชาชีพเวชปฏิบัติฉุกเฉินอย่างใกล้ชิด
              </p>
            </div>

          </motion.div>

          {/* Map Section (lg:col-span-7) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={`lg:col-span-7 h-[350px] sm:h-[450px] rounded-3xl overflow-hidden border shadow-2xl relative group ${isLight ? 'border-slate-200' : 'border-slate-800'}`}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3871.9547372223424!2d100.67261899999999!3d13.961633!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d7dfbf29216df%3A0xe01294ddd79a2b11!2sInter%20Care%20Ambulance!5e0!3m2!1sth!2sth!4v1719760000000!5m2!1sth!2sth"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Inter Care Ambulance HQ Location Map"
              className="absolute inset-0"
            />
            
            {/* Map overlay action */}
            <a 
              href="https://maps.app.goo.gl/ESWpsW6FnUXJ9Pts5?g_st=ac"
              target="_blank"
              rel="noopener noreferrer"
              className={`absolute bottom-4 right-4 backdrop-blur-md px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg cursor-pointer ${isLight ? 'bg-white/90 hover:bg-rose-600 text-slate-800 hover:text-white border-slate-200 hover:border-rose-500' : 'bg-slate-950/90 hover:bg-rose-600 text-white border-slate-800 hover:border-rose-500'}`}
            >
              <span>ดูเส้นทางบน Google Maps</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>

        </div>

        {/* Footer copyrights */}
        <div className={`mt-20 pt-8 border-t flex flex-col sm:flex-row items-center justify-center text-xs font-light gap-4 ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
          <div className="flex gap-6">
            <a href="#services" className={`transition-colors ${isLight ? 'hover:text-slate-900 text-slate-500' : 'hover:text-slate-300 text-slate-400'}`}>บริการทางการแพทย์</a>
            <a href="#about" className={`transition-colors ${isLight ? 'hover:text-slate-900 text-slate-500' : 'hover:text-slate-300 text-slate-400'}`}>นโยบายความปลอดภัย</a>
            <a href="#portfolio" className={`transition-colors ${isLight ? 'hover:text-slate-900 text-slate-500' : 'hover:text-slate-300 text-slate-400'}`}>บันทึกภารกิจกู้ชีพ</a>
          </div>
        </div>

      </div>
    </section>
  );
}
