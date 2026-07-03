import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { CompanyConfig, Service, Work, CustomPage, TeamMember, GalleryItem } from './types';
import { logoutAdmin, deleteCustomPage } from './dbService';
import { DEFAULT_COMPANY, DEFAULT_SERVICES, DEFAULT_WORKS, DEFAULT_TEAM, DEFAULT_GALLERY } from './data';
import { onSnapshot, doc, collection, setDoc, getDoc, getDocs } from 'firebase/firestore';

// Modular UI Components
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import ServicesList from './components/ServicesList';
import PortfolioGrid from './components/PortfolioGrid';
import ContactSection from './components/ContactSection';
import TeamSection from './components/TeamSection';
import AdminPanel from './components/AdminPanel';
import CustomPageView from './components/CustomPageView';
import PasscodeModal from './components/PasscodeModal';
import GalleryPage from './components/GalleryPage';

import { Loader2, HeartPulse, ShieldAlert, CheckCircle2, PlusCircle, Trash2, Edit3, Settings, LogOut, FileText, AlertTriangle, ArrowLeft, Phone, ArrowUp } from 'lucide-react';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [cmsMode, setCmsMode] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadingLogoError, setLoadingLogoError] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // States to jump straight to exact CMS Tab and highlight a specific input
  const [cmsActiveTab, setCmsActiveTab] = useState<'company' | 'services' | 'works' | 'passcode' | 'customPages' | 'team' | 'gallery'>('company');
  const [cmsFocusField, setCmsFocusField] = useState<string | null>(null);

  // Dynamic Content States
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>(DEFAULT_COMPANY);
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [works, setWorks] = useState<Work[]>(DEFAULT_WORKS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEFAULT_TEAM);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(DEFAULT_GALLERY);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [activePageSlug, setActivePageSlug] = useState<string>('home');

  // Quick delete page state
  const [deletePageConfirm, setDeletePageConfirm] = useState<{
    isOpen: boolean;
    pageId: string;
    pageTitle: string;
  }>({
    isOpen: false,
    pageId: '',
    pageTitle: ''
  });

  // Helper to jump directly from visual section into precise Admin Panel field
  const handleDirectEdit = (tab: 'company' | 'services' | 'works' | 'passcode' | 'customPages' | 'team' | 'gallery', fieldId?: string) => {
    setCmsActiveTab(tab);
    setCmsFocusField(fieldId || null);
    setCmsMode(true);
  };

  // Helper to execute quick page deletion
  const executeQuickDeletePage = async () => {
    if (!deletePageConfirm.pageId) return;
    try {
      await deleteCustomPage(deletePageConfirm.pageId);
      setDeletePageConfirm({ isOpen: false, pageId: '', pageTitle: '' });
      setActivePageSlug('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Failed to delete custom page:", error);
    }
  };

  // Auto-seed database with default content if collections are empty
  const triggerAutoSeeding = async () => {
    try {
      const configSnap = await getDoc(doc(db, 'config', 'company'));
      if (!configSnap.exists()) {
        await setDoc(doc(db, 'config', 'company'), DEFAULT_COMPANY);
      } else {
        const currentData = configSnap.data();
        if (currentData.servicesDescColor === '#ffffff') {
          await setDoc(doc(db, 'config', 'company'), {
            ...currentData,
            servicesDescColor: '#fca5a5'
          });
        }
      }
    } catch (e) {
      console.error("Admin auto-seed company config failed:", e);
    }

    try {
      const servicesSnap = await getDocs(collection(db, 'services'));
      if (servicesSnap.empty) {
        for (const s of DEFAULT_SERVICES) {
          await setDoc(doc(db, 'services', s.id), {
            title: s.title,
            description: s.description,
            iconName: s.iconName,
            order: s.order
          });
        }
      }
    } catch (e) {
      console.error("Admin auto-seed services failed:", e);
    }

    try {
      const worksSnap = await getDocs(collection(db, 'works'));
      if (worksSnap.empty) {
        for (const w of DEFAULT_WORKS) {
          await setDoc(doc(db, 'works', w.id), {
            title: w.title,
            description: w.description,
            date: w.date,
            category: w.category,
            location: w.location,
            imageUrl: w.imageUrl,
            imageUrls: [w.imageUrl],
            createdAt: w.createdAt
          });
        }
      }
    } catch (e) {
      console.error("Admin auto-seed works failed:", e);
    }

    try {
      const teamSnap = await getDocs(collection(db, 'team'));
      if (teamSnap.empty) {
        for (const m of DEFAULT_TEAM) {
          await setDoc(doc(db, 'team', m.id), {
            name: m.name,
            role: m.role,
            description: m.description || '',
            imageUrl: m.imageUrl || '',
            order: m.order
          });
        }
      }
    } catch (e) {
      console.error("Admin auto-seed team failed:", e);
    }

    try {
      const gallerySnap = await getDocs(collection(db, 'gallery'));
      if (gallerySnap.empty) {
        for (const g of DEFAULT_GALLERY) {
          await setDoc(doc(db, 'gallery', g.id), {
            url: g.url,
            title: g.title,
            category: g.category,
            description: g.description || '',
            date: g.date || '',
            location: g.location || '',
            order: g.order
          });
        }
      }
    } catch (e) {
      console.error("Admin auto-seed gallery failed:", e);
    }
  };

  // Monitor Admin sessions locally and auto-seed if active
  useEffect(() => {
    const isSessionAdmin = localStorage.getItem('isAdminSession') === 'true';
    if (isSessionAdmin) {
      setIsAdmin(true);
      triggerAutoSeeding();
    } else {
      setIsAdmin(false);
      setCmsMode(false);
    }
  }, []);

  // Real-time synchronization and auto-seeding with Firestore
  useEffect(() => {
    let configLoaded = false;
    let servicesLoaded = false;
    let worksLoaded = false;
    let customPagesLoaded = false;
    let teamLoaded = false;
    let galleryLoaded = false;

    const checkLoadingDone = () => {
      if (configLoaded && servicesLoaded && worksLoaded && customPagesLoaded && teamLoaded && galleryLoaded) {
        setPageLoading(false);
      }
    };

    // 1. Listen to Company Config
    const unsubConfig = onSnapshot(doc(db, 'config', 'company'), (snap) => {
      if (snap.exists()) {
        setCompanyConfig(snap.data() as CompanyConfig);
      } else {
        setCompanyConfig(DEFAULT_COMPANY);
      }
      configLoaded = true;
      checkLoadingDone();
    }, (error) => {
      console.error("Real-time config sync error:", error);
      configLoaded = true;
      checkLoadingDone();
    });

    // 2. Listen to Services
    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      if (snap.empty) {
        setServices(DEFAULT_SERVICES);
      } else {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Service));
        setServices(list.sort((a, b) => a.order - b.order));
      }
      servicesLoaded = true;
      checkLoadingDone();
    }, (error) => {
      console.error("Real-time services sync error:", error);
      servicesLoaded = true;
      checkLoadingDone();
    });

    // 3. Listen to Works
    const unsubWorks = onSnapshot(collection(db, 'works'), (snap) => {
      if (snap.empty) {
        setWorks(DEFAULT_WORKS);
      } else {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Work));
        setWorks(list.sort((a, b) => b.date.localeCompare(a.date)));
      }
      worksLoaded = true;
      checkLoadingDone();
    }, (error) => {
      console.error("Real-time works sync error:", error);
      worksLoaded = true;
      checkLoadingDone();
    });

    // 4. Listen to Custom Pages
    const unsubCustomPages = onSnapshot(collection(db, 'customPages'), (snap) => {
      if (snap.empty) {
        setCustomPages([]);
      } else {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomPage));
        setCustomPages(list.sort((a, b) => a.order - b.order));
      }
      customPagesLoaded = true;
      checkLoadingDone();
    }, (error) => {
      console.error("Real-time custom pages sync error:", error);
      customPagesLoaded = true;
      checkLoadingDone();
    });

    // 5. Listen to Team Members
    const unsubTeam = onSnapshot(collection(db, 'team'), (snap) => {
      if (snap.empty) {
        setTeamMembers(DEFAULT_TEAM);
      } else {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as TeamMember));
        setTeamMembers(list.sort((a, b) => a.order - b.order));
      }
      teamLoaded = true;
      checkLoadingDone();
    }, (error) => {
      console.error("Real-time team sync error:", error);
      teamLoaded = true;
      checkLoadingDone();
    });

    // 6. Listen to Gallery
    const unsubGallery = onSnapshot(collection(db, 'gallery'), (snap) => {
      if (snap.empty) {
        setGalleryItems(DEFAULT_GALLERY);
      } else {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem));
        setGalleryItems(list.sort((a, b) => a.order - b.order));
      }
      galleryLoaded = true;
      checkLoadingDone();
    }, (error) => {
      console.error("Real-time gallery sync error:", error);
      galleryLoaded = true;
      checkLoadingDone();
    });

    return () => {
      unsubConfig();
      unsubServices();
      unsubWorks();
      unsubCustomPages();
      unsubTeam();
      unsubGallery();
    };
  }, []);

  // Dummy fetch function for backward compatibility with CMS AdminPanel prop
  const fetchCMSContent = async () => {
    console.log("Real-time synchronization active. Webpage is fully updated.");
  };

  // Scroll event listener to handle scroll-to-top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Admin Passcode Login Success
  const handleLoginSuccess = () => {
    localStorage.setItem('isAdminSession', 'true');
    setIsAdmin(true);
    setShowPasscodeModal(false);
    setCmsMode(true); // Jump straight to CMS management dashboard
    triggerAutoSeeding();
  };

  // Handle Admin Sign Out
  const handleLogout = async () => {
    try {
      localStorage.removeItem('isAdminSession');
      await logoutAdmin();
      setIsAdmin(false);
      setCmsMode(false);
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  // Scroll to contacts
  const scrollToContact = () => {
    setCmsMode(false);
    setTimeout(() => {
      const element = document.getElementById('contact');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-6 font-sans">
        <div className="relative">
          <div className="absolute inset-0 bg-rose-500/10 rounded-full blur-2xl scale-150 animate-pulse" />
          {!loadingLogoError ? (
            <img 
              src="https://cdn.phototourl.com/free/2026-07-01-c4c98c60-2b0b-45bd-a2cc-b8a668bc7a91.jpg" 
              alt="Inter Care Ambulance Logo" 
              className="h-16 sm:h-20 w-auto object-contain relative z-10 rounded-2xl bg-white p-3 shadow-2xl transition-all duration-300"
              referrerPolicy="no-referrer"
              onError={() => setLoadingLogoError(true)}
            />
          ) : (
            <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-rose-500 to-red-600 rounded-3xl flex items-center justify-center text-white shadow-2xl border-2 border-white/10 animate-bounce">
              <span className="text-4xl font-extrabold font-sans">+</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
          <span>กำลังโหลดฐานข้อมูลและวิทยุประสานพยาบาล...</span>
        </div>
      </div>
    );
  }

  const currentViewingPage = customPages.find(p => p.slug === activePageSlug);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 antialiased selection:bg-rose-500 selection:text-white">
      
      {/* Sticky Top Header */}
      <Header 
        isAdmin={isAdmin}
        onAdminClick={() => setShowPasscodeModal(true)}
        onLogout={handleLogout}
        emergencyPhone={companyConfig.emergencyPhone}
        cmsMode={cmsMode}
        setCmsMode={setCmsMode}
        customPages={customPages}
        activePageSlug={activePageSlug}
        setActivePageSlug={setActivePageSlug}
      />

      {/* Admin Information Bar */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white text-xs py-3 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl border-b border-blue-500/30 z-50 relative">
          <div className="flex flex-wrap items-center gap-2 font-sans">
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] animate-pulse">
              ADMIN CONTROL
            </div>
            <span className="text-slate-200 text-[11px] sm:text-xs">
              ระบบหลังบ้านจัดการข้อมูลและเนื้อหาเว็บไซต์แบบเรียลไทม์
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* CMS Panel toggle */}
            <button 
              onClick={() => {
                setCmsMode(!cmsMode);
                setCmsFocusField(null);
              }}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition-all cursor-pointer text-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{cmsMode ? "← สลับดูหน้าเว็บจริง" : "เข้าสู่หลังบ้านหลัก (CMS) →"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Main Body Content */}
      <main className="transition-all duration-300">
        {cmsMode ? (
          /* Headless CMS Management Dashboard */
          <AdminPanel 
            initialConfig={companyConfig}
            initialServices={services}
            initialWorks={works}
            customPages={customPages}
            initialTeam={teamMembers}
            initialGallery={galleryItems}
            onRefreshData={fetchCMSContent}
            initialActiveTab={cmsActiveTab}
            focusField={cmsFocusField || undefined}
            onClearFocusField={() => setCmsFocusField(null)}
            onNavigateToPage={(slug) => {
              setCmsMode(false);
              setActivePageSlug(slug);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : activePageSlug === 'gallery' ? (
          /* Dedicated Photo Gallery Page */
          <GalleryPage 
            works={works} 
            galleryItems={galleryItems}
            config={companyConfig} 
            onBackToHome={() => {
              setActivePageSlug('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        ) : activePageSlug === 'team' ? (
          /* Dedicated Members / Team Page */
          <div className="py-12 bg-slate-900 min-h-[calc(100vh-80px)] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Navigation Breadcrumb & Back button */}
              <div className="flex items-center justify-between mb-2">
                <button 
                  onClick={() => {
                    setActivePageSlug('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-colors cursor-pointer bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-700"
                >
                  <ArrowLeft className="w-4 h-4 text-blue-400" />
                  <span>กลับสู่หน้าหลัก</span>
                </button>
                
                <div className="text-xs text-slate-500 font-mono hidden sm:block">
                  HOME &bull; MEDICAL TEAM
                </div>
              </div>
            </div>
            
            <TeamSection 
              members={teamMembers}
              config={companyConfig}
              isAdmin={isAdmin}
              onDirectEdit={handleDirectEdit}
            />
          </div>
        ) : activePageSlug !== 'home' ? (
          /* Custom Dynamic Page Viewer */
          (() => {
            const selectedPage = customPages.find(p => p.slug === activePageSlug);
            return selectedPage ? (
              <CustomPageView 
                page={selectedPage} 
                isAdmin={isAdmin} 
                onBackToHome={() => setActivePageSlug('home')} 
                onDirectEdit={(tab, fieldId) => {
                  setCmsMode(true);
                  setCmsActiveTab('customPages'); // Switch to custom pages tab
                  setCmsFocusField(fieldId || null);
                }}
              />
            ) : (
              <div className="py-24 text-center max-w-md mx-auto">
                <p className="text-slate-500">ไม่พบหน้าที่คุณกำลังค้นหา</p>
                <button 
                  onClick={() => setActivePageSlug('home')} 
                  className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold cursor-pointer"
                >
                  กลับไปหน้าหลัก
                </button>
              </div>
            );
          })()
        ) : (
          /* High-Fidelity Public Website Frontend */
          <>
            <Hero 
              config={companyConfig} 
              onContactClick={scrollToContact} 
              isAdmin={isAdmin}
              onDirectEdit={handleDirectEdit}
            />
            
            <ServicesList 
              services={services} 
              config={companyConfig}
              onContactClick={scrollToContact} 
              isAdmin={isAdmin}
              onDirectEdit={handleDirectEdit}
            />
            
            <About 
              config={companyConfig} 
              members={teamMembers}
              isAdmin={isAdmin}
              onDirectEdit={handleDirectEdit}
            />
            
            <PortfolioGrid 
              works={works} 
              config={companyConfig}
              isAdmin={isAdmin}
              onDirectEdit={handleDirectEdit}
            />
            
            <ContactSection 
              config={companyConfig} 
              isAdmin={isAdmin}
              onDirectEdit={handleDirectEdit}
            />
          </>
        )}
      </main>

      {/* Admin Login Modal (Triggered by Lock Icon) */}
      {showPasscodeModal && (
        <PasscodeModal 
          onClose={() => setShowPasscodeModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}

      {/* Custom Confirmation Modal for Quick Deleting Custom Pages */}
      {deletePageConfirm.isOpen && (
        <div className="fixed inset-0 z-[110] overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-4 text-white">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-400">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <h3 className="font-bold text-sm sm:text-base">
                ยืนยันการลบหน้าเว็บ
              </h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              คุณแน่ใจหรือไม่ที่จะลบหน้า <span className="text-amber-400 font-extrabold font-sans">"{deletePageConfirm.pageTitle}"</span> ออกจากระบบอย่างถาวร? ลิงก์และข้อมูลทั้งหมดของหน้านี้จะสูญหายทันทีและไม่สามารถกู้คืนได้
            </p>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletePageConfirm({ isOpen: false, pageId: '', pageTitle: '' })}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={executeQuickDeletePage}
                className="px-4 py-2 text-xs font-bold text-white rounded-xl cursor-pointer transition-all shadow bg-rose-600 hover:bg-rose-700 active:bg-rose-800"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {!cmsMode && showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-40 p-3 sm:p-3.5 bg-white/95 hover:bg-white text-slate-800 hover:text-rose-600 border border-slate-200/80 hover:border-slate-300/85 shadow-2xl hover:shadow-rose-600/10 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center group"
          id="scroll-to-top-button"
          aria-label="Scroll to top"
          title="เลื่อนกลับขึ้นบนสุด"
        >
          <ArrowUp className="w-5 h-5 sm:w-5 sm:h-5 group-hover:-translate-y-0.5 transition-transform duration-300" />
        </button>
      )}

      {/* Floating Call Button */}
      {!cmsMode && companyConfig && companyConfig.emergencyPhone && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-none">
          {/* Subtle Help Label */}
          <div className="bg-slate-950/90 text-white border border-slate-800/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold tracking-wide shadow-xl flex items-center gap-1.5 pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>โทรด่วนบริการพยาบาล 24 ชม.</span>
          </div>
          
          <a
            href={`tel:${companyConfig.emergencyPhone}`}
            className="pointer-events-auto group relative flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-sm sm:text-base px-5 sm:px-6 py-3.5 sm:py-4 rounded-full shadow-2xl shadow-rose-600/35 hover:shadow-rose-600/55 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            id="floating-call-button"
          >
            {/* Outer pulsating glow rings for vital emergency feel */}
            <span className="absolute -inset-1 rounded-full bg-rose-500/35 blur-sm group-hover:bg-rose-500/50 animate-ping -z-10" style={{ animationDuration: '2s' }} />
            <span className="absolute -inset-2 rounded-full bg-rose-500/15 blur-md group-hover:bg-rose-500/25 animate-pulse -z-10" />
            
            <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-sans font-black tracking-wider text-base sm:text-lg">{companyConfig.emergencyPhone}</span>
          </a>
        </div>
      )}

    </div>
  );
}
