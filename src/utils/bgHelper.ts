import React from 'react';
import { CompanyConfig } from '../types';

export function isBgLight(type?: 'color' | 'image' | 'gradient', val?: string): boolean {
  if (!type || !val) return false;
  
  if (type === 'color') {
    const hex = val.replace('#', '').trim();
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return yiq >= 128;
    } else if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return yiq >= 128;
    }
    // Handle typical light CSS color names or defaults
    const lower = val.toLowerCase();
    if (lower === 'white' || lower === '#fff' || lower.startsWith('rgb(25') || lower.includes('255')) {
      return true;
    }
  } else if (type === 'gradient') {
    const lower = val.toLowerCase();
    // Simple heuristic for light gradients
    if (lower.includes('white') || lower.includes('#fff') || lower.includes('#f8') || lower.includes('#f1')) {
      return true;
    }
  } else if (type === 'image') {
    // We assume most custom background images might benefit from light text overlays by default,
    // but we can check if they specified a light image preset or we default to false.
    return false;
  }
  return false;
}

export function getSectionBgStyle(
  sectionName: 'hero' | 'services' | 'about' | 'portfolio' | 'contact',
  config: CompanyConfig,
  defaultClass: string = '',
  isDarkMode: boolean = false
) {
  const bgTypeKey = `${sectionName}BgType` as keyof CompanyConfig;
  const bgValKey = `${sectionName}BgVal` as keyof CompanyConfig;

  let bgType = config[bgTypeKey] as 'color' | 'image' | 'gradient' | undefined;
  let bgVal = config[bgValKey] as string | undefined;

  let style: React.CSSProperties = {};
  let className = defaultClass;

  // In dark mode, map light background utility classes to dark equivalents
  if (isDarkMode) {
    className = className.replace(/\bbg-slate-50\b/g, 'bg-slate-900');
    className = className.replace(/\bbg-white\b/g, 'bg-slate-950');
    className = className.replace(/\bbg-gray-50\b/g, 'bg-slate-900');
    className = className.replace(/\bbg-slate-100\b/g, 'bg-slate-900');
  }

  if (bgType && bgVal) {
    let activeBgType = bgType;
    let activeBgVal = bgVal;

    // In dark mode, if the custom background is a light color or light gradient, override to dark slate
    if (isDarkMode && isBgLight(bgType, bgVal)) {
      activeBgType = 'color';
      activeBgVal = (sectionName === 'about' || sectionName === 'portfolio') ? '#0f172a' : '#020617'; // slate-900 or slate-950
    }

    if (activeBgType === 'color') {
      style = { backgroundColor: activeBgVal };
      // Strip typical background color classes like bg-slate-900, bg-white, bg-slate-50, etc.
      className = className.replace(/\bbg-(?:slate|white|gray|stone|neutral|zinc|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\S+/g, '');
    } else if (activeBgType === 'image') {
      style = {
        backgroundImage: `url(${activeBgVal})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
      className = className.replace(/\bbg-(?:slate|white|gray|stone|neutral|zinc|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\S+/g, '');
    } else if (activeBgType === 'gradient') {
      if (activeBgVal.includes('gradient')) {
        style = { background: activeBgVal };
        className = className.replace(/\bbg-(?:slate|white|gray|stone|neutral|zinc|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\S+/g, '');
      } else {
        className = className.replace(/\bbg-(?:slate|white|gray|stone|neutral|zinc|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\S+/g, '') + ' ' + activeBgVal;
      }
    }
  }

  const isLight = isDarkMode ? false : isBgLight(bgType, bgVal);

  return { style, className, isLight };
}

