import { CompanyConfig, Service, Work, TeamMember, GalleryItem } from './types';

export const DEFAULT_COMPANY: CompanyConfig = {
  title: "Inter Care Ambulance",
  tagline: "บริการรถพยาบาลรับ-ส่งผู้ป่วย เคลื่อนย้ายผู้ป่วยฉุกเฉิน และสแตนด์บายงานอีเวนต์ ตลอด 24 ชั่วโมง",
  description: "อินเตอร์ แคร์ แอมบูแลนซ์ (Inter Care Ambulance) คือผู้ให้บริการรถพยาบาลเอกชนมาตรฐานสากล มุ่งเน้นการให้บริการเคลื่อนย้ายและดูแลผู้ป่วยด้วยความปลอดภัยสูงสุด โดยทีมบุคลากรทางการแพทย์ แพทย์ พยาบาลวิชาชีพ และเจ้าหน้าที่เวชกิจฉุกเฉินที่มีประสบการณ์สูง พร้อมอุปกรณ์การแพทย์ช่วยชีวิตที่ทันสมัยเทียบเท่าห้องฉุกเฉินเคลื่อนที่ เพื่อให้คุณมั่นใจในทุกวินาทีของการเดินทาง",
  emergencyPhone: "095-888-1669",
  contactPhone: "02-114-8169",
  lineId: "@intercare_amb",
  facebookUrl: "https://facebook.com/intercare.ambulance",
  address: "456/8 ถนนศรีนครินทร์ แขวงหนองบอน เขตประเวศ กรุงเทพมหานคร 10250",
  profileImageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&h=400&q=80",
  
  // Default backgrounds
  heroBgType: 'gradient',
  heroBgVal: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  heroTextColor: '',
  servicesBgType: 'color',
  servicesBgVal: '#ffffff',
  servicesTextColor: '',
  servicesTitleColor: '',
  servicesDescColor: '#fca5a5',
  aboutBgType: 'color',
  aboutBgVal: '#f8fafc',
  aboutTextColor: '',
  portfolioBgType: 'color',
  portfolioBgVal: '#f8fafc',
  portfolioTextColor: '',
  contactBgType: 'gradient',
  contactBgVal: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
  contactTextColor: '',
  
  // Default leadership values
  directorName: "นพ. รณเดช อัศวเวชศาสตร์",
  directorTitle: "ผู้อำนวยการด้านการดูแลผู้ป่วย Inter Care",
  directorQuote: "ความรวดเร็วและปลอดภัยของคนไข้คือสิ่งที่พวกเรายึดมั่นที่สุด ทุกวินาทีในรถพยาบาลคือภารกิจช่วยชีวิตที่ต้องอาศัยความถูกต้องแม่นยำระดับมืออาชีพ"
};

export const DEFAULT_SERVICES: Service[] = [
  {
    id: "serv-1",
    title: "รถพยาบาลฉุกเฉินระดับสูง (ALS)",
    description: "รถพยาบาลเคลื่อนย้ายผู้ป่วยวิกฤต (Advanced Life Support) พร้อมอุปกรณ์ช่วยชีวิตครบครัน เช่น เครื่องช่วยหายใจ เครื่องกระตุกหัวใจ (AED/Defibrillator) เครื่องวัดสัญญาณชีพ และยาสามัญสำหรับผู้ป่วยฉุกเฉิน พร้อมแพทย์หรือพยาบาลวิชาชีพดูแลอย่างใกล้ชิด",
    iconName: "Activity",
    order: 1
  },
  {
    id: "serv-2",
    title: "เคลื่อนย้ายผู้ป่วยทั่วประเทศ (BLS)",
    description: "บริการรับ-ส่งและเคลื่อนย้ายผู้ป่วยทั่วไป ผู้ป่วยติดเตียง ผู้สูงอายุ หรือผู้ป่วยที่ต้องการออกซิเจน เพื่อย้ายโรงพยาบาล ไปตรวจตามนัด ไปศูนย์ฟอกไต หรือเดินทางกลับภูมิลำเนาทั่วไทย ด้วยรถพยาบาลมาตรฐาน ปลอดภัย และราคาเป็นกันเอง",
    iconName: "Truck",
    order: 2
  },
  {
    id: "serv-3",
    title: "รถพยาบาลเฝ้าระวังเหตุ (Event Standby)",
    description: "บริการส่งทีมแพทย์ พยาบาล กู้ชีพ และรถพยาบาลฉุกเฉินไปสแตนด์บายดูแลความปลอดภัยในงานอีเวนต์ต่าง ๆ เช่น คอนเสิร์ต งานแข่งขันกีฬา งานสัมมนา กองถ่ายภาพยนตร์ หรืองานประชุมขนาดใหญ่ พร้อมเผชิญเหตุฉุกเฉินตลอดเวลา",
    iconName: "ShieldAlert",
    order: 3
  },
  {
    id: "serv-4",
    title: "รับ-ส่งตรวจพบแพทย์ (Home Care)",
    description: "บริการอำนวยความสะดวกรับผู้สูงอายุหรือผู้ป่วยติดเตียงจากเตียงนอนในบ้าน เดินทางไปโรงพยาบาลตามที่แพทย์นัดหมาย และคอยดูแลส่งกลับถึงเตียงนอนอย่างปลอดภัย สะดวกสบาย ลดภาระและความกังวลของญาติ",
    iconName: "HeartPulse",
    order: 4
  }
];

export const DEFAULT_WORKS: Work[] = [
  {
    id: "work-1",
    title: "สแตนด์บายงานเทศกาลดนตรีระดับประเทศ 2026",
    description: "จัดทีมแพทย์ 2 ท่าน พยาบาลวิชาชีพ 6 ท่าน และรถพยาบาลฉุกเฉินระดับ ALS จำนวน 3 คัน สแตนด์บายเฝ้าระวังเหตุฉุกเฉิน ตลอดการจัดงานเทศกาลดนตรี 3 วัน 3 คืน ดูแลผู้ร่วมงานกว่า 25,000 คน สรุปเคสปฐมพยาบาล 120 ราย และส่งต่อโรงพยาบาลอย่างรวดเร็ว 2 ราย",
    date: "2026-05-15",
    category: "Event Standby",
    location: "สนามราชมังคลากีฬาสถาน กรุงเทพฯ",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-05-16T10:00:00Z"
  },
  {
    id: "work-2",
    title: "เคลื่อนย้ายผู้ป่วยวิกฤตติดเครื่องช่วยหายใจทางไกล (ICU to ICU)",
    description: "ปฏิบัติภารกิจเคลื่อนย้ายผู้ป่วยชายสูงอายุ อาการวิกฤต ติดสายเครื่องช่วยหายใจและเครื่องให้ยาทางหลอดเลือดดำ (Infusion Pump) ย้ายโรงพยาบาลจาก กรุงเทพฯ ไปยังศูนย์แพทย์ จังหวัดเชียงใหม่ ระยะทางรวม 690 กิโลเมตร โดยทีมแพทย์เวชศาสตร์ฉุกเฉินและพยาบาลวิชาชีพอย่างปลอดภัยตลอด 8 ชั่วโมง",
    date: "2026-06-02",
    category: "ICU Transfer",
    location: "โรงพยาบาลกรุงเทพ - โรงพยาบาลมหาราชนครเชียงใหม่",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-06-03T11:30:00Z"
  },
  {
    id: "work-3",
    title: "สแตนด์บายงานแข่งขันไตรกีฬานานาชาติ",
    description: "ปฏิบัติงานร่วมกับสมาคมกีฬาดูแลนักกีฬาตลอดเส้นทาง วิ่ง ปั่นจักรยาน และว่ายน้ำ เตรียมจุดพยาบาลสนาม 4 จุด และทีมกู้ชีพมอเตอร์ไซค์เคลื่อนที่เร็ว (First Responder Motorbike) เข้าถึงผู้บาดเจ็บถลอกจากการล้มและตะคริวได้อย่างรวดเร็ว",
    date: "2026-04-18",
    category: "Event Standby",
    location: "ชายหาดพัทยา ชลบุรี",
    imageUrl: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-04-19T09:15:00Z"
  },
  {
    id: "work-4",
    title: "บริการรับ-ส่งดูแลผู้สูงอายุฟอกไตสัปดาห์ละ 3 วัน",
    description: "โครงการดูแลระยะยาวสำหรับผู้ป่วยสูงอายุติดเตียงเคลื่อนย้ายลำบาก ทีมงานเข้าอุ้มยกตัวผู้ป่วยด้วยบอร์ดเคลื่อนย้ายมาตรฐาน และรับส่งสัปดาห์ละ 3 วันตามตารางฟอกไต อำนวยความสะดวกประสานงานห้องฟอกไตจนเสร็จภารกิจ",
    date: "2026-06-20",
    category: "Home Care Transport",
    location: "บ้านผู้ป่วย เขตบางนา - ศูนย์ฟอกไตกรุงเทพ",
    imageUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-06-21T08:00:00Z"
  }
];

export const DEFAULT_TEAM: TeamMember[] = [
  {
    id: "member-1",
    name: "นพ. รณเดช อัศวเวชศาสตร์",
    role: "ผู้อำนวยการด้านการดูแลผู้ป่วย (Medical Director)",
    description: "แพทย์ผู้เชี่ยวชาญด้านเวชศาสตร์ฉุกเฉิน ประสบการณ์กว่า 15 ปีในการประสานงานดูแลผู้ป่วยวิกฤต",
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
    order: 1
  },
  {
    id: "member-2",
    name: "พว. กานดา รักดี",
    role: "หัวหน้าพยาบาลวิชาชีพดูแลการเคลื่อนย้าย (Head Nurse)",
    description: "พยาบาลวิชาชีพเฉพาะทางด้านการดูแลผู้ป่วยฉุกเฉินและผู้ป่วยวิกฤต (Critical Care Transit)",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    order: 2
  },
  {
    id: "member-3",
    name: "คุณวิชัย สุขใจ",
    role: "เจ้าหน้าที่กู้ชีพเวชกิจฉุกเฉินระดับสูง (Senior EMT-P)",
    description: "ผู้เชี่ยวชาญการขับขี่รถพยาบาลและการกู้ชีพ ช่วยฟื้นคืนชีพขั้นต้นอย่างชำนาญการ",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    order: 3
  }
];

export const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: "gallery-1",
    url: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80",
    title: "รถพยาบาลฉุกเฉินและอุปกรณ์ช่วยชีวิตพร้อมปฏิบัติการ",
    category: "รถพยาบาล",
    description: "รถพยาบาลขั้นสูงมาตรฐานสากล สแตนด์บายพร้อมดูแลคนไข้ตลอด 24 ชั่วโมง",
    date: "2026-06-10",
    location: "กรุงเทพมหานคร",
    order: 1
  },
  {
    id: "gallery-2",
    url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    title: "ห้องฉุกเฉินเคลื่อนที่ระดับเตียงวิกฤต (ALS Cabin)",
    category: "อุปกรณ์แพทย์",
    description: "ห้องโดยสารรถพยาบาล ALS เพียบพร้อมด้วยเตียงลดแรงกระแทก ถังออกซิเจน และเครื่องกระตุกหัวใจ",
    date: "2026-06-12",
    location: "กรุงเทพมหานคร",
    order: 2
  },
  {
    id: "gallery-3",
    url: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80",
    title: "การประสานงานของทีมแพทย์และกู้ชีพวิชาชีพ",
    category: "ทีมงาน",
    description: "แพทย์เวชศาสตร์ฉุกเฉินและพยาบาลส่งต่อข้อมูลและตรวจสัญญาณชีพอย่างรอบคอบ",
    date: "2026-06-15",
    location: "ศูนย์บัญชาการระบบวิทยุ",
    order: 3
  },
  {
    id: "gallery-4",
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    title: "ทีมงานสแตนด์บายเฝ้าระวังเหตุในเทศกาลดนตรี",
    category: "การทำภารกิจ",
    description: "เตรียมพร้อมเผชิญเหตุ ณ จุดปฐมพยาบาลหลักเพื่อความปลอดภัยสูงสุดของทุกคนในงาน",
    date: "2026-05-15",
    location: "สนามราชมังคลากีฬาสถาน",
    order: 4
  },
  {
    id: "gallery-5",
    url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80",
    title: "อุปกรณ์ตรวจวัดสัญญาณชีพและประเมินอาการเบื้องต้น",
    category: "อุปกรณ์แพทย์",
    description: "ความแม่นยำของอุปกรณ์ช่วยส่งผ่านข้อมูลผู้ป่วยแบบ Real-time ไปยังโรงพยาบาลปลายทาง",
    date: "2026-05-20",
    location: "รถพยาบาลเคลื่อนที่",
    order: 5
  },
  {
    id: "gallery-6",
    url: "https://images.unsplash.com/photo-1513224502586-d1e602410265?auto=format&fit=crop&w=1200&q=80",
    title: "รถกู้ชีพและการฝึกซ้อมการเคลื่อนย้ายทางดิ่ง",
    category: "การทำภารกิจ",
    description: "เพิ่มทักษะและทบทวนมาตรฐานการช่วยเหลือผู้ประสบภัยในพื้นที่ลาดชันและอพยพสูง",
    date: "2026-04-10",
    location: "ศูนย์ฝึกอบรมการกู้ชีพ",
    order: 6
  }
];

