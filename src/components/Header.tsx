import { useState } from 'react';
import { ShieldAlert, Lock, LogOut, Phone, Settings, Menu, X, ArrowLeft } from 'lucide-react';
import { CustomPage } from '../types';

interface HeaderProps {
  isAdmin: boolean;
  onAdminClick: () => void;
  onLogout: () => void;
  emergencyPhone: string;
  cmsMode: boolean;
  setCmsMode: (val: boolean) => void;
  customPages: CustomPage[];
  activePageSlug: string;
  setActivePageSlug: (slug: string) => void;
}

export default function Header({ 
  isAdmin, 
  onAdminClick, 
  onLogout, 
  emergencyPhone, 
  cmsMode, 
  setCmsMode,
  customPages = [],
  activePageSlug = 'home',
  setActivePageSlug
}: HeaderProps) {
  const [logoError, setLogoError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleScroll = (id: string) => {
    setCmsMode(false); // Back to frontend if they click sections
    setActivePageSlug('home');
    setMobileMenuOpen(false); // Close mobile menu
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 180);
  };


  return (
    <header className="sticky top-0 z-50 w-full bg-blue-950/80 backdrop-blur-md border-b border-blue-900/40 shadow-sm">
      {/* Ambulance Emergency Status Bar */}
      <div className="bg-slate-900 text-white text-[10px] sm:text-xs py-1.5 px-4 overflow-hidden relative border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2">
            {/* Pulsing strobe indicators (Blue and Red) */}
            <div className="flex gap-1 items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse inline-block shadow-[0_0_8px_rgba(59,130,246,1)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse inline-block shadow-[0_0_8px_rgba(244,63,94,1)]" />
            </div>
            <span className="font-semibold text-slate-200">
              ศูนย์วิทยุกู้ชีพและประสานงานรถพยาบาลฉุกเฉินตลอด 24 ชั่วโมง
            </span>
          </div>
          <div className="hidden xs:flex items-center gap-3 text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-emerald-400 font-bold">สแตนด์บายพร้อมปฎิบัติการ</span>
            </span>
            <span className="text-slate-600">|</span>
            <span>มาตรฐาน สธ. (กระทรวงสาธารณสุข)</span>
          </div>
        </div>
        {/* Subtle glowing animated backdrop lines for high-tech feeling */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-rose-600/10 to-blue-600/10 mix-blend-overlay opacity-80" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div 
          onClick={() => {
            setCmsMode(false);
            setActivePageSlug('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center cursor-pointer group flex-shrink-0"
        >
          {!logoError ? (
            <img 
              src="https://cdn.phototourl.com/free/2026-07-01-c4c98c60-2b0b-45bd-a2cc-b8a668bc7a91.jpg" 
              alt="Inter Care Ambulance Logo" 
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02] rounded-lg border border-blue-900/20"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-rose-100 transition-transform group-hover:scale-105">
                <span className="font-bold text-lg sm:text-xl leading-none font-sans">+</span>
              </div>
              <div>
                <h1 className="font-sans font-bold text-sm sm:text-base text-white tracking-tight leading-none">
                  INTER CARE
                </h1>
                <span className="font-mono text-[9px] sm:text-[10px] text-rose-500 font-bold tracking-wider uppercase">
                  AMBULANCE
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-blue-100/85">
          <button 
            onClick={() => {
              setCmsMode(false);
              setActivePageSlug('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`hover:text-white transition-all cursor-pointer pb-1 ${
              activePageSlug === 'home' ? 'text-white font-extrabold border-b-2 border-rose-500' : ''
            }`}
          >
            หน้าหลัก
          </button>
          <button 
            onClick={() => handleScroll('services')} 
            className="hover:text-white transition-all cursor-pointer pb-1"
          >
            บริการของเรา
          </button>
          <button 
            onClick={() => handleScroll('about')} 
            className="hover:text-white transition-all cursor-pointer pb-1"
          >
            เกี่ยวกับเรา
          </button>
          <button 
            onClick={() => {
              setCmsMode(false);
              setActivePageSlug('team');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            className={`hover:text-white transition-all cursor-pointer pb-1 ${
              activePageSlug === 'team' ? 'text-white font-extrabold border-b-2 border-rose-500' : ''
            }`}
          >
            สมาชิก บุคลากร
          </button>
          <button 
            onClick={() => handleScroll('portfolio')} 
            className="hover:text-white transition-all cursor-pointer pb-1"
          >
            ผลงาน/กิจกรรม
          </button>
          <button 
            onClick={() => {
              setCmsMode(false);
              setActivePageSlug('gallery');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`hover:text-white transition-all cursor-pointer pb-1 ${
              activePageSlug === 'gallery' ? 'text-white font-extrabold border-b-2 border-rose-500' : ''
            }`}
          >
            คลังภาพ
          </button>
          <button 
            onClick={() => handleScroll('contact')} 
            className="hover:text-white transition-all cursor-pointer pb-1"
          >
            ติดต่อเรา
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin CMS Button (Desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCmsMode(!cmsMode)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    cmsMode 
                      ? 'bg-blue-900/60 border-blue-700 text-blue-200' 
                      : 'bg-blue-900/30 border-blue-800 text-blue-100 hover:bg-blue-900/50'
                  }`}
                >
                  <Settings className={`w-3.5 h-3.5 ${cmsMode ? 'animate-spin' : ''}`} />
                  {cmsMode ? "ดูหน้าร้าน" : "จัดการหลังบ้าน"}
                </button>
                <button
                  onClick={onLogout}
                  title="ออกจากระบบแอดมิน"
                  className="p-2 text-blue-300 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onAdminClick}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-100 hover:text-white bg-blue-900/35 hover:bg-blue-900/55 border border-blue-800/80 rounded-lg transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-blue-300" />
                ระบบ CMS
              </button>
            )}
          </div>

          {/* Emergency Hotline Button */}
          <a
            href={`tel:${emergencyPhone}`}
            className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-[11px] sm:text-xs md:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-rose-950/20 transition-all hover:shadow-xl hover:shadow-rose-900/30 active:scale-95"
          >
            <Phone className="w-3.5 h-3.5 animate-bounce" />
            <span className="hidden xs:inline sm:inline">โทรฉุกเฉิน</span> {emergencyPhone}
          </a>

          {/* Hamburger Menu (Mobile/Tablet) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-blue-200 hover:text-white hover:bg-blue-900/40 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-950/95 backdrop-blur-md border-b border-blue-900/60 shadow-xl animate-fade-in absolute w-full left-0 z-40">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <button
              onClick={() => {
                setCmsMode(false);
                setActivePageSlug('home');
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`block w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activePageSlug === 'home' ? 'text-blue-400 bg-blue-900/40' : 'text-blue-100 hover:text-white hover:bg-blue-900/20'
              }`}
            >
              หน้าหลัก
            </button>
            <button
              onClick={() => handleScroll('services')}
              className="block w-full text-left px-3 py-2.5 rounded-xl text-blue-100 hover:text-white hover:bg-blue-900/20 text-sm font-semibold transition-colors"
            >
              บริการของเรา
            </button>
            <button
              onClick={() => handleScroll('about')}
              className="block w-full text-left px-3 py-2.5 rounded-xl text-blue-100 hover:text-white hover:bg-blue-900/20 text-sm font-semibold transition-colors"
            >
              เกี่ยวกับเรา
            </button>
            <button
              onClick={() => {
                setCmsMode(false);
                setActivePageSlug('team');
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`block w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activePageSlug === 'team' ? 'text-blue-400 bg-blue-900/40' : 'text-blue-100 hover:text-white hover:bg-blue-900/20'
              }`}
            >
              สมาชิก บุคลากร
            </button>
            <button
              onClick={() => handleScroll('portfolio')}
              className="block w-full text-left px-3 py-2.5 rounded-xl text-blue-100 hover:text-white hover:bg-blue-900/20 text-sm font-semibold transition-colors"
            >
              ผลงาน/กิจกรรม
            </button>
            <button
              onClick={() => {
                setCmsMode(false);
                setActivePageSlug('gallery');
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`block w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activePageSlug === 'gallery' ? 'text-blue-400 bg-blue-900/40' : 'text-blue-100 hover:text-white hover:bg-blue-900/20'
              }`}
            >
              คลังภาพ
            </button>
            <button
              onClick={() => handleScroll('contact')}
              className="block w-full text-left px-3 py-2.5 rounded-xl text-blue-100 hover:text-white hover:bg-blue-900/20 text-sm font-semibold transition-colors"
            >
              ติดต่อเรา
            </button>

            {/* Mobile Actions */}
            <div className="pt-4 border-t border-blue-900/60 space-y-2">
              {isAdmin ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setCmsMode(!cmsMode);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-900/40 text-blue-200 border border-blue-800/80"
                  >
                    <Settings className="w-4 h-4" />
                    {cmsMode ? "ดูหน้าร้าน" : "จัดการหลังบ้าน"}
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-rose-950/50 text-rose-200 border border-rose-900/60"
                  >
                    <LogOut className="w-4 h-4" />
                    ออกจากระบบแอดมิน
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onAdminClick();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-900/30 text-blue-100 border border-blue-800/60"
                >
                  <Lock className="w-4 h-4 text-blue-300" />
                  ระบบ CMS สำหรับเจ้าหน้าที่
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
