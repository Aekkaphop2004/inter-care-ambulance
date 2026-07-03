import React from 'react';
import { CustomPage } from '../types';
import { ArrowLeft, Edit, FileText, ExternalLink } from 'lucide-react';
import { isBgLight } from '../utils/bgHelper';

interface CustomPageViewProps {
  page: CustomPage;
  isAdmin: boolean;
  onBackToHome: () => void;
  onDirectEdit: (tab: 'company' | 'services' | 'works' | 'passcode' | 'customPages', fieldId?: string) => void;
  isDarkMode?: boolean;
}

export default function CustomPageView({ page, isAdmin, onBackToHome, onDirectEdit, isDarkMode = false }: CustomPageViewProps) {
  // Determine if background is light or dark to set fallback text color
  const bgType = page.bgType || 'color';
  const bgVal = page.bgVal || '#ffffff';
  const isLight = isDarkMode ? false : isBgLight(bgType, bgVal);

  let style: React.CSSProperties = {};
  if (isDarkMode && (bgVal === '#ffffff' || bgVal === 'white' || !bgVal || bgVal === '')) {
    style = { backgroundColor: '#090d16' };
  } else if (bgType === 'color') {
    style = { backgroundColor: bgVal };
  } else if (bgType === 'image' && bgVal) {
    style = {
      backgroundImage: `url(${bgVal})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  } else if (bgType === 'gradient' && bgVal) {
    style = { background: bgVal };
  }

  const hasBgImage = bgType === 'image' && bgVal;
  const outerStyle = { ...style };
  if (hasBgImage) {
    delete outerStyle.backgroundImage;
    delete outerStyle.backgroundSize;
    delete outerStyle.backgroundPosition;
    delete outerStyle.backgroundRepeat;
  }

  // Set standard overlay for background image to ensure text is highly readable
  const showOverlay = bgType === 'image';

  // Lightweight robust Markdown-like Rich Text Parser
  const renderRichContent = (content: string) => {
    if (!content) return null;
    
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    const flushList = (key: string | number) => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="list-disc pl-6 space-y-1.5 mb-5 mt-2">
            {currentList}
          </ul>
        );
        currentList = [];
      }
    };

    const parseInlineStyles = (text: string): React.ReactNode[] => {
      // Regex pattern to catch both **bold** and [text](url)
      const pattern = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
      const parts = text.split(pattern);
      
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-extrabold text-slate-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
          const midIdx = part.indexOf('](');
          const linkText = part.substring(1, midIdx);
          const url = part.substring(midIdx + 2, part.length - 1);
          return (
            <a 
              key={i} 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-500 hover:underline inline-flex items-center gap-0.5 font-bold transition-colors"
            >
              {linkText}
              <ExternalLink className="w-3 h-3 inline" />
            </a>
          );
        }
        return part;
      });
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Headers (e.g. ### Subheading)
      if (trimmed.startsWith('### ')) {
        flushList(index);
        elements.push(
          <h4 key={index} className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-200 mt-6 mb-2.5">
            {parseInlineStyles(trimmed.slice(4))}
          </h4>
        );
      } else if (trimmed.startsWith('## ')) {
        flushList(index);
        elements.push(
          <h3 key={index} className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-8 mb-3.5 border-b border-slate-200/40 pb-2">
            {parseInlineStyles(trimmed.slice(3))}
          </h3>
        );
      } else if (trimmed.startsWith('# ')) {
        flushList(index);
        elements.push(
          <h2 key={index} className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-10 mb-5 border-b border-slate-300 dark:border-slate-700 pb-2.5">
            {parseInlineStyles(trimmed.slice(2))}
          </h2>
        );
      } 
      // Bullet list item
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        currentList.push(
          <li key={`li-${index}`} className="leading-relaxed">
            {parseInlineStyles(trimmed.slice(2))}
          </li>
        );
      } 
      // Empty line -> break paragraph list
      else if (trimmed === '') {
        flushList(index);
      } 
      // Regular content line
      else {
        flushList(index);
        elements.push(
          <p key={index} className="mb-4 leading-relaxed whitespace-pre-wrap">
            {parseInlineStyles(line)}
          </p>
        );
      }
    });

    flushList('final');
    return elements;
  };

  return (
    <div 
      style={outerStyle} 
      className="min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 relative transition-all duration-300 overflow-hidden"
    >
      {/* Responsive Background Image Layer */}
      {hasBgImage && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div 
            style={{ backgroundImage: `url(${bgVal})` }}
            className="absolute inset-0 bg-cover bg-center"
          />
          {/* Ambient overlay to ensure text readability */}
          <div className={`absolute inset-0 ${
            isLight 
              ? 'bg-white/80' 
              : 'bg-slate-950/80'
          }`} />
        </div>
      )}

      {/* Semi-transparent dark or light overlay for background images on desktop */}
      {showOverlay && !hasBgImage && (
        <div className={`absolute inset-0 z-0 ${isLight ? 'bg-white/80' : 'bg-slate-950/80'}`} />
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Navigation & Admin Edit Bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={onBackToHome}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800' 
                : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            กลับไปหน้าหลัก
          </button>

          {isAdmin && (
            <button
              onClick={() => onDirectEdit('customPages', `page-edit-${page.id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer animate-pulse"
            >
              <Edit className="w-3.5 h-3.5" />
              แก้ไขหน้านี้ในหลังบ้าน
            </button>
          )}
        </div>

        {/* Page Container */}
        <div className={`rounded-3xl shadow-xl overflow-hidden border ${
          isLight 
            ? 'bg-white/90 backdrop-blur-md border-slate-100' 
            : 'bg-slate-900/90 backdrop-blur-md border-slate-800'
        }`}>
          
          {/* Layout: Banner Image on top if specified */}
          {page.layout === 'banner-image' && page.imageUrl && (
            <div className="w-full h-64 sm:h-80 md:h-96 relative overflow-hidden">
              <img 
                src={page.imageUrl} 
                alt={page.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </div>
          )}

          <div className="p-6 sm:p-10 md:p-12">
            
            {/* Header Content */}
            <div className="mb-8 border-b border-slate-200/50 pb-6">
              <div className="flex items-center gap-2.5 text-rose-500 font-bold text-xs uppercase tracking-wider mb-2">
                <FileText className="w-4 h-4 text-rose-500" />
                <span>INTER CARE PAGE • หน้าข้อมูลเพิ่มเติม</span>
              </div>
              
              <h1 
                style={page.textColor ? { color: page.textColor } : undefined}
                className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {page.title}
              </h1>

              {page.tagline && (
                <p 
                  style={page.textColor ? { color: page.textColor, opacity: 0.8 } : undefined}
                  className={`text-lg sm:text-xl font-light mt-3 leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  {page.tagline}
                </p>
              )}
            </div>

            {/* Layout: Split Image & Text */}
            {page.layout === 'split-image' && page.imageUrl ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200/10">
                  <img 
                    src={page.imageUrl} 
                    alt={page.title} 
                    className="w-full h-auto object-cover max-h-[400px]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div 
                  style={page.textColor ? { color: page.textColor } : undefined}
                  className={`text-sm sm:text-base leading-relaxed ${
                    isLight ? 'text-slate-700 font-light' : 'text-slate-300 font-light'
                  }`}
                >
                  {renderRichContent(page.content)}
                </div>
              </div>
            ) : (
              /* Layout: Text Only or Banner Image fallback content */
              <div 
                style={page.textColor ? { color: page.textColor } : undefined}
                className={`text-sm sm:text-base leading-relaxed max-w-none ${
                  isLight ? 'text-slate-700 font-light' : 'text-slate-300 font-light'
                }`}
              >
                {renderRichContent(page.content)}
              </div>
            )}

          </div>

        </div>

        {/* Back Button at Footer */}
        <div className="flex justify-center mt-10">
          <button
            onClick={onBackToHome}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer border ${
              isLight 
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-900 text-white' 
                : 'bg-white hover:bg-slate-100 border-white text-slate-900'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            กลับไปหน้าหลัก (หน้าแรก)
          </button>
        </div>

      </div>
    </div>
  );
}
