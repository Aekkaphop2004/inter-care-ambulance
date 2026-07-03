export interface CompanyConfig {
  title: string;
  tagline: string;
  description: string;
  emergencyPhone: string;
  contactPhone: string;
  lineId: string;
  facebookUrl: string;
  address: string;
  profileImageUrl: string;
  
  // Custom backgrounds for each section
  heroBgType?: 'color' | 'image' | 'gradient';
  heroBgVal?: string;
  heroTextColor?: string;
  servicesBgType?: 'color' | 'image' | 'gradient';
  servicesBgVal?: string;
  servicesTextColor?: string;
  servicesTitleColor?: string;
  servicesDescColor?: string;
  aboutBgType?: 'color' | 'image' | 'gradient';
  aboutBgVal?: string;
  aboutTextColor?: string;
  portfolioBgType?: 'color' | 'image' | 'gradient';
  portfolioBgVal?: string;
  portfolioTextColor?: string;
  contactBgType?: 'color' | 'image' | 'gradient';
  contactBgVal?: string;
  contactTextColor?: string;

  // Leadership / Director info
  directorName?: string;
  directorTitle?: string;
  directorQuote?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
  order: number;
}

export interface Work {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  location: string;
  imageUrl: string;
  imageUrls?: string[];
  createdAt: string;
}

export interface CustomPage {
  id: string;
  title: string;
  tagline?: string;
  content: string;
  order: number;
  bgType?: 'color' | 'image' | 'gradient';
  bgVal?: string;
  textColor?: string;
  imageUrl?: string;
  layout?: 'text-only' | 'split-image' | 'banner-image';
  inMenu: boolean;
  slug: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description?: string;
  imageUrl?: string;
  order: number;
}

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  category: string;
  description?: string;
  date?: string;
  location?: string;
  order: number;
}



