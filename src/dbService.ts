import { db, auth } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  collection, 
  addDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { signInAnonymously, signOut } from 'firebase/auth';
import { CompanyConfig, Service, Work, CustomPage, TeamMember, GalleryItem } from './types';
import { DEFAULT_COMPANY, DEFAULT_SERVICES, DEFAULT_WORKS, DEFAULT_TEAM, DEFAULT_GALLERY } from './data';

// Firestore Error Types as required by the Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Fetch general company configuration
export async function getCompanyConfig(): Promise<CompanyConfig> {
  const docRef = doc(db, 'config', 'company');
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CompanyConfig;
    } else {
      // ONLY attempt auto-seed if user is authenticated to prevent permission-denied console logs
      if (auth.currentUser) {
        try {
          await setDoc(docRef, DEFAULT_COMPANY);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'config/company');
        }
      }
      return DEFAULT_COMPANY;
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission')) {
      handleFirestoreError(error, OperationType.GET, 'config/company');
    }
    console.warn("Firestore error reading company config, falling back to local defaults:", error);
    return DEFAULT_COMPANY;
  }
}

// Update general company configuration
export async function updateCompanyConfig(config: CompanyConfig): Promise<void> {
  const docRef = doc(db, 'config', 'company');
  try {
    await setDoc(docRef, config);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'config/company');
  }
}

// Fetch services
export async function getServices(): Promise<Service[]> {
  const colRef = collection(db, 'services');
  try {
    const snap = await getDocs(colRef);
    if (snap.empty) {
      // ONLY attempt auto-seed if user is authenticated to prevent permission-denied console logs
      if (auth.currentUser) {
        const seeded: Service[] = [];
        try {
          for (const s of DEFAULT_SERVICES) {
            await setDoc(doc(db, 'services', s.id), {
              title: s.title,
              description: s.description,
              iconName: s.iconName,
              order: s.order
            });
            seeded.push(s);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'services');
        }
        return seeded.sort((a, b) => a.order - b.order);
      }
      return DEFAULT_SERVICES;
    } else {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Service));
      return list.sort((a, b) => a.order - b.order);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission')) {
      handleFirestoreError(error, OperationType.GET, 'services');
    }
    console.warn("Firestore error reading services, falling back to local defaults:", error);
    return DEFAULT_SERVICES;
  }
}

// Helpers to ensure collections are seeded before write operations if they are empty
async function ensureServicesSeeded(): Promise<void> {
  const colRef = collection(db, 'services');
  const snap = await getDocs(colRef);
  if (snap.empty) {
    for (const s of DEFAULT_SERVICES) {
      await setDoc(doc(db, 'services', s.id), {
        title: s.title,
        description: s.description,
        iconName: s.iconName,
        order: s.order
      });
    }
  }
}

async function ensureWorksSeeded(): Promise<void> {
  const colRef = collection(db, 'works');
  const snap = await getDocs(colRef);
  if (snap.empty) {
    for (const w of DEFAULT_WORKS) {
      await setDoc(doc(db, 'works', w.id), {
        title: w.title,
        description: w.description,
        date: w.date,
        category: w.category,
        location: w.location,
        imageUrl: w.imageUrl,
        imageUrls: [w.imageUrl],
        createdAt: w.createdAt || new Date().toISOString()
      });
    }
  }
}

// Save (Create/Update) service
export async function saveService(service: Omit<Service, 'id'> & { id?: string }): Promise<void> {
  try {
    await ensureServicesSeeded();
  } catch (e) {
    console.warn("Failed to ensure services are seeded:", e);
  }

  if (service.id) {
    const docRef = doc(db, 'services', service.id);
    try {
      await setDoc(docRef, {
        title: service.title,
        description: service.description,
        iconName: service.iconName,
        order: Number(service.order)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `services/${service.id}`);
    }
  } else {
    const colRef = collection(db, 'services');
    try {
      await addDoc(colRef, {
        title: service.title,
        description: service.description,
        iconName: service.iconName,
        order: Number(service.order)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'services');
    }
  }
}

// Delete service
export async function deleteService(id: string): Promise<void> {
  try {
    await ensureServicesSeeded();
  } catch (e) {
    console.warn("Failed to ensure services are seeded before deletion:", e);
  }

  const docRef = doc(db, 'services', id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `services/${id}`);
  }
}

// Fetch works
export async function getWorks(): Promise<Work[]> {
  const colRef = collection(db, 'works');
  try {
    const snap = await getDocs(colRef);
    if (snap.empty) {
      // ONLY attempt auto-seed if user is authenticated to prevent permission-denied console logs
      if (auth.currentUser) {
        const seeded: Work[] = [];
        try {
          for (const w of DEFAULT_WORKS) {
            await setDoc(doc(db, 'works', w.id), {
              title: w.title,
              description: w.description,
              date: w.date,
              category: w.category,
              location: w.location,
              imageUrl: w.imageUrl,
              createdAt: w.createdAt
            });
            seeded.push(w);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'works');
        }
        return seeded.sort((a, b) => b.date.localeCompare(a.date));
      }
      return DEFAULT_WORKS;
    } else {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Work));
      return list.sort((a, b) => b.date.localeCompare(a.date));
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission')) {
      handleFirestoreError(error, OperationType.GET, 'works');
    }
    console.warn("Firestore error reading works, falling back to local defaults:", error);
    return DEFAULT_WORKS;
  }
}

// Save (Create/Update) work
export async function saveWork(work: Omit<Work, 'id'> & { id?: string }): Promise<void> {
  try {
    await ensureWorksSeeded();
  } catch (e) {
    console.warn("Failed to ensure works are seeded:", e);
  }

  const payload = {
    title: work.title,
    description: work.description,
    date: work.date,
    category: work.category,
    location: work.location,
    imageUrl: work.imageUrl,
    imageUrls: work.imageUrls || [],
    createdAt: work.createdAt || new Date().toISOString()
  };

  if (work.id) {
    const docRef = doc(db, 'works', work.id);
    try {
      await setDoc(docRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `works/${work.id}`);
    }
  } else {
    const colRef = collection(db, 'works');
    try {
      await addDoc(colRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'works');
    }
  }
}

// Delete work
export async function deleteWork(id: string): Promise<void> {
  try {
    await ensureWorksSeeded();
  } catch (e) {
    console.warn("Failed to ensure works are seeded before deletion:", e);
  }

  const docRef = doc(db, 'works', id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `works/${id}`);
  }
}

// Admin passcode authentication
export async function authenticateAdmin(passcode: string): Promise<boolean> {
  let isValid = false;
  try {
    const docRef = doc(db, 'config', 'passcode');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.passcode) {
        isValid = passcode === data.passcode;
      } else {
        isValid = (passcode === 'intercare2026' || passcode === 'admin123');
      }
    } else {
      isValid = (passcode === 'intercare2026' || passcode === 'admin123');
    }
  } catch (e) {
    console.warn("Error checking passcode from firestore, falling back to static defaults:", e);
    isValid = (passcode === 'intercare2026' || passcode === 'admin123');
  }

  if (isValid) {
    return true;
  }
  return false;
}

export interface MfaSettings {
  mfaEnabled: boolean;
  mfaSecret: string;
}

// Fetch admin MFA configuration
export async function getMfaSettings(): Promise<MfaSettings> {
  try {
    const docRef = doc(db, 'config', 'passcode');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        mfaEnabled: !!data.mfaEnabled,
        mfaSecret: data.mfaSecret || ''
      };
    }
  } catch (e) {
    console.warn("Error checking MFA config from firestore:", e);
  }
  return { mfaEnabled: false, mfaSecret: '' };
}

// Update admin MFA configuration
export async function updateMfaSettings(mfaEnabled: boolean, mfaSecret: string): Promise<void> {
  const docRef = doc(db, 'config', 'passcode');
  try {
    await setDoc(docRef, { mfaEnabled, mfaSecret }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'config/passcode');
  }
}

// Update admin passcode
export async function updateAdminPasscode(newPasscode: string): Promise<void> {
  const docRef = doc(db, 'config', 'passcode');
  try {
    await setDoc(docRef, { passcode: newPasscode }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'config/passcode');
  }
}

// Admin logout
export async function logoutAdmin(): Promise<void> {
  // Local session is cleared in UI state, no need to sign out of firebase auth
}

// Fetch custom pages/sections
export async function getCustomPages(): Promise<CustomPage[]> {
  const colRef = collection(db, 'customPages');
  try {
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return [];
    } else {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomPage));
      return list.sort((a, b) => a.order - b.order);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission')) {
      handleFirestoreError(error, OperationType.GET, 'customPages');
    }
    console.warn("Firestore error reading customPages:", error);
    return [];
  }
}

// Save (Create/Update) custom page
export async function saveCustomPage(page: Omit<CustomPage, 'id'> & { id?: string }): Promise<void> {
  const payload = {
    title: page.title,
    tagline: page.tagline || '',
    content: page.content || '',
    order: Number(page.order) || 0,
    bgType: page.bgType || 'color',
    bgVal: page.bgVal || '#ffffff',
    textColor: page.textColor || '',
    imageUrl: page.imageUrl || '',
    layout: page.layout || 'text-only',
    inMenu: page.inMenu !== undefined ? page.inMenu : true,
    slug: page.slug || '',
    createdAt: page.createdAt || new Date().toISOString()
  };

  if (page.id) {
    const docRef = doc(db, 'customPages', page.id);
    try {
      await setDoc(docRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `customPages/${page.id}`);
    }
  } else {
    const colRef = collection(db, 'customPages');
    try {
      await addDoc(colRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'customPages');
    }
  }
}

// Delete custom page
export async function deleteCustomPage(id: string): Promise<void> {
  const docRef = doc(db, 'customPages', id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `customPages/${id}`);
  }
}

// Fetch team members
export async function getTeamMembers(): Promise<TeamMember[]> {
  const colRef = collection(db, 'team');
  try {
    const snap = await getDocs(colRef);
    if (snap.empty) {
      // ONLY attempt auto-seed if user is authenticated to prevent permission-denied console logs
      if (auth.currentUser) {
        const seeded: TeamMember[] = [];
        try {
          for (const m of DEFAULT_TEAM) {
            await setDoc(doc(db, 'team', m.id), {
              name: m.name,
              role: m.role,
              description: m.description || '',
              imageUrl: m.imageUrl || '',
              order: m.order
            });
            seeded.push(m);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'team');
        }
        return seeded.sort((a, b) => a.order - b.order);
      }
      return DEFAULT_TEAM;
    } else {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as TeamMember));
      return list.sort((a, b) => a.order - b.order);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission')) {
      handleFirestoreError(error, OperationType.GET, 'team');
    }
    console.warn("Firestore error reading team, falling back to local defaults:", error);
    return DEFAULT_TEAM;
  }
}

async function ensureTeamSeeded(): Promise<void> {
  const colRef = collection(db, 'team');
  const snap = await getDocs(colRef);
  if (snap.empty) {
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
}

async function ensureGallerySeeded(): Promise<void> {
  const colRef = collection(db, 'gallery');
  const snap = await getDocs(colRef);
  if (snap.empty) {
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
}

// Save (Create/Update) team member
export async function saveTeamMember(member: Omit<TeamMember, 'id'> & { id?: string }): Promise<void> {
  try {
    await ensureTeamSeeded();
  } catch (e) {
    console.warn("Failed to ensure team is seeded:", e);
  }

  const payload = {
    name: member.name,
    role: member.role,
    description: member.description || '',
    imageUrl: member.imageUrl || '',
    order: Number(member.order) || 0
  };

  if (member.id) {
    const docRef = doc(db, 'team', member.id);
    try {
      await setDoc(docRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `team/${member.id}`);
    }
  } else {
    const colRef = collection(db, 'team');
    try {
      await addDoc(colRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'team');
    }
  }
}

// Delete team member
export async function deleteTeamMember(id: string): Promise<void> {
  try {
    await ensureTeamSeeded();
  } catch (e) {
    console.warn("Failed to ensure team is seeded before deletion:", e);
  }

  const docRef = doc(db, 'team', id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `team/${id}`);
  }
}

// Fetch gallery items
export async function getGalleryItems(): Promise<GalleryItem[]> {
  const colRef = collection(db, 'gallery');
  try {
    const snap = await getDocs(colRef);
    if (snap.empty) {
      if (auth.currentUser) {
        const seeded: GalleryItem[] = [];
        try {
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
            seeded.push(g);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'gallery');
        }
        return seeded.sort((a, b) => a.order - b.order);
      }
      return DEFAULT_GALLERY;
    } else {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem));
      return list.sort((a, b) => a.order - b.order);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission')) {
      handleFirestoreError(error, OperationType.GET, 'gallery');
    }
    console.warn("Firestore error reading gallery, falling back to local defaults:", error);
    return DEFAULT_GALLERY;
  }
}

// Save (Create/Update) gallery item
export async function saveGalleryItem(item: Omit<GalleryItem, 'id'> & { id?: string }): Promise<void> {
  try {
    await ensureGallerySeeded();
  } catch (e) {
    console.warn("Failed to ensure gallery is seeded:", e);
  }

  const payload = {
    url: item.url,
    title: item.title,
    category: item.category,
    description: item.description || '',
    date: item.date || '',
    location: item.location || '',
    order: Number(item.order) || 0
  };

  if (item.id) {
    const docRef = doc(db, 'gallery', item.id);
    try {
      await setDoc(docRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `gallery/${item.id}`);
    }
  } else {
    const colRef = collection(db, 'gallery');
    try {
      await addDoc(colRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gallery');
    }
  }
}

// Delete gallery item
export async function deleteGalleryItem(id: string): Promise<void> {
  try {
    await ensureGallerySeeded();
  } catch (e) {
    console.warn("Failed to ensure gallery is seeded before deletion:", e);
  }

  const docRef = doc(db, 'gallery', id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `gallery/${id}`);
  }
}



