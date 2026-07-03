import { Edit } from 'lucide-react';

interface DirectEditButtonProps {
  isAdmin?: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}

export default function DirectEditButton({ isAdmin, onClick, label, className = "absolute top-4 right-4" }: DirectEditButtonProps) {
  if (!isAdmin) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`${className} z-30 flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-rose-900/20 border border-rose-500 hover:border-rose-400 cursor-pointer transition-all hover:scale-105`}
      title={`คลิกเพื่อแก้ไขส่วนนี้ในหลังบ้าน`}
    >
      <Edit className="w-3.5 h-3.5" />
      <span>แก้ไข{label}</span>
    </button>
  );
}
