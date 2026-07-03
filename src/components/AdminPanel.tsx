import React, { useState, useEffect } from 'react';
import { CompanyConfig, Service, Work, CustomPage, TeamMember, GalleryItem } from '../types';
import { 
  updateCompanyConfig, 
  saveService, 
  deleteService, 
  saveWork, 
  deleteWork,
  updateAdminPasscode,
  authenticateAdmin,
  saveCustomPage,
  deleteCustomPage,
  saveTeamMember,
  deleteTeamMember,
  saveGalleryItem,
  deleteGalleryItem,
  getMfaSettings,
  updateMfaSettings
} from '../dbService';
import { 
  Save, Plus, Edit, Trash2, LayoutDashboard, Database, Info, HelpCircle, 
  Activity, CheckCircle2, AlertCircle, RefreshCw, X, Calendar, MapPin, ListCollapse, Key, FileText, Globe, Users, UserPlus, Image as ImageIcon, ImagePlus,
  Smartphone, ShieldCheck, QrCode, Clipboard, Check, ShieldAlert
} from 'lucide-react';
import { generateRandomBase32Secret, getTOTPProvisioningUri, verifyTOTP } from '../utils/totp';
import { DynamicIcon, POPULAR_ICONS } from './DynamicIcon';
import { ImageUploader } from './ImageUploader';

interface AdminPanelProps {
  initialConfig: CompanyConfig;
  initialServices: Service[];
  initialWorks: Work[];
  customPages?: CustomPage[];
  initialTeam?: TeamMember[];
  initialGallery?: GalleryItem[];
  onRefreshData: () => Promise<void>;
  initialActiveTab?: 'company' | 'services' | 'works' | 'passcode' | 'customPages' | 'team' | 'gallery';
  focusField?: string;
  onClearFocusField?: () => void;
  onNavigateToPage?: (slug: string) => void;
}

export default function AdminPanel({ 
  initialConfig, 
  initialServices, 
  initialWorks, 
  customPages = [],
  initialTeam = [],
  initialGallery = [],
  onRefreshData,
  initialActiveTab,
  focusField,
  onClearFocusField,
  onNavigateToPage
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'company' | 'services' | 'works' | 'passcode' | 'customPages' | 'team' | 'gallery'>('company');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newPasscode, setNewPasscode] = useState('');
  const [currentPasscode, setCurrentPasscode] = useState('');

  // MFA states
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaSetupStep, setMfaSetupStep] = useState(false);
  const [mfaSetupSecret, setMfaSetupSecret] = useState('');
  const [mfaCodeInput, setMfaCodeInput] = useState('');
  const [mfaConfirmError, setMfaConfirmError] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [disablePasscode, setDisablePasscode] = useState('');
  const [disableMfaCode, setDisableMfaCode] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);

  // Beautiful Custom Confirmation Dialog State (solving window.confirm issue in iframe/mobile)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void | Promise<void>;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'ตกลง',
    cancelText: 'ยกเลิก',
    onConfirm: () => {},
    isDanger: true,
  });

  // Form State: Custom Page
  const [customPageForm, setCustomPageForm] = useState<Omit<CustomPage, 'id'> & { id?: string }>({
    title: '',
    tagline: '',
    content: '',
    order: 0,
    bgType: 'color',
    bgVal: '#ffffff',
    textColor: '#1e293b',
    imageUrl: '',
    layout: 'text-only',
    inMenu: true,
    slug: '',
    createdAt: ''
  });
  const [editingCustomPageId, setEditingCustomPageId] = useState<string | null>(null);
  const [showCustomPageModal, setShowCustomPageModal] = useState(false);

  // Form State: Team Member
  const [teamForm, setTeamForm] = useState<Omit<TeamMember, 'id'> & { id?: string }>({
    name: '',
    role: '',
    description: '',
    imageUrl: '',
    order: 1
  });
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // Form State: Gallery Item
  const [galleryForm, setGalleryForm] = useState<Omit<GalleryItem, 'id'> & { id?: string }>({
    url: '',
    title: '',
    category: 'รถพยาบาล',
    description: '',
    date: '',
    location: '',
    order: 1
  });
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Sync tab state from prop
  useEffect(() => {
    if (initialActiveTab) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab]);

  // Load MFA settings on mount and when changing to passcode tab
  useEffect(() => {
    async function loadMfa() {
      try {
        const settings = await getMfaSettings();
        setMfaEnabled(settings.mfaEnabled);
        setMfaSecret(settings.mfaSecret);
      } catch (err) {
        console.error("Error loading MFA settings:", err);
      }
    }
    loadMfa();
  }, [activeTab]);

  // Handle direct scrolling and highlighting of fields
  useEffect(() => {
    if (focusField) {
      // Consume/clear the focusField prop right away so the parent clears its state
      if (onClearFocusField) {
        onClearFocusField();
      }

      if (focusField === 'page-create') {
        setActiveTab('customPages');
        // Delay slightly to let states settle
        setTimeout(() => {
          setCustomPageForm({
            title: '',
            tagline: '',
            content: '',
            order: customPages.length > 0 ? Math.max(...customPages.map(p => p.order || 0)) + 1 : 1,
            bgType: 'color',
            bgVal: '#ffffff',
            textColor: '#1e293b',
            imageUrl: '',
            layout: 'text-only',
            inMenu: true,
            slug: '',
            createdAt: new Date().toISOString()
          });
          setEditingCustomPageId(null);
          setShowCustomPageModal(true);
        }, 200);
        return;
      }

      if (focusField.startsWith('page-edit-')) {
        const pageId = focusField.replace('page-edit-', '');
        const targetPage = customPages.find(p => p.id === pageId);
        if (targetPage) {
          setActiveTab('customPages');
          // Delay slightly to let states settle
          setTimeout(() => {
            startEditCustomPage(targetPage);
          }, 200);
        }
        return;
      }

      if (focusField === 'team') {
        setActiveTab('team');
        return;
      }

      if (focusField.startsWith('member-edit-')) {
        const memberId = focusField.replace('member-edit-', '');
        const targetMember = initialTeam.find(m => m.id === memberId);
        if (targetMember) {
          setActiveTab('team');
          setTimeout(() => {
            startEditTeamMember(targetMember);
          }, 200);
        }
        return;
      }

      const timer = setTimeout(() => {
        const element = document.getElementById(focusField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
          
          // Visual highlight pulse
          element.classList.add('ring-4', 'ring-rose-500', 'border-rose-500', 'scale-[1.01]');
          const clearHighlight = setTimeout(() => {
            element.classList.remove('ring-4', 'ring-rose-500', 'border-rose-500', 'scale-[1.01]');
          }, 3000);
          
          return () => clearTimeout(clearHighlight);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [focusField, activeTab]);

  // Form State: Company Config
  const [companyForm, setCompanyForm] = useState<CompanyConfig>({ ...initialConfig });

  // Form State: Service
  const [serviceForm, setServiceForm] = useState<Omit<Service, 'id'> & { id?: string }>({
    title: '',
    description: '',
    iconName: 'Activity',
    order: 1
  });
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Form State: Work
  const [workForm, setWorkForm] = useState<Omit<Work, 'id'> & { id?: string }>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Event Standby',
    location: '',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'],
    createdAt: ''
  });
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [showCustomCategoryText, setShowCustomCategoryText] = useState(false);

  // Sync state if initial props change
  useEffect(() => {
    setCompanyForm({ ...initialConfig });
  }, [initialConfig]);

  // Set timeout for status messages
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Save general company config
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCompanyConfig(companyForm);
      await onRefreshData();
      showMessage('success', 'บันทึกข้อมูลติดต่อสำนักงานใหญ่และหน้าหลักสำเร็จแล้ว!');
    } catch (error) {
      console.error(error);
      showMessage('error', 'ล้มเหลวในการบันทึกข้อมูล: สิทธิ์ไม่เพียงพอหรือขาดการล็อกอิน');
    } finally {
      setLoading(false);
    }
  };

  // Save Service (Create / Edit)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveService({
        id: editingServiceId || undefined,
        title: serviceForm.title,
        description: serviceForm.description,
        iconName: serviceForm.iconName,
        order: Number(serviceForm.order)
      });
      await onRefreshData();
      setShowServiceModal(false);
      // Reset form
      setServiceForm({ title: '', description: '', iconName: 'Activity', order: 1 });
      setEditingServiceId(null);
      showMessage('success', 'บันทึกบริการทางการแพทย์สำเร็จแล้ว!');
    } catch (error) {
      console.error(error);
      showMessage('error', 'ไม่สามารถบันทึกข้อมูลบริการได้ สิทธิ์ในการเขียนถูกจำกัด');
    } finally {
      setLoading(false);
    }
  };

  // Edit Service Trigger
  const startEditService = (service: Service) => {
    setServiceForm({
      title: service.title,
      description: service.description,
      iconName: service.iconName,
      order: service.order
    });
    setEditingServiceId(service.id);
    setShowServiceModal(true);
  };

  // Delete Service Trigger
  const handleDeleteService = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบบริการ',
      message: 'คุณแน่ใจหรือไม่ที่จะลบรายชื่อบริการนี้ออกจากระบบ? ข้อมูลบริการนี้จะถูกทำลายอย่างถาวร',
      confirmText: 'ลบบริการ',
      cancelText: 'ยกเลิก',
      isDanger: true,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setLoading(true);
        try {
          await deleteService(id);
          await onRefreshData();
          showMessage('success', 'ลบรายการบริการทางการแพทย์เสร็จสิ้น');
        } catch (error) {
          console.error(error);
          showMessage('error', 'ล้มเหลวในการลบรายการบริการ');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Save Work (Create / Edit)
  const handleSaveWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validUrls = (workForm.imageUrls || []).map(url => url.trim()).filter(url => url !== '');
      const finalImageUrls = validUrls.length > 0 ? validUrls : [workForm.imageUrl];
      const primaryUrl = finalImageUrls[0] || workForm.imageUrl;

      const finalCategory = workForm.category === 'ระบุเอง / หัวข้อแยกใหม่...' 
        ? (customCategoryInput.trim() || 'การทำภารกิจ') 
        : workForm.category;

      await saveWork({
        id: editingWorkId || undefined,
        title: workForm.title,
        description: workForm.description,
        date: workForm.date,
        category: finalCategory,
        location: workForm.location,
        imageUrl: primaryUrl,
        imageUrls: finalImageUrls,
        createdAt: workForm.createdAt || new Date().toISOString()
      });
      await onRefreshData();
      setShowWorkModal(false);
      // Reset Form
      setWorkForm({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Event Standby',
        location: '',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
        imageUrls: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'],
        createdAt: ''
      });
      setCustomCategoryInput('');
      setShowCustomCategoryText(false);
      setEditingWorkId(null);
      showMessage('success', 'อัปโหลดบันทึกปฏิบัติภารกิจเสร็จสมบูรณ์!');
    } catch (error) {
      console.error(error);
      showMessage('error', 'บันทึกภารกิจล้มเหลวเนื่องจากขาดการยืนยันตัวตนแอดมิน');
    } finally {
      setLoading(false);
    }
  };

  // Edit Work Trigger
  const startEditWork = (work: Work) => {
    const standardCategories = [
      'Event Standby', 
      'Emergency Transfer', 
      'ICU Transfer', 
      'Home Care Transport', 
      'รถพยาบาล', 
      'อุปกรณ์แพทย์', 
      'ทีมงาน', 
      'การทำภารกิจ'
    ];
    const isStandard = standardCategories.includes(work.category);

    setWorkForm({
      title: work.title,
      description: work.description,
      date: work.date,
      category: isStandard ? work.category : 'ระบุเอง / หัวข้อแยกใหม่...',
      location: work.location,
      imageUrl: work.imageUrl,
      imageUrls: work.imageUrls && work.imageUrls.length > 0 ? work.imageUrls : [work.imageUrl],
      createdAt: work.createdAt
    });
    setCustomCategoryInput(isStandard ? '' : work.category);
    setShowCustomCategoryText(!isStandard);
    setEditingWorkId(work.id);
    setShowWorkModal(true);
  };

  // Delete Work Trigger
  const handleDeleteWork = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบบันทึกภารกิจ',
      message: 'ต้องการลบบันทึกภารกิจ/ผลงานนี้ออกจากหน้าหลักหรือไม่? การลบข้อมูลนี้ไม่สามารถกู้คืนกลับมาได้',
      confirmText: 'ลบผลงาน',
      cancelText: 'ยกเลิก',
      isDanger: true,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setLoading(true);
        try {
          await deleteWork(id);
          await onRefreshData();
          showMessage('success', 'ลบผลงานเรียบร้อยแล้ว');
        } catch (error) {
          console.error(error);
          showMessage('error', 'การลบผลงานล้มเหลว');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Save Custom Page (Create / Edit)
  const handleSaveCustomPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Auto generate slug if empty
      const generatedSlug = customPageForm.slug?.trim() || 
        customPageForm.title.toLowerCase().trim()
          .replace(/[^\w\s-ก-๙]/g, '') // remove special chars except Thai and standard alpha
          .replace(/\s+/g, '-');

      await saveCustomPage({
        id: editingCustomPageId || undefined,
        title: customPageForm.title,
        tagline: customPageForm.tagline || '',
        content: customPageForm.content || '',
        order: Number(customPageForm.order) || 0,
        bgType: customPageForm.bgType || 'color',
        bgVal: customPageForm.bgVal || '#ffffff',
        textColor: customPageForm.textColor || '#1e293b',
        imageUrl: customPageForm.imageUrl || '',
        layout: customPageForm.layout || 'text-only',
        inMenu: customPageForm.inMenu !== undefined ? customPageForm.inMenu : true,
        slug: generatedSlug,
        createdAt: customPageForm.createdAt || new Date().toISOString()
      });
      await onRefreshData();
      setShowCustomPageModal(false);
      // Reset form
      setCustomPageForm({
        title: '',
        tagline: '',
        content: '',
        order: 0,
        bgType: 'color',
        bgVal: '#ffffff',
        textColor: '#1e293b',
        imageUrl: '',
        layout: 'text-only',
        inMenu: true,
        slug: '',
        createdAt: ''
      });
      setEditingCustomPageId(null);
      showMessage('success', 'บันทึกข้อมูลหน้าข้อมูลเพิ่มเติมสำเร็จแล้ว!');
    } catch (error) {
      console.error(error);
      showMessage('error', 'ไม่สามารถบันทึกหน้าข้อมูลเพิ่มเติมได้ สิทธิ์ในการเขียนถูกจำกัด');
    } finally {
      setLoading(false);
    }
  };

  // Edit Custom Page Trigger
  const startEditCustomPage = (page: CustomPage) => {
    setCustomPageForm({
      title: page.title,
      tagline: page.tagline || '',
      content: page.content || '',
      order: page.order || 0,
      bgType: page.bgType || 'color',
      bgVal: page.bgVal || '#ffffff',
      textColor: page.textColor || '#1e293b',
      imageUrl: page.imageUrl || '',
      layout: page.layout || 'text-only',
      inMenu: page.inMenu !== undefined ? page.inMenu : true,
      slug: page.slug || '',
      createdAt: page.createdAt || ''
    });
    setEditingCustomPageId(page.id);
    setShowCustomPageModal(true);
  };

  // Delete Custom Page Trigger
  const handleDeleteCustomPage = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบหน้าข้อมูลเพิ่มเติม',
      message: 'คุณแน่ใจหรือไม่ที่จะลบหน้าข้อมูลเพิ่มเติมนี้ออกจากระบบ? ข้อมูลทั้งหมดรวมถึงลิงก์ที่เกี่ยวข้องจะถูกทำลายอย่างถาวร',
      confirmText: 'ลบหน้าเพจ',
      cancelText: 'ยกเลิก',
      isDanger: true,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setLoading(true);
        try {
          await deleteCustomPage(id);
          await onRefreshData();
          showMessage('success', 'ลบหน้าข้อมูลเพิ่มเติมเสร็จสิ้น');
        } catch (error) {
          console.error(error);
          showMessage('error', 'ล้มเหลวในการลบหน้าข้อมูลเพิ่มเติม');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Save Team Member
  const handleSaveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveTeamMember({
        id: editingMemberId || undefined,
        name: teamForm.name,
        role: teamForm.role,
        description: teamForm.description || '',
        imageUrl: teamForm.imageUrl || '',
        order: Number(teamForm.order) || 1
      });
      await onRefreshData();
      setShowMemberModal(false);
      // Reset form
      setTeamForm({ name: '', role: '', description: '', imageUrl: '', order: 1 });
      setEditingMemberId(null);
      showMessage('success', 'บันทึกข้อมูลสมาชิกทีมงานสำเร็จแล้ว!');
    } catch (error) {
      console.error(error);
      showMessage('error', 'ไม่สามารถบันทึกข้อมูลสมาชิกทีมงานได้');
    } finally {
      setLoading(false);
    }
  };

  // Edit Team Member Trigger
  const startEditTeamMember = (member: TeamMember) => {
    setTeamForm({
      name: member.name,
      role: member.role,
      description: member.description || '',
      imageUrl: member.imageUrl || '',
      order: member.order || 1
    });
    setEditingMemberId(member.id);
    setShowMemberModal(true);
  };

  // Delete Team Member Trigger
  const handleDeleteTeamMember = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบสมาชิกทีมงาน',
      message: 'คุณแน่ใจหรือไม่ที่จะลบสมาชิกท่านนี้ออกจากรายชื่อทีมงาน? ข้อมูลทั้งหมดจะถูกทำลายอย่างถาวร',
      confirmText: 'ลบสมาชิก',
      cancelText: 'ยกเลิก',
      isDanger: true,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setLoading(true);
        try {
          await deleteTeamMember(id);
          await onRefreshData();
          showMessage('success', 'ลบสมาชิกทีมงานเสร็จสิ้น');
        } catch (error) {
          console.error(error);
          showMessage('error', 'ล้มเหลวในการลบสมาชิก');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Save Gallery Item (Create / Edit)
  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.url || !galleryForm.title) {
      showMessage('error', 'กรุณากรอกลิงก์รูปภาพและชื่อภาพ');
      return;
    }
    setLoading(true);
    try {
      await saveGalleryItem({
        id: editingGalleryId || undefined,
        url: galleryForm.url,
        title: galleryForm.title,
        category: galleryForm.category || 'การทำภารกิจ',
        description: galleryForm.description || '',
        date: galleryForm.date || '',
        location: galleryForm.location || '',
        order: Number(galleryForm.order) || 1
      });
      await onRefreshData();
      setShowGalleryModal(false);
      // Reset form
      setGalleryForm({
        url: '',
        title: '',
        category: 'รถพยาบาล',
        description: '',
        date: '',
        location: '',
        order: initialGallery.length + 1
      });
      setEditingGalleryId(null);
      showMessage('success', 'บันทึกรูปภาพในคลังภาพสำเร็จแล้ว!');
    } catch (error) {
      console.error(error);
      showMessage('error', 'ไม่สามารถบันทึกคลังภาพได้');
    } finally {
      setLoading(false);
    }
  };

  // Edit Gallery Trigger
  const startEditGalleryItem = (item: GalleryItem) => {
    setGalleryForm({
      url: item.url,
      title: item.title,
      category: item.category || 'การทำภารกิจ',
      description: item.description || '',
      date: item.date || '',
      location: item.location || '',
      order: item.order || 1
    });
    setEditingGalleryId(item.id);
    setShowGalleryModal(true);
  };

  // Delete Gallery Trigger
  const handleDeleteGalleryItem = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบรูปภาพจากคลังภาพ',
      message: 'ต้องการลบรูปภาพนี้ออกจากคลังภาพหรือไม่? การลบข้อมูลนี้ไม่สามารถกู้คืนกลับมาได้',
      confirmText: 'ลบรูปภาพ',
      cancelText: 'ยกเลิก',
      isDanger: true,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setLoading(true);
        try {
          await deleteGalleryItem(id);
          await onRefreshData();
          showMessage('success', 'ลบรูปภาพสำเร็จแล้ว');
        } catch (error) {
          console.error(error);
          showMessage('error', 'การลบรูปภาพล้มเหลว');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <section className="py-12 bg-slate-900 min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-8 mb-10">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Database className="w-3.5 h-3.5" />
              <span>HEADLESS CMS MANAGEMENT PORTAL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              แผงควบคุมระบบหลังบ้าน Inter Care Ambulance
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              แก้ไขข้อมูลหน้าหลัก, หมวดหมู่บริการแพทย์ฉุกเฉิน, และรายงานเคสปฐมพยาบาลทั้งหมดแบบเรียลไทม์
            </p>
          </div>

          <button 
            onClick={async () => {
              setLoading(true);
              await onRefreshData();
              setLoading(false);
              showMessage('success', 'ซิงโครไนซ์ข้อมูลใหม่จากคลาวด์สำเร็จ');
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรชข้อมูลคลาวด์
          </button>
        </div>

        {/* CMS Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CMS Tabs List (Left Col) */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Mobile View: High-Polish 2-Column Touch Grid */}
            <div className="lg:hidden space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                📌 เลือกหัวข้อหลักที่จะแก้ไข (แตะเพื่อเปลี่ยน)
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('company')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl text-[11px] font-bold text-center border transition-all cursor-pointer min-h-[85px] ${
                    activeTab === 'company'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30 ring-2 ring-blue-400'
                      : 'bg-slate-800/90 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className={`w-5 h-5 mb-1.5 ${activeTab === 'company' ? 'text-white' : 'text-blue-400'}`} />
                  <span className="leading-tight">1. ข้อมูลสำนักงาน</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl text-[11px] font-bold text-center border transition-all cursor-pointer min-h-[85px] ${
                    activeTab === 'services'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30 ring-2 ring-blue-400'
                      : 'bg-slate-800/90 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Activity className={`w-5 h-5 mb-1.5 ${activeTab === 'services' ? 'text-white' : 'text-emerald-400'}`} />
                  <span className="leading-tight">2. บริการแพทย์ ({initialServices.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('works')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl text-[11px] font-bold text-center border transition-all cursor-pointer min-h-[85px] ${
                    activeTab === 'works'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30 ring-2 ring-blue-400'
                      : 'bg-slate-800/90 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <ListCollapse className={`w-5 h-5 mb-1.5 ${activeTab === 'works' ? 'text-white' : 'text-rose-400'}`} />
                  <span className="leading-tight">3. บันทึกภารกิจ ({initialWorks.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('passcode')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl text-[11px] font-bold text-center border transition-all cursor-pointer min-h-[85px] ${
                    activeTab === 'passcode'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30 ring-2 ring-blue-400'
                      : 'bg-slate-800/90 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Key className={`w-5 h-5 mb-1.5 ${activeTab === 'passcode' ? 'text-white' : 'text-amber-400'}`} />
                  <span className="leading-tight">4. รหัสผ่านระบบ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('team')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl text-[11px] font-bold text-center border transition-all cursor-pointer min-h-[85px] ${
                    activeTab === 'team'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30 ring-2 ring-blue-400'
                      : 'bg-slate-800/90 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Users className={`w-5 h-5 mb-1.5 ${activeTab === 'team' ? 'text-white' : 'text-teal-400'}`} />
                  <span className="leading-tight">5. สมาชิกทีมงาน ({initialTeam.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('gallery')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl text-[11px] font-bold text-center border transition-all cursor-pointer min-h-[85px] ${
                    activeTab === 'gallery'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30 ring-2 ring-blue-400'
                      : 'bg-slate-800/90 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <ImageIcon className={`w-5 h-5 mb-1.5 ${activeTab === 'gallery' ? 'text-white' : 'text-violet-400'}`} />
                  <span className="leading-tight">6. คลังภาพ/แกลเลอรี ({initialGallery.length})</span>
                </button>
              </div>

              {customPages && customPages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('customPages')}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[11px] font-bold border transition-all cursor-pointer mt-2 ${
                    activeTab === 'customPages'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg ring-2 ring-blue-400'
                      : 'bg-slate-800/90 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <FileText className={`w-4 h-4 ${activeTab === 'customPages' ? 'text-white' : 'text-indigo-400'}`} />
                  <span>7. จัดการหน้าเพจเพิ่มเติม ({customPages.length})</span>
                </button>
              )}
            </div>

            {/* Desktop View: Keep original elegant vertical stack */}
            <div className="hidden lg:flex lg:flex-col gap-2">
              <button
                onClick={() => setActiveTab('company')}
                className={`w-full flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-xs font-bold text-left border transition-all cursor-pointer ${
                  activeTab === 'company'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                <span>1. ข้อมูลสำนักงาน & หน้าหลัก</span>
              </button>

              <button
                onClick={() => setActiveTab('services')}
                className={`w-full flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-xs font-bold text-left border transition-all cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4 flex-shrink-0" />
                <span>2. รายการบริการทางการแพทย์ ({initialServices.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('works')}
                className={`w-full flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-xs font-bold text-left border transition-all cursor-pointer ${
                  activeTab === 'works'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ListCollapse className="w-4 h-4 flex-shrink-0" />
                <span>3. บันทึกผลงานปฏิบัติภารกิจ ({initialWorks.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('passcode')}
                className={`w-full flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-xs font-bold text-left border transition-all cursor-pointer ${
                  activeTab === 'passcode'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Key className="w-4 h-4 flex-shrink-0" />
                <span>4. ตั้งรหัสผ่านหลังบ้านใหม่</span>
              </button>

              <button
                onClick={() => setActiveTab('team')}
                className={`w-full flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-xs font-bold text-left border transition-all cursor-pointer ${
                  activeTab === 'team'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>5. จัดการทีมงาน/สมาชิก ({initialTeam.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('gallery')}
                className={`w-full flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-xs font-bold text-left border transition-all cursor-pointer ${
                  activeTab === 'gallery'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4 flex-shrink-0" />
                <span>6. จัดการคลังภาพ/แกลเลอรี ({initialGallery.length})</span>
              </button>

              {customPages && customPages.length > 0 && (
                <button
                  onClick={() => setActiveTab('customPages')}
                  className={`w-full flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-xs font-bold text-left border transition-all cursor-pointer ${
                    activeTab === 'customPages'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                      : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span>7. จัดการหน้าเพจเพิ่มเติม ({customPages.length})</span>
                </button>
              )}
            </div>

            {/* Hint Box (Desktop only to prevent cluttering mobile tabs row) */}
            <div className="hidden lg:block p-4 bg-blue-950/20 border border-blue-500/10 rounded-2xl space-y-2 text-[11px] text-slate-400 mt-6">
              <div className="flex items-center gap-1.5 font-bold text-blue-300 uppercase">
                <Info className="w-3.5 h-3.5" />
                <span>การซิงค์ข้อมูล</span>
              </div>
              <p className="leading-relaxed">
                ระบบจัดการหน้าร้านของ Inter Care เป็นระบบไร้หัว (Headless CMS) ข้อมูลจะส่งตรงเข้าไปจัดเก็บในระบบ Cloud Firestore และอัปเดตบนเว็บไซต์ Live ทันทีหลังจากแอดมินคลิกบันทึก
              </p>
            </div>
          </div>

          {/* CMS Tab Body (Right Col) */}
          <div className="lg:col-span-9 bg-slate-800/60 border border-slate-700/60 p-6 sm:p-8 rounded-3xl space-y-8">
            
            {/* T1: Company Config Editor */}
            {activeTab === 'company' && (
              <form onSubmit={handleSaveCompany} className="space-y-6">
                <div className="border-b border-slate-700 pb-4">
                  <h3 className="font-bold text-lg text-white">แก้ไขข้อมูลหน้าหลักและช่องทางการติดต่อ</h3>
                  <p className="text-xs text-slate-400 mt-1">อัปเดตสโลแกน คำอธิบายของบริษัท เบอร์โทรฉุกเฉิน และที่อยู่โรงพยาบาล</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">ชื่อแบรนด์บริษัท / หัวเรื่อง</label>
                    <input 
                      id="cms-brand-name"
                      type="text" 
                      required
                      value={companyForm.title}
                      onChange={(e) => setCompanyForm({ ...companyForm, title: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">เบอร์โทรศัพท์ติดต่อฉุกเฉิน 24 ชม.</label>
                    <input 
                      id="cms-emergency-phone"
                      type="text" 
                      required
                      value={companyForm.emergencyPhone}
                      onChange={(e) => setCompanyForm({ ...companyForm, emergencyPhone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-rose-400 font-bold" 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">สโลแกนหลัก (Tagline)</label>
                    <input 
                      id="cms-tagline"
                      type="text" 
                      required
                      value={companyForm.tagline}
                      onChange={(e) => setCompanyForm({ ...companyForm, tagline: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">เกี่ยวกับเราอย่างย่อ (รายละเอียดหน้าหลัก)</label>
                    <textarea 
                      id="cms-description"
                      required
                      rows={4}
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">เบอร์สำนักงานหลัก (สอบถามราคา)</label>
                    <input 
                      id="cms-contact-phone"
                      type="text" 
                      required
                      value={companyForm.contactPhone}
                      onChange={(e) => setCompanyForm({ ...companyForm, contactPhone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Line Official Account ID</label>
                    <input 
                      id="cms-line-id"
                      type="text" 
                      required
                      value={companyForm.lineId}
                      onChange={(e) => setCompanyForm({ ...companyForm, lineId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Facebook Page Link</label>
                    <input 
                      id="cms-facebook-url"
                      type="url" 
                      required
                      value={companyForm.facebookUrl}
                      onChange={(e) => setCompanyForm({ ...companyForm, facebookUrl: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">ที่อยู่สำนักงาน / แผนกรับประสานงานพยาบาล</label>
                    <input 
                      id="cms-address"
                      type="text" 
                      required
                      value={companyForm.address}
                      onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <ImageUploader 
                      id="cms-profile-image"
                      value={companyForm.profileImageUrl || ''}
                      onChange={(val) => setCompanyForm({ ...companyForm, profileImageUrl: val })}
                      label="รูปโปรไฟล์หน่วยงาน / โลโก้แบรนด์ (Profile/Brand Image)"
                      placeholder="วางลิงก์รูปโปรไฟล์ หรืออัปโหลดรูปตรงนี้..."
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">แนะนำสัดส่วน 1:1 หรือ 4:3 และระบบจะบีบอัดรูปภาพให้อย่างรวดเร็ว</span>
                  </div>

                  {/* Leadership / Director Profile Info */}
                  <div className="md:col-span-2 mt-6 pt-6 border-t border-slate-700/60 space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-rose-400 flex items-center gap-2">
                        <span>👨‍⚕️ ข้อมูลผู้บริหาร / แพทย์ที่ปรึกษาหลัก (About Section)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">ตั้งค่าชื่อ ตำแหน่ง และข้อคิดเห็น/คำคมของแพทย์ที่ปรึกษาหรือผู้บริหารที่จะไปแสดงในส่วน "เกี่ยวกับเรา"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">ชื่อผู้บริหาร/แพทย์ที่ปรึกษาหลัก</label>
                        <input 
                          id="cms-director-name"
                          type="text"
                          value={companyForm.directorName || ''}
                          onChange={(e) => setCompanyForm({ ...companyForm, directorName: e.target.value })}
                          placeholder="เช่น นพ. รณเดช อัศวเวชศาสตร์"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">ตำแหน่งผู้บริหาร/แพทย์ที่ปรึกษาหลัก</label>
                        <input 
                          id="cms-director-title"
                          type="text"
                          value={companyForm.directorTitle || ''}
                          onChange={(e) => setCompanyForm({ ...companyForm, directorTitle: e.target.value })}
                          placeholder="เช่น ผู้อำนวยการด้านการดูแลผู้ป่วย Inter Care"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">คำคม / ปรัชญาการปฏิบัติหน้าที่</label>
                        <textarea 
                          id="cms-director-quote"
                          rows={3}
                          value={companyForm.directorQuote || ''}
                          onChange={(e) => setCompanyForm({ ...companyForm, directorQuote: e.target.value })}
                          placeholder="เช่น ความรวดเร็วและปลอดภัยของคนไข้คือสิ่งที่พวกเรายึดมั่นที่สุด..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* ตกแต่งพื้นหลังของแต่ละหน้า (Section Background Customization) */}
                  <div className="md:col-span-2 mt-6 pt-6 border-t border-slate-700/60 space-y-6">
                    <div>
                      <h4 className="font-bold text-sm text-blue-400 flex items-center gap-2">
                        <span>🎨 ตั้งค่าพื้นหลังของแต่ละหน้า (Section Background Customization)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">แอดมินสามารถเลือกปรับแต่งรูปแบบพื้นหลังของแต่ละส่วนได้อิสระ ไม่ว่าจะเป็น สีพื้นรูปภาพเดี่ยว หรือสีไล่ระดับแบบพรีเมียม (Gradient)</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {[
                        { id: 'hero', label: '1. ส่วนหัวหน้าแรก (Hero Section)' },
                        { id: 'services', label: '2. ส่วนรายการบริการ (Services Section)' },
                        { id: 'about', label: '3. ส่วนเกี่ยวกับเรา (About Section)' },
                        { id: 'portfolio', label: '4. ส่วนผลงานปฏิบัติภารกิจ (Portfolio Section)' },
                        { id: 'contact', label: '5. ส่วนติดต่อเรา (Contact Section)' },
                      ].map((sec) => {
                        const typeKey = `${sec.id}BgType` as keyof CompanyConfig;
                        const valKey = `${sec.id}BgVal` as keyof CompanyConfig;

                        const currentType = companyForm[typeKey] || 'color';
                        const currentVal = companyForm[valKey] || '';

                        return (
                          <div key={sec.id} id={`cms-bg-${sec.id}`} className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-4 sm:p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{sec.label}</span>
                              
                              {/* Background Type Toggles */}
                              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                                {[
                                  { type: 'color', label: '🎨 สีพื้นโทนเดี่ยว' },
                                  { type: 'image', label: '🖼️ รูปภาพ URL' },
                                  { type: 'gradient', label: '✨ สีไล่ระดับ' },
                                ].map((opt) => (
                                  <button
                                    key={opt.type}
                                    type="button"
                                    onClick={() => setCompanyForm({
                                      ...companyForm,
                                      [typeKey]: opt.type as any,
                                      [valKey]: opt.type === 'color' ? '#ffffff' : opt.type === 'image' ? 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1600&q=80' : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                                    })}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                                      currentType === opt.type 
                                        ? 'bg-blue-600 text-white shadow-sm' 
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Background Input & Presets */}
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                  {currentType === 'color' ? 'ระบุรหัสสีแบบ Hex Color (เช่น #ffffff, #0f172a)' : 
                                   currentType === 'image' ? 'ระบุ URL ลิงก์รูปภาพพื้นหลัง' : 
                                   'ระบุค่า CSS Gradient หรือชื่อคลาสไล่สี (เช่น linear-gradient(...))'}
                                </label>
                                <div className="flex gap-2.5">
                                  {currentType === 'color' && (
                                    <input 
                                      type="color"
                                      value={currentVal.startsWith('#') && currentVal.length === 7 ? currentVal : '#ffffff'}
                                      onChange={(e) => setCompanyForm({ ...companyForm, [valKey]: e.target.value })}
                                      className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-700 cursor-pointer p-1"
                                    />
                                  )}
                                  <input 
                                    type="text"
                                    required
                                    value={currentVal}
                                    onChange={(e) => setCompanyForm({ ...companyForm, [valKey]: e.target.value })}
                                    placeholder={
                                      currentType === 'color' ? 'เช่น #ffffff, #0f172a, rgba(0,0,0,0.5)' : 
                                      currentType === 'image' ? 'เช่น https://images.unsplash.com/...' : 
                                      'เช่น linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                                    }
                                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                                  />
                                </div>
                              </div>

                              {/* Presets Row */}
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="text-[10px] text-slate-500 font-medium font-sans">แนะนำด่วน:</span>
                                {currentType === 'color' && [
                                  { name: 'สว่าง (ขาว)', val: '#ffffff' },
                                  { name: 'เทาอ่อน', val: '#f8fafc' },
                                  { name: 'น้ำเงินเข้ม', val: '#0f172a' },
                                  { name: 'มืดสนิท', val: '#020617' },
                                ].map((p) => (
                                  <button
                                    key={p.val}
                                    type="button"
                                    onClick={() => setCompanyForm({ ...companyForm, [valKey]: p.val })}
                                    className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-[10px] transition-colors cursor-pointer flex items-center"
                                  >
                                    <span className="inline-block w-2 h-2 rounded-full mr-1.5 border border-white/10" style={{ backgroundColor: p.val }} />
                                    {p.name}
                                  </button>
                                ))}

                                {currentType === 'image' && [
                                  { name: 'รถพยาบาล 1', val: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1600&q=80' },
                                  { name: 'ห้องควบคุม ICU', val: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1600&q=80' },
                                  { name: 'เครื่องช่วยใจ', val: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80' },
                                ].map((p) => (
                                  <button
                                    key={p.val}
                                    type="button"
                                    onClick={() => setCompanyForm({ ...companyForm, [valKey]: p.val })}
                                    className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-[10px] transition-colors cursor-pointer"
                                  >
                                    {p.name}
                                  </button>
                                ))}

                                {currentType === 'gradient' && [
                                  { name: 'Midnight', val: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
                                  { name: 'Cosmic', val: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)' },
                                  { name: 'Deep Purple', val: 'linear-gradient(135deg, #0f172a 0%, #2e1065 100%)' },
                                  { name: 'Rose Dark', val: 'linear-gradient(135deg, #020617 0%, #450a0a 100%)' },
                                ].map((p) => (
                                  <button
                                    key={p.val}
                                    type="button"
                                    onClick={() => setCompanyForm({ ...companyForm, [valKey]: p.val })}
                                    className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-[10px] transition-colors cursor-pointer"
                                  >
                                    {p.name}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Text Color Customizer */}
                            <div className="pt-3 border-t border-slate-800/80 space-y-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  🎨 ปรับสีตัวอักษรหลักของส่วนนี้ (General Text Color)
                                </label>
                                <div className="flex flex-wrap items-center gap-3">
                                  <div className="flex gap-2">
                                    <input 
                                      type="color"
                                      value={companyForm[`${sec.id}TextColor` as keyof CompanyConfig]?.startsWith('#') ? companyForm[`${sec.id}TextColor` as keyof CompanyConfig] : '#ffffff'}
                                      onChange={(e) => setCompanyForm({ ...companyForm, [`${sec.id}TextColor` as keyof CompanyConfig]: e.target.value })}
                                      className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer p-0.5"
                                    />
                                    <input 
                                      type="text"
                                      value={companyForm[`${sec.id}TextColor` as keyof CompanyConfig] || ''}
                                      onChange={(e) => setCompanyForm({ ...companyForm, [`${sec.id}TextColor` as keyof CompanyConfig]: e.target.value })}
                                      placeholder="เช่น #ffffff, #000000, หรือว่างไว้เพื่อใช้สีเริ่มต้น"
                                      className="w-48 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono" 
                                    />
                                  </div>
                                  
                                  {/* Quick Color Presets */}
                                  <div className="flex flex-wrap gap-1">
                                    {[
                                      { name: 'สีขาว', val: '#ffffff' },
                                      { name: 'สีดำ', val: '#000000' },
                                      { name: 'เทาเข้ม', val: '#1e293b' },
                                      { name: 'ใช้ค่าเริ่มต้น', val: '' }
                                    ].map((cp) => (
                                      <button
                                        key={cp.name}
                                        type="button"
                                        onClick={() => setCompanyForm({ ...companyForm, [`${sec.id}TextColor` as keyof CompanyConfig]: cp.val })}
                                        className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-[9px] transition-colors cursor-pointer"
                                      >
                                        {cp.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {sec.id === 'services' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800/40">
                                  {/* Title Color */}
                                  <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                      ✨ สีหัวข้อหลัก (Title Color - ครอบคลุมทุกการเคลื่อนย้าย...)
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="color"
                                        value={companyForm.servicesTitleColor?.startsWith('#') ? companyForm.servicesTitleColor : '#ffffff'}
                                        onChange={(e) => setCompanyForm({ ...companyForm, servicesTitleColor: e.target.value })}
                                        className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer p-0.5"
                                      />
                                      <input 
                                        type="text"
                                        value={companyForm.servicesTitleColor || ''}
                                        onChange={(e) => setCompanyForm({ ...companyForm, servicesTitleColor: e.target.value })}
                                        placeholder="เช่น #ffffff, #000000"
                                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono" 
                                      />
                                      {companyForm.servicesTitleColor && (
                                        <button 
                                          type="button"
                                          onClick={() => setCompanyForm({ ...companyForm, servicesTitleColor: '' })}
                                          className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors"
                                        >
                                          ล้างสี
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Description Color */}
                                  <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                      📝 สีคำอธิบาย (Description Color - อินเตอร์ แคร์ แอมบูแลนซ์...)
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="color"
                                        value={companyForm.servicesDescColor?.startsWith('#') ? companyForm.servicesDescColor : '#ffffff'}
                                        onChange={(e) => setCompanyForm({ ...companyForm, servicesDescColor: e.target.value })}
                                        className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer p-0.5"
                                      />
                                      <input 
                                        type="text"
                                        value={companyForm.servicesDescColor || ''}
                                        onChange={(e) => setCompanyForm({ ...companyForm, servicesDescColor: e.target.value })}
                                        placeholder="เช่น #ffffff, #000000"
                                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono" 
                                      />
                                      {companyForm.servicesDescColor && (
                                        <button 
                                          type="button"
                                          onClick={() => setCompanyForm({ ...companyForm, servicesDescColor: '' })}
                                          className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors"
                                        >
                                          ล้างสี
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700 flex justify-end">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs sm:text-sm font-bold text-white rounded-xl shadow transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? "กำลังดำเนินการประมวลผล..." : "บันทึกและปรับใช้ข้อมูลหลัก"}
                  </button>
                </div>
              </form>
            )}

            {/* T2: Services CMS List */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="border-b border-slate-700 pb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-white">จัดการบริการทางการแพทย์</h3>
                    <p className="text-xs text-slate-400 mt-1">เพิ่มลบแก้ไขข้อความ, ลำดับการเรียงและไอคอนประจำบริการรถพยาบาล</p>
                  </div>
                  <button
                    onClick={() => {
                      setServiceForm({ title: '', description: '', iconName: 'Activity', order: initialServices.length + 1 });
                      setEditingServiceId(null);
                      setShowServiceModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    เพิ่มบริการใหม่
                  </button>
                </div>

                {/* Services Table/List */}
                <div className="space-y-4">
                  {initialServices.map((service) => (
                    <div 
                      key={service.id}
                      className="bg-slate-900/60 border border-slate-700/40 p-4 rounded-2xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400">
                          <DynamicIcon name={service.iconName} className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm sm:text-base">{service.title}</h4>
                            <span className="bg-slate-800 text-[10px] text-slate-400 px-2 py-0.5 rounded-md font-mono">
                              ลำดับ {service.order}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 font-light max-w-xl">{service.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditService(service)}
                          title="แก้ไขรายละเอียดบริการ"
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          title="ลบบริการนี้ออกจากหน้าร้าน"
                          className="p-2 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {initialServices.length === 0 && (
                    <div className="text-center py-12 bg-slate-900/30 border border-dashed border-slate-700 rounded-2xl">
                      <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">ยังไม่มีรายการบริการถูกตั้งค่าในคลาวด์</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* T3: Works / Portfolio CMS List */}
            {activeTab === 'works' && (
              <div className="space-y-6">
                <div className="border-b border-slate-700 pb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-white">จัดการผลงานและกิจกรรมสแตนด์บาย</h3>
                    <p className="text-xs text-slate-400 mt-1">รายงานเคสช่วยคนไข้, เคลื่อนย้ายระยะไกล และบริการเฝ้าระวังเหตุในคอนเสิร์ต</p>
                  </div>
                  <button
                    onClick={() => {
                      setWorkForm({
                        title: '',
                        description: '',
                        date: new Date().toISOString().split('T')[0],
                        category: 'Event Standby',
                        location: '',
                        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
                        imageUrls: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'],
                        createdAt: ''
                      });
                      setEditingWorkId(null);
                      setShowWorkModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    เพิ่มบันทึกผลงานใหม่
                  </button>
                </div>

                {/* Works Table/List */}
                <div className="space-y-4">
                  {initialWorks.map((work) => (
                    <div 
                      key={work.id}
                      className="bg-slate-900/60 border border-slate-700/40 p-4 rounded-2xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        {/* Tiny Image Thumbnail */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
                          <img 
                            src={work.imageUrl || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=120&q=80"} 
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-white text-sm sm:text-base leading-tight">{work.title}</h4>
                            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                              {work.category}
                            </span>
                          </div>
                          
                          {/* Metas info */}
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-light">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-500" /> {work.date}</span>
                            <span className="flex items-center gap-1 truncate max-w-[150px]"><MapPin className="w-3 h-3 text-slate-500" /> {work.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => startEditWork(work)}
                          title="แก้ไขบันทึกภารกิจนี้"
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteWork(work.id)}
                          title="ลบบันทึกภารกิจออกจากคลาวด์"
                          className="p-2 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {initialWorks.length === 0 && (
                    <div className="text-center py-12 bg-slate-900/30 border border-dashed border-slate-700 rounded-2xl">
                      <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">ยังไม่มีรายงานภารกิจ/ผลงานในฐานข้อมูล</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* T4: Change Passcode & MFA Settings */}
            {activeTab === 'passcode' && (
              <div className="space-y-8">
                <div className="border-b border-slate-700 pb-4">
                  <h3 className="font-bold text-lg text-white">ระบบจัดการความปลอดภัยและสิทธิ์การดูแล</h3>
                  <p className="text-xs text-slate-400 mt-1">อัปเดตรหัสผ่านหลักของคุณ หรือตั้งค่าระบบการยืนยันตัวตนสองชั้นเพื่อความปลอดภัยสูงสุด</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  
                  {/* Left Column: Change Passcode */}
                  <div className="space-y-6 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
                    <div>
                      <h4 className="font-bold text-base text-white flex items-center gap-2">
                        <Key className="w-5 h-5 text-blue-400" />
                        ตั้งรหัสผ่านเข้าหลังบ้านใหม่
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">อัปเดตหรือเปลี่ยนรหัสผ่านในการเข้าถึงหน้าจัดการข้อมูลหลังบ้าน (CMS)</p>
                    </div>

                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!currentPasscode.trim()) {
                        showMessage('error', 'กรุณากรอกรหัสผ่านปัจจุบันก่อนเพื่อดำเนินการ');
                        return;
                      }
                      if (!newPasscode.trim()) {
                        showMessage('error', 'กรุณากรอกรหัสผ่านใหม่');
                        return;
                      }
                      if (newPasscode.length < 4) {
                        showMessage('error', 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
                        return;
                      }
                      setLoading(true);
                      try {
                        // 1. Verify if the current passcode is correct
                        const isValidCurrent = await authenticateAdmin(currentPasscode);
                        if (!isValidCurrent) {
                          showMessage('error', 'รหัสผ่านปัจจุบันไม่ถูกต้อง กรุณาตรวจสอบและกรอกใหม่อีกครั้ง');
                          setLoading(false);
                          return;
                        }

                        // 2. Perform the update if the current passcode is verified
                        await updateAdminPasscode(newPasscode);
                        showMessage('success', 'เปลี่ยนรหัสผ่านแอดมินใหม่สำเร็จแล้ว! รหัสใหม่ของคุณพร้อมใช้งานทันที');
                        setNewPasscode('');
                        setCurrentPasscode('');
                      } catch (err) {
                        console.error(err);
                        showMessage('error', 'ล้มเหลวในการบันทึกรหัสผ่านใหม่: สิทธิ์ไม่เพียงพอ');
                      } finally {
                        setLoading(false);
                      }
                    }} className="space-y-4">
                      
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">รหัสผ่านปัจจุบัน</label>
                        <input 
                          type="password" 
                          required
                          value={currentPasscode}
                          onChange={(e) => setCurrentPasscode(e.target.value)}
                          placeholder="ป้อนรหัสผ่านปัจจุบัน"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                        />
                        <span className="text-[10px] text-slate-500 block">ระบุรหัสผ่านปัจจุบันเพื่อสิทธิ์ในการยืนยันตัวตน</span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">รหัสผ่านใหม่ที่ต้องการตั้ง</label>
                        <input 
                          type="password" 
                          required
                          value={newPasscode}
                          onChange={(e) => setNewPasscode(e.target.value)}
                          placeholder="ตั้งรหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร)"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                        />
                        <span className="text-[10px] text-slate-500 block">เมื่อเปลี่ยนแล้ว ระบบจะซิงค์กับคลาวด์และใช้รหัสนี้สำหรับการเข้าสู่ระบบครั้งถัดไป</span>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                        <button 
                          type="submit"
                          disabled={loading}
                          className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-bold text-white rounded-xl shadow transition-all cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          {loading ? "กำลังบันทึก..." : "ยืนยันการเปลี่ยนรหัสผ่าน"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Multi-Factor Authentication (MFA) */}
                  <div className="space-y-6 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-base text-white flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-emerald-400" />
                          ระบบยืนยันตัวตนแบบสองปัจจัย (MFA)
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">ยืนยันตัวตนโดยใช้รหัส OTP แบบจำกัดเวลา 30 วินาที ผ่าน Google Authenticator บนโทรศัพท์มือถือ</p>
                      </div>
                      
                      {/* Active Status Badge */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        mfaEnabled 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {mfaEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </div>

                    {!mfaSetupStep ? (
                      /* Main View of MFA Settings */
                      <div className="space-y-5">
                        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex gap-4">
                          <ShieldCheck className={`w-8 h-8 flex-shrink-0 ${mfaEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                          <div className="text-xs space-y-1">
                            <h5 className="font-bold text-white">
                              {mfaEnabled ? 'ระบบป้องกันของคุณอยู่ในเกณฑ์สูงสุด' : 'ระบบป้องกันยังไม่สมบูรณ์'}
                            </h5>
                            <p className="text-slate-400 leading-relaxed">
                              {mfaEnabled 
                                ? 'รหัสผ่าน CMS ของคุณถูกป้องกันด้วยระบบ 2FA เพื่อให้แน่ใจว่าจะไม่มีใครแอบสุ่มรหัสผ่านหลังบ้านมาขโมยข้อมูลของคุณได้' 
                                : 'เพื่อความปลอดภัยแบบมาตรฐานสากล แนะนำเป็นอย่างยิ่งให้เปิดการใช้งาน Multi-Factor Authentication (MFA)'}
                            </p>
                          </div>
                        </div>

                        {/* Enable/Disable Button */}
                        {!mfaEnabled ? (
                          <div className="flex justify-start">
                            <button
                              type="button"
                              onClick={() => {
                                const secret = generateRandomBase32Secret(16);
                                setMfaSetupSecret(secret);
                                setMfaSetupStep(true);
                                setMfaCodeInput('');
                                setMfaConfirmError(false);
                              }}
                              className="flex items-center gap-1.5 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl shadow transition-all cursor-pointer"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              เริ่มต้นเปิดใช้งาน MFA
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {!showDisableForm ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setShowDisableForm(true);
                                  setDisablePasscode('');
                                  setDisableMfaCode('');
                                }}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-rose-950/30 text-xs font-bold text-rose-400 hover:text-rose-300 rounded-xl transition-colors border border-slate-700/60 cursor-pointer"
                              >
                                ปิดใช้งานระบบ MFA
                              </button>
                            ) : (
                              /* Secure Disable Form */
                              <form onSubmit={async (e) => {
                                e.preventDefault();
                                setLoading(true);
                                try {
                                  // Verify password
                                  const isValidPass = await authenticateAdmin(disablePasscode);
                                  if (!isValidPass) {
                                    showMessage('error', 'รหัสผ่านแอดมินไม่ถูกต้อง ไม่สามารถปิดใช้งาน MFA ได้');
                                    setLoading(false);
                                    return;
                                  }

                                  // Verify MFA token
                                  const isValidMfa = await verifyTOTP(mfaSecret, disableMfaCode);
                                  if (!isValidMfa) {
                                    showMessage('error', 'รหัส OTP ในโทรศัพท์ไม่ถูกต้อง กรุณาป้อนรหัสปัจจุบันให้ตรงกัน');
                                    setLoading(false);
                                    return;
                                  }

                                  // Disable MFA in Firestore
                                  await updateMfaSettings(false, '');
                                  setMfaEnabled(false);
                                  setMfaSecret('');
                                  setShowDisableForm(false);
                                  showMessage('success', 'ปิดใช้งานระบบ MFA เป็นที่เรียบร้อย บัญชีของคุณกลับไปใช้เพียงรหัสผ่านธรรมดาแล้ว');
                                } catch (err) {
                                  console.error(err);
                                  showMessage('error', 'เกิดข้อผิดพลาดในการยกเลิก MFA');
                                } finally {
                                  setLoading(false);
                                }
                              }} className="p-4 bg-rose-950/15 border border-rose-500/20 rounded-2xl space-y-4">
                                <div className="text-xs space-y-1">
                                  <h6 className="font-bold text-rose-400">ยืนยันเพื่อยกเลิกระบบรักษาความปลอดภัย MFA</h6>
                                  <p className="text-slate-400">กรุณาระบุรหัสผ่านแอดมินหลังบ้านพร้อมรหัสความปลอดภัย OTP 6 หลักปัจจุบันเพื่อยืนยันสิทธิ์ในการปิดใช้งาน</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase">รหัสผ่านหลักแอดมิน</label>
                                    <input 
                                      type="password" 
                                      required
                                      value={disablePasscode}
                                      onChange={(e) => setDisablePasscode(e.target.value)}
                                      placeholder="ป้อนรหัสผ่าน CMS"
                                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase">รหัส OTP 6 หลัก</label>
                                    <input 
                                      type="text" 
                                      required
                                      pattern="[0-9]*"
                                      maxLength={6}
                                      value={disableMfaCode}
                                      onChange={(e) => setDisableMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                                      placeholder="000000"
                                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-center tracking-wider"
                                    />
                                  </div>
                                </div>

                                <div className="flex gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setShowDisableForm(false)}
                                    className="px-3 py-1.5 bg-transparent hover:bg-slate-800 text-slate-400 text-xs rounded-lg transition-colors cursor-pointer"
                                  >
                                    ยกเลิก
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer"
                                  >
                                    {loading ? 'กำลังยืนยัน...' : 'ปิดใช้งานทันที'}
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Interactive MFA Setup Workflow */
                      <div className="space-y-5 bg-slate-950/50 p-5 rounded-2xl border border-slate-800/80">
                        <div className="text-xs space-y-1 border-b border-slate-800 pb-3">
                          <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">MFA Setup Wizard</span>
                          <h5 className="font-bold text-white">ทำตาม 3 ขั้นตอนดังต่อไปนี้เพื่อซิงค์ระบบ:</h5>
                        </div>

                        {/* Step 1: Scan QR Code */}
                        <div className="space-y-3">
                          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <span className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-blue-400">1</span>
                            สแกน QR Code ด้านล่างผ่านแอป Authenticator
                          </span>
                          
                          {/* QR Code Frame with full white backing for high contrast scanner readability */}
                          <div className="w-44 h-44 bg-white p-2.5 rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-slate-700">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(getTOTPProvisioningUri(mfaSetupSecret, 'Admin', 'InterCare Ambulance'))}`}
                              alt="Scan with Authenticator App"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>

                        {/* Step 2: Copy Key */}
                        <div className="space-y-2 pt-2">
                          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <span className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-blue-400">2</span>
                            หรือป้อนคีย์การตั้งค่านี้ด้วยตนเอง
                          </span>
                          
                          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                            <span className="font-mono text-xs text-yellow-400 tracking-wider font-bold select-all truncate flex-grow text-center">{mfaSetupSecret}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(mfaSetupSecret);
                                setCopiedSecret(true);
                                setTimeout(() => setCopiedSecret(false), 2500);
                              }}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer flex-shrink-0"
                              title="Copy secret key to clipboard"
                            >
                              {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Step 3: Enter 6-digit Code to Confirm */}
                        <div className="space-y-2 pt-2">
                          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <span className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-blue-400">3</span>
                            ตรวจสอบความถูกต้องโดยระบุรหัส OTP 6 หลักที่สร้างจากแอป
                          </span>

                          <div className="max-w-[180px] mx-auto">
                            <input 
                              type="text" 
                              required
                              pattern="[0-9]*"
                              maxLength={6}
                              value={mfaCodeInput}
                              onChange={(e) => setMfaCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="000000"
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 text-slate-200 text-lg font-black font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest"
                            />
                          </div>

                          {mfaConfirmError && (
                            <div className="p-3 bg-rose-950/40 border border-rose-500/20 text-rose-400 text-[11px] rounded-xl flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-500" />
                              <span>รหัส OTP ไม่ถูกต้อง กรุณาลองตรวจสอบใหม่อีกครั้ง</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800/80">
                          <button
                            type="button"
                            onClick={() => {
                              setMfaSetupStep(false);
                              setMfaCodeInput('');
                              setMfaConfirmError(false);
                            }}
                            className="px-4 py-2 bg-transparent hover:bg-slate-800 text-slate-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            ยกเลิกการตั้งค่า
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setMfaConfirmError(false);
                              setLoading(true);
                              try {
                                const isValid = await verifyTOTP(mfaSetupSecret, mfaCodeInput);
                                if (isValid) {
                                  // Save to firebase
                                  await updateMfaSettings(true, mfaSetupSecret);
                                  setMfaEnabled(true);
                                  setMfaSecret(mfaSetupSecret);
                                  setMfaSetupStep(false);
                                  setMfaCodeInput('');
                                  showMessage('success', 'ระบบการยืนยันตัวตนแบบหลายปัจจัย (MFA) เปิดทำงานเรียบร้อยแล้ว บัญชีของคุณปลอดภัยอย่างยิ่งในตอนนี้!');
                                } else {
                                  setMfaConfirmError(true);
                                }
                              } catch (err) {
                                console.error(err);
                                showMessage('error', 'ระบบขัดข้องในการตั้งค่า MFA');
                              } finally {
                                setLoading(false);
                              }
                            }}
                            disabled={loading}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer"
                          >
                            {loading ? 'กำลังซิงค์...' : 'ยืนยันและเปิดใช้งาน MFA'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* T5: Team Members CMS List */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div className="border-b border-slate-700 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-white">จัดการข้อมูลทีมงานและสมาชิก</h3>
                    <p className="text-xs text-slate-400 mt-1">เพิ่ม แก้ไข หรือลบข้อมูลทีมแพทย์ พยาบาลฉุกเฉิน และบุคลากรมาตรฐานของบริษัท</p>
                  </div>
                  <button
                    onClick={() => {
                      setTeamForm({
                        name: '',
                        role: '',
                        description: '',
                        imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
                        order: initialTeam.length + 1
                      });
                      setEditingMemberId(null);
                      setShowMemberModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    เพิ่มสมาชิกใหม่
                  </button>
                </div>

                {/* Team Members List */}
                <div className="space-y-4">
                  {initialTeam.map((member, idx) => (
                    <div 
                      key={member.id || idx}
                      id={`member-item-${member.id}`}
                      className="bg-slate-900/60 border border-slate-700/40 p-4 rounded-2xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Avatar Thumbnail */}
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
                          {member.imageUrl ? (
                            <img 
                              src={member.imageUrl} 
                              alt={member.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <Users className="w-6 h-6 opacity-40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-white text-sm sm:text-base truncate">{member.name}</h4>
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded-md font-medium">
                              {member.role}
                            </span>
                            <span className="bg-slate-800 text-[10px] text-slate-400 px-2 py-0.5 rounded-md font-mono">
                              ลำดับแสดงผล {member.order}
                            </span>
                          </div>
                          {member.description && (
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 font-light max-w-xl">{member.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => startEditTeamMember(member)}
                          title="แก้ไขรายละเอียดสมาชิก"
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer border border-slate-700/60"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeamMember(member.id)}
                          title="ลบสมาชิกท่านนี้"
                          className="p-2 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer border border-slate-700/60"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {initialTeam.length === 0 && (
                    <div className="text-center py-12 bg-slate-900/30 border border-dashed border-slate-700 rounded-2xl">
                      <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">ยังไม่มีรายชื่อสมาชิกถูกตั้งค่าในคลาวด์</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* T5: Custom Pages CMS List */}
            {activeTab === 'customPages' && (
              <div className="space-y-6">
                <div className="border-b border-slate-700 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-white">จัดการหน้าข้อมูลเพิ่มเติม (Custom Pages)</h3>
                    <p className="text-xs text-slate-400 mt-1">สร้าง แก้ไข หรือลบหน้าเว็บเนื้อหาแบบไดนามิกเพิ่มเติมที่จะปรากฏในแถบเมนูหลัก</p>
                  </div>
                  <button
                    onClick={() => {
                      setCustomPageForm({
                        title: '',
                        tagline: '',
                        content: '',
                        order: customPages.length + 1,
                        bgType: 'color',
                        bgVal: '#ffffff',
                        textColor: '#1e293b',
                        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
                        layout: 'text-only',
                        inMenu: true,
                        slug: '',
                        createdAt: ''
                      });
                      setEditingCustomPageId(null);
                      setShowCustomPageModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    สร้างหน้าเว็บใหม่
                  </button>
                </div>

                {/* Custom Pages List */}
                <div className="space-y-4">
                  {customPages.map((page) => (
                    <div 
                      key={page.id}
                      id={`page-item-${page.id}`}
                      className="bg-slate-900/60 border border-slate-700/40 p-4 rounded-2xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 font-mono text-xs font-bold flex-shrink-0">
                          {page.slug ? page.slug.substring(0, 2).toUpperCase() : 'PG'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-white text-sm sm:text-base truncate">{page.title}</h4>
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded-md font-mono">
                              /{page.slug}
                            </span>
                            <span className="bg-slate-800 text-[10px] text-slate-400 px-2 py-0.5 rounded-md font-mono">
                              ลำดับ {page.order}
                            </span>
                            {page.inMenu ? (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-2 py-0.5 rounded font-bold">
                                แสดงบนเมนู
                              </span>
                            ) : (
                              <span className="bg-slate-800 text-slate-500 text-[9px] px-2 py-0.5 rounded">
                                ซ่อนจากเมนู
                              </span>
                            )}
                          </div>
                          {page.tagline && (
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 font-light max-w-xl">{page.tagline}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {onNavigateToPage && (
                          <button
                            onClick={() => onNavigateToPage(page.slug)}
                            title="เปิดดูหน้าเว็บจริง"
                            className="p-2 bg-slate-800 hover:bg-blue-900/40 text-blue-400 hover:text-blue-300 border border-slate-700/60 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold pr-0.5 hidden sm:inline">ดูหน้าเว็บ</span>
                          </button>
                        )}
                        <button
                          onClick={() => startEditCustomPage(page)}
                          title="แก้ไขรายละเอียดหน้าเพจ"
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer border border-slate-700/60"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomPage(page.id)}
                          title="ลบหน้าเพจนี้ออกจากระบบ"
                          className="p-2 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer border border-slate-700/60"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {customPages.length === 0 && (
                    <div className="text-center py-12 bg-slate-900/30 border border-dashed border-slate-700 rounded-2xl">
                      <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">ยังไม่มีหน้าข้อมูลเพิ่มเติมถูกตั้งค่าในคลาวด์</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* T6: Gallery Items CMS List */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <div className="border-b border-slate-700 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-white">จัดการคลังภาพ / แกลเลอรีผลงาน</h3>
                    <p className="text-xs text-slate-400 mt-1">อัปเดต เพิ่ม ลบ หรือจัดเรียงรูปภาพผลงาน รถพยาบาล อุปกรณ์ทางการแพทย์ และบรรยากาศการทำงาน</p>
                  </div>
                  <button
                    onClick={() => {
                      setGalleryForm({
                        url: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=800&q=80',
                        title: '',
                        category: 'รถพยาบาล',
                        description: '',
                        date: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
                        location: 'กรุงเทพมหานคร',
                        order: initialGallery.length + 1
                      });
                      setEditingGalleryId(null);
                      setShowGalleryModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow transition-all cursor-pointer self-start sm:self-auto animate-pulse"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                    เพิ่มรูปภาพใหม่
                  </button>
                </div>

                {/* Gallery List (Grid Layout) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {initialGallery.map((item, idx) => (
                    <div 
                      key={item.id || idx}
                      className="bg-slate-900/60 border border-slate-700/40 rounded-3xl overflow-hidden flex flex-col group hover:border-slate-600/60 transition-all duration-300"
                    >
                      {/* Image Thumbnail with Overlay */}
                      <div className="aspect-video w-full bg-slate-800 relative overflow-hidden border-b border-slate-800">
                        {item.url ? (
                          <img 
                            src={item.url} 
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <ImageIcon className="w-12 h-12 opacity-30" />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-blue-400 border border-slate-800 text-[10px] px-2.5 py-1 rounded-xl font-medium shadow-md">
                          {item.category}
                        </span>
                        <span className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] px-2.5 py-1 rounded-xl font-bold shadow-md">
                          ลำดับ {item.order}
                        </span>
                      </div>

                      {/* Content Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="font-bold text-white text-base line-clamp-1">{item.title}</h4>
                          {item.description && (
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-light">{item.description}</p>
                          )}
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 font-mono pt-1">
                            {item.date && <span className="flex items-center gap-1">🕒 {item.date}</span>}
                            {item.location && <span className="flex items-center gap-1">📍 {item.location}</span>}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                          <button
                            onClick={() => startEditGalleryItem(item)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            แก้ไขข้อมูล
                          </button>
                          <button
                            onClick={() => handleDeleteGalleryItem(item.id)}
                            className="p-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-500 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-900/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {initialGallery.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-slate-900/30 border border-dashed border-slate-700 rounded-3xl">
                      <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-60" />
                      <h5 className="font-bold text-white text-sm">ยังไม่มีรูปภาพในคลังภาพ</h5>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">เริ่มต้นอัปโหลดหรือเพิ่มรูปภาพผลงานกู้ชีพของท่านเพื่อเพิ่มความน่าเชื่อถือให้กับบริษัท</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Editor: Services */}
        {showServiceModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <button 
                onClick={() => setShowServiceModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-slate-700 pb-3">
                <h3 className="font-bold text-lg text-white">
                  {editingServiceId ? "แก้ไขข้อมูลบริการพยาบาล" : "สร้างรายชื่อบริการพยาบาลใหม่"}
                </h3>
                <p className="text-xs text-slate-400">ป้อนชื่อและไอคอนสื่อสารที่เหมาะสมสำหรับรถกู้ชีพ</p>
              </div>

              <form onSubmit={handleSaveService} className="space-y-4 text-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">หัวเรื่องบริการ</label>
                  <input 
                    type="text" 
                    required
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">คำอธิบายรายละเอียดคุณลักษณะรถ/ทีม</label>
                  <textarea 
                    required
                    rows={3}
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">จัดเรียงลำดับในหน้าร้าน</label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      value={serviceForm.order}
                      onChange={(e) => setServiceForm({ ...serviceForm, order: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">ไอคอนที่กำลังใช้</label>
                    <div className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-300 text-sm flex items-center gap-2 font-mono">
                      <DynamicIcon name={serviceForm.iconName} className="w-4 h-4 text-blue-400" />
                      <span>{serviceForm.iconName}</span>
                    </div>
                  </div>
                </div>

                {/* Popular Icons Selection Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">คลิกเพื่อเลือกไอคอนที่เหมาะสม:</label>
                  <div className="grid grid-cols-5 gap-2 p-3 bg-slate-900 rounded-xl max-h-[140px] overflow-y-auto border border-slate-700">
                    {POPULAR_ICONS.map((ico) => (
                      <button
                        key={ico}
                        type="button"
                        onClick={() => setServiceForm({ ...serviceForm, iconName: ico })}
                        className={`p-2 rounded-lg flex flex-col items-center justify-center border transition-all cursor-pointer ${
                          serviceForm.iconName === ico
                            ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                            : 'bg-slate-800 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
                        }`}
                      >
                        <DynamicIcon name={ico} className="w-4 h-4 mb-1" />
                        <span className="text-[8px] font-mono block truncate max-w-full">{ico}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowServiceModal(false)}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-bold text-white rounded-xl cursor-pointer shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{loading ? "กำลังเซฟ..." : "บันทึกข้อมูล"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editor: Team Member */}
        {showMemberModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <button 
                onClick={() => setShowMemberModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-slate-700 pb-3">
                <h3 className="font-bold text-lg text-white">
                  {editingMemberId ? "แก้ไขข้อมูลทีมงาน/สมาชิก" : "สร้างรายชื่อสมาชิกใหม่"}
                </h3>
                <p className="text-xs text-slate-400">ป้อนชื่อบทบาท หน้าที่ความรับผิดชอบ และลิงก์รูปภาพประจำตัว</p>
              </div>

              <form onSubmit={handleSaveTeamMember} className="space-y-4 text-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">ชื่อ-นามสกุลสมาชิก</label>
                  <input 
                    type="text" 
                    required
                    placeholder="เช่น นพ. รณเดช อัศวเวชศาสตร์"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">ตำแหน่ง / บทบาทหน้าที่</label>
                  <input 
                    type="text" 
                    required
                    placeholder="เช่น หัวหน้าทีมพยาบาลวิชาชีพดูแลการเคลื่อนย้าย"
                    value={teamForm.role}
                    onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>

                <div>
                  <ImageUploader 
                    value={teamForm.imageUrl || ''}
                    onChange={(val) => setTeamForm({ ...teamForm, imageUrl: val })}
                    label="รูปภาพโปรไฟล์ประจำตัว (Profile Image)"
                    placeholder="วางลิงก์รูปภาพ หรืออัปโหลดไฟล์รูปโดยตรง..."
                  />
                  <p className="text-[10px] text-slate-500 mt-1">แนะนำรูปภาพแนวตั้งหรือสี่เหลี่ยมจัตุรัส และจะบีบอัดรูปภาพให้อัตโนมัติ</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">รายละเอียดความเชี่ยวชาญ / ประวัติสั้น</label>
                  <textarea 
                    rows={3}
                    placeholder="เช่น พยาบาลวิชาชีพเฉพาะทางด้านดูแลผู้ป่วยวิกฤต ประสบการณ์ 10 ปี"
                    value={teamForm.description}
                    onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">จัดเรียงลำดับการแสดงผล</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    value={teamForm.order}
                    onChange={(e) => setTeamForm({ ...teamForm, order: Number(e.target.value) })}
                    className="w-32 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                  />
                </div>

                <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowMemberModal(false)}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-bold text-white rounded-xl cursor-pointer shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{loading ? "กำลังเซฟ..." : "บันทึกข้อมูล"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editor: Works */}
        {showWorkModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <button 
                onClick={() => setShowWorkModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-slate-700 pb-3">
                <h3 className="font-bold text-lg text-white">
                  {editingWorkId ? "แก้ไขรายละเอียดผลงานกู้ชีพ" : "เพิ่มบันทึกผลงานการเคลื่อนย้ายใหม่"}
                </h3>
                <p className="text-xs text-slate-400">ป้อนประวัติภารกิจ วันที่ สถานที่ และรูปภาพประกอบ</p>
              </div>

              <form onSubmit={handleSaveWork} className="space-y-4 text-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">ชื่อหัวข้อบันทึกภารกิจ</label>
                  <input 
                    type="text" 
                    required
                    value={workForm.title}
                    onChange={(e) => setWorkForm({ ...workForm, title: e.target.value })}
                    placeholder="เช่น ปฏิบัติภารกิจสแตนด์บายงานกีฬาไตรกีฬา..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">ประเภทการดูแล/หมวดหมู่</label>
                    <select 
                      value={workForm.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWorkForm({ ...workForm, category: val });
                        if (val === 'ระบุเอง / หัวข้อแยกใหม่...') {
                          setShowCustomCategoryText(true);
                        } else {
                          setShowCustomCategoryText(false);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Event Standby">Event Standby</option>
                      <option value="Emergency Transfer">Emergency Transfer</option>
                      <option value="ICU Transfer">ICU Transfer</option>
                      <option value="Home Care Transport">Home Care Transport</option>
                      <option value="รถพยาบาล">รถพยาบาล</option>
                      <option value="อุปกรณ์แพทย์">อุปกรณ์แพทย์</option>
                      <option value="ทีมงาน">ทีมงาน</option>
                      <option value="การทำภารกิจ">การทำภารกิจ</option>
                      <option value="ระบุเอง / หัวข้อแยกใหม่...">ระบุเอง / หัวข้อแยกใหม่...</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">วันที่ปฏิบัติภารกิจ (Date)</label>
                    <input 
                      type="date" 
                      required
                      value={workForm.date}
                      onChange={(e) => setWorkForm({ ...workForm, date: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                    />
                  </div>
                </div>

                {showCustomCategoryText && (
                  <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-700/50 space-y-2 transition-all duration-300">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">ระบุหัวข้อแยก / หมวดหมู่ใหม่เอง</label>
                    <input 
                      type="text" 
                      required
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      placeholder="ป้อนชื่อหัวข้อแยกใหม่ เช่น การอบรมปฐมพยาบาล หรือ งานจิตอาสา..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <span className="text-[10px] text-slate-400">หมวดหมู่นี้จะไปแสดงเป็นตัวกรองในหน้าคลังภาพ (Photo Gallery) ทันที</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">สถานที่เกิดเหตุ / จุดนำส่ง (Location)</label>
                    <input 
                      type="text" 
                      required
                      value={workForm.location}
                      onChange={(e) => setWorkForm({ ...workForm, location: e.target.value })}
                      placeholder="เช่น ชายหาดพัทยา หรือ โรงพยาบาลกรุงเทพ"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      รูปภาพผลงาน / แกลเลอรีภาพ (แนะนำใช้ภาพ Unsplash หรือคลาวด์ฝากรูป - เพิ่มได้หลายรูป)
                    </label>
                    
                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                      {(workForm.imageUrls || [workForm.imageUrl]).map((url, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-slate-900/20 border border-slate-800/80 p-3 rounded-2xl relative">
                          <span className="text-xs text-slate-500 font-bold absolute top-3 left-3">{idx + 1}.</span>
                          <div className="flex-1 pl-5">
                            <ImageUploader 
                              value={url}
                              onChange={(val) => {
                                const newUrls = [...(workForm.imageUrls || [workForm.imageUrl])];
                                newUrls[idx] = val;
                                setWorkForm({ 
                                  ...workForm, 
                                  imageUrls: newUrls,
                                  imageUrl: newUrls[0] || '' 
                                });
                              }}
                              placeholder="วางลิงก์ URL หรืออัปโหลดรูปภาพผลงาน..."
                            />
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const currentUrls = [...(workForm.imageUrls || [workForm.imageUrl])];
                              if (currentUrls.length > 1) {
                                const newUrls = currentUrls.filter((_, i) => i !== idx);
                                setWorkForm({ 
                                  ...workForm, 
                                  imageUrls: newUrls,
                                  imageUrl: newUrls[0] || ''
                                });
                              } else {
                                setWorkForm({ 
                                  ...workForm, 
                                  imageUrls: [''],
                                  imageUrl: ''
                                });
                              }
                            }}
                            className="p-2 bg-slate-800/60 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded-xl transition-colors border border-slate-700/40 cursor-pointer self-start"
                            title="ลบรูปภาพนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const currentUrls = [...(workForm.imageUrls || [workForm.imageUrl])];
                        setWorkForm({
                          ...workForm,
                          imageUrls: [...currentUrls, '']
                        });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-750 text-slate-300 hover:text-white text-[10px] font-bold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      เพิ่มลิ้งค์รูปภาพอื่นร่วมแกลเลอรี (แกลเลอรีรูปภาพ)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">รายละเอียดผลการปฏิบัติหน้าที่แบบเจาะลึก (Description)</label>
                  <textarea 
                    required
                    rows={4}
                    value={workForm.description}
                    onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })}
                    placeholder="ป้อนรายละเอียด จำนวนรถพยาบาล, จำนวนเจ้าหน้าที่, จำนวนผู้ประสบเหตุ และการปฐมพยาบาลเบื้องต้น..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed" 
                  />
                </div>

                <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowWorkModal(false)}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-bold text-white rounded-xl cursor-pointer shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{loading ? "กำลังเซฟ..." : "บันทึกข้อมูล"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editor: Custom Pages */}
        {showCustomPageModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <button 
                onClick={() => setShowCustomPageModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-slate-700 pb-3">
                <h3 className="font-bold text-lg text-white">
                  {editingCustomPageId ? "แก้ไขหน้าข้อมูลเพิ่มเติม" : "สร้างหน้าข้อมูลเพิ่มเติมใหม่"}
                </h3>
                <p className="text-xs text-slate-400">ระบุชื่อหน้าเว็บ, สลักลิงก์ (Slug), เนื้อหารายละเอียด และโครงสร้างการแสดงผลตามที่คุณกำหนด</p>
              </div>

              <form onSubmit={handleSaveCustomPage} className="space-y-4 text-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">ชื่อหัวข้อหน้าเว็บ (Title)</label>
                    <input 
                      type="text" 
                      required
                      value={customPageForm.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        const generatedSlug = val.toLowerCase().trim()
                          .replace(/[^\w\s-ก-๙]/g, '')
                          .replace(/\s+/g, '-');
                        setCustomPageForm({ 
                          ...customPageForm, 
                          title: val,
                          slug: customPageForm.slug ? customPageForm.slug : generatedSlug
                        });
                      }}
                      placeholder="เช่น อัตราค่าบริการขนส่ง"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">สลักลิงก์หน้าเว็บ (Slug)</label>
                    <input 
                      type="text" 
                      required
                      value={customPageForm.slug}
                      onChange={(e) => setCustomPageForm({ ...customPageForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="เช่น service-rates"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">ตัวอย่างลิงก์: /your-slug-here (ภาษาอังกฤษและขีดกลางเท่านั้น)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">สโลแกนใต้ชื่อเรื่อง (Tagline - เสริม)</label>
                  <input 
                    type="text" 
                    value={customPageForm.tagline || ''}
                    onChange={(e) => setCustomPageForm({ ...customPageForm, tagline: e.target.value })}
                    placeholder="เช่น รายละเอียดอัตราค่าบริการรถพยาบาลฉุกเฉินและรถส่งต่อทั่วนครหลวง"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">ลำดับการจัดเรียง</label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      value={customPageForm.order}
                      onChange={(e) => setCustomPageForm({ ...customPageForm, order: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">แสดงบนแถบเมนูหลัก</label>
                    <select
                      value={customPageForm.inMenu ? 'true' : 'false'}
                      onChange={(e) => setCustomPageForm({ ...customPageForm, inMenu: e.target.value === 'true' })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">แสดงผลใน Navbar</option>
                      <option value="false">ซ่อน (เข้าถึงผ่านลิงก์โดยตรง)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">โครงสร้างการแสดงผล (Layout)</label>
                    <select
                      value={customPageForm.layout || 'text-only'}
                      onChange={(e) => setCustomPageForm({ ...customPageForm, layout: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="text-only">เฉพาะข้อความอย่างเดียว (Text Only)</option>
                      <option value="split-image">ภาพประกอบด้านข้าง (Split Image)</option>
                      <option value="banner-image">แบนเนอร์ภาพเด่นด้านบน (Banner Image)</option>
                    </select>
                  </div>
                </div>

                {customPageForm.layout !== 'text-only' && (
                  <div>
                    <ImageUploader 
                      value={customPageForm.imageUrl || ''}
                      onChange={(val) => setCustomPageForm({ ...customPageForm, imageUrl: val })}
                      label="รูปภาพประกอบหน้าเว็บ (Page Image)"
                      placeholder="วางลิงก์รูปภาพประกอบ หรืออัปโหลดรูปตรงนี้..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">เนื้อหาหน้าเพจแบบเต็ม (รองรับอักษรปกติและหัวข้อ)</label>
                  <textarea 
                    required
                    rows={6}
                    value={customPageForm.content}
                    onChange={(e) => setCustomPageForm({ ...customPageForm, content: e.target.value })}
                    placeholder="เขียนรายละเอียดเนื้อหาที่คุณต้องการจัดแสดงในหน้านี้..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans" 
                  />
                </div>

                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/60 space-y-4">
                  <span className="text-xs font-bold text-blue-400 block">🎨 ปรับแต่งสีสันและพื้นหลังเฉพาะหน้าเว็บนี้</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">ประเภทพื้นหลัง (Background)</label>
                      <select
                        value={customPageForm.bgType || 'color'}
                        onChange={(e) => setCustomPageForm({ ...customPageForm, bgType: e.target.value as any })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="color">สีพื้นเดี่ยว</option>
                        <option value="image">รูปภาพพื้นหลัง</option>
                        <option value="gradient">สีไล่ระดับ (Gradient)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">ค่าพื้นหลัง (Background Value)</label>
                      <div className="flex gap-2">
                        {customPageForm.bgType === 'color' && (
                          <input 
                            type="color"
                            value={customPageForm.bgVal?.startsWith('#') && customPageForm.bgVal.length === 7 ? customPageForm.bgVal : '#ffffff'}
                            onChange={(e) => setCustomPageForm({ ...customPageForm, bgVal: e.target.value })}
                            className="w-9 h-9 rounded bg-slate-950 border border-slate-700 cursor-pointer p-0.5 flex-shrink-0"
                          />
                        )}
                        <input 
                          type="text" 
                          required
                          value={customPageForm.bgVal || ''}
                          onChange={(e) => setCustomPageForm({ ...customPageForm, bgVal: e.target.value })}
                          placeholder={
                            customPageForm.bgType === 'color' ? 'เช่น #ffffff, #0f172a' : 
                            customPageForm.bgType === 'image' ? 'เช่น https://images.unsplash.com/...' : 
                            'เช่น linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)'
                          }
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">สีของตัวอักษรบนหน้านี้ (Text Color)</label>
                      <div className="flex gap-2">
                        <input 
                          type="color"
                          value={customPageForm.textColor?.startsWith('#') && customPageForm.textColor.length === 7 ? customPageForm.textColor : '#1e293b'}
                          onChange={(e) => setCustomPageForm({ ...customPageForm, textColor: e.target.value })}
                          className="w-9 h-9 rounded bg-slate-950 border border-slate-700 cursor-pointer p-0.5 flex-shrink-0"
                        />
                        <input 
                          type="text" 
                          required
                          value={customPageForm.textColor || '#1e293b'}
                          onChange={(e) => setCustomPageForm({ ...customPageForm, textColor: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-end">
                      <span className="text-[10px] text-slate-500 leading-normal block">
                        ข้อแนะนำ: เลือกสีตัวอักษรที่มีค่า Contrast สูงกับสีพื้นหลังเพื่อให้อ่านได้ชัดเจนและง่ายต่อการใช้งาน
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowCustomPageModal(false)}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-bold text-white rounded-xl cursor-pointer shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{loading ? "กำลังเซฟ..." : "บันทึกหน้าเว็บ"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editor: Gallery Item */}
        {showGalleryModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <button 
                onClick={() => setShowGalleryModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-slate-700 pb-3">
                <h3 className="font-bold text-lg text-white">
                  {editingGalleryId ? "แก้ไขรูปภาพในคลังภาพ" : "เพิ่มรูปภาพใหม่เข้าคลังภาพ"}
                </h3>
                <p className="text-xs text-slate-400">ระบุรายละเอียดรูปภาพและประเภทจัดหมวดหมู่คลังภาพหลัก</p>
              </div>

              <form onSubmit={handleSaveGalleryItem} className="space-y-4 text-slate-200">
                <div>
                  <ImageUploader 
                    value={galleryForm.url || ''}
                    onChange={(val) => setGalleryForm({ ...galleryForm, url: val })}
                    label="รูปภาพผลงานคลังภาพ (Gallery Image)"
                    placeholder="วางลิงก์รูปภาพสาธารณะ หรืออัปโหลดไฟล์รูปตรงนี้..."
                  />
                  <p className="text-[10px] text-slate-500 mt-1">แนะนำรูปภาพอัตราส่วน 16:9 เพื่อความสวยงาม และระบบจะทำการย่อรูปให้อย่างดี</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">ชื่อรูปภาพ / หัวข้ออธิบายสั้น</label>
                  <input 
                    type="text" 
                    required
                    placeholder="เช่น รถพยาบาลฉุกเฉินระดับสูง (ALS) พร้อมทีมแพทย์"
                    value={galleryForm.title}
                    onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">หมวดหมู่แกลเลอรี</label>
                    <select 
                      value={galleryForm.category}
                      onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="รถพยาบาล">รถพยาบาล (Ambulance)</option>
                      <option value="อุปกรณ์แพทย์">อุปกรณ์แพทย์ (Medical Equipment)</option>
                      <option value="ทีมงาน">ทีมงาน (Our Team)</option>
                      <option value="การทำภารกิจ">การทำภารกิจ (Missions)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">ลำดับการจัดเรียง</label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      value={galleryForm.order}
                      onChange={(e) => setGalleryForm({ ...galleryForm, order: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">รายละเอียดความประทับใจ (คำอธิบายใต้ภาพ)</label>
                  <textarea 
                    rows={2}
                    placeholder="ระบุคำอธิบายสั้นๆ ของรูปภาพ (ถ้ามี)"
                    value={galleryForm.description}
                    onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed text-xs" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">วันที่ถ่ายภาพ</label>
                    <input 
                      type="text" 
                      placeholder="เช่น 15 มีนาคม 2567"
                      value={galleryForm.date}
                      onChange={(e) => setGalleryForm({ ...galleryForm, date: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">สถานที่</label>
                    <input 
                      type="text" 
                      placeholder="เช่น อ.เมือง จ.เชียงใหม่"
                      value={galleryForm.location}
                      onChange={(e) => setGalleryForm({ ...galleryForm, location: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowGalleryModal(false)}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-bold text-white rounded-xl cursor-pointer shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{loading ? "กำลังเซฟ..." : "บันทึกข้อมูลคลังภาพ"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Custom Confirmation Modal */}
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700/80 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${confirmDialog.isDanger ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {confirmDialog.title}
                </h3>
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed">
                {confirmDialog.message}
              </p>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  {confirmDialog.cancelText}
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  disabled={loading}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl cursor-pointer transition-all shadow ${
                    confirmDialog.isDanger 
                      ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800' 
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                  }`}
                >
                  {confirmDialog.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
