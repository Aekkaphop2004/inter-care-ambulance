import { Users, User, Shield, Briefcase, Plus, Edit } from 'lucide-react';
import { CompanyConfig, TeamMember } from '../types';
import DirectEditButton from './DirectEditButton';
import { motion } from 'motion/react';

interface TeamSectionProps {
  members: TeamMember[];
  config: CompanyConfig;
  isAdmin?: boolean;
  onDirectEdit?: (tab: 'company' | 'services' | 'works' | 'passcode' | 'team', fieldId?: string) => void;
}

export default function TeamSection({ members, config, isAdmin, onDirectEdit }: TeamSectionProps) {
  // Sort members by order
  const sortedMembers = [...members].sort((a, b) => a.order - b.order);

  // Helper to detect if a member is a director/leader
  const isDirector = (member: TeamMember) => {
    const role = member.role ? member.role.toLowerCase() : '';
    const name = member.name ? member.name.toLowerCase() : '';
    return role.includes('ผู้อำนวยการ') || 
           role.includes('director') || 
           role.includes('ผอ.') || 
           role.includes('ผู้บริหาร') ||
           role.includes('หัวหน้า') ||
           name.includes('ผู้อำนวยการ');
  };

  // Split into directors and other members
  let directors: TeamMember[] = [];
  let others: TeamMember[] = [];

  const foundDirectors = sortedMembers.filter(isDirector);
  if (foundDirectors.length > 0) {
    directors = foundDirectors;
    others = sortedMembers.filter(m => !isDirector(m));
  } else if (sortedMembers.length > 0) {
    // Fallback: If no director found in roles/names, make the first member the "Director"
    directors = [sortedMembers[0]];
    others = sortedMembers.slice(1);
  }

  return (
    <section id="team" className="py-24 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
      {/* Decorative medical grid or elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Direct CMS Edit Buttons */}
      <div className="absolute top-4 right-4 sm:right-6 md:right-8 flex flex-col sm:flex-row gap-2 z-30">
        <DirectEditButton 
          isAdmin={isAdmin} 
          onClick={() => onDirectEdit?.('team')} 
          label="จัดการรายชื่อทีมงาน/สมาชิก"
          className="!relative !top-auto !right-auto bg-blue-600 hover:bg-blue-500 border-blue-500 hover:border-blue-400 text-white font-semibold text-xs rounded-xl px-4 py-2 shadow-lg"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <span className="text-rose-400 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-rose-400" />
            OUR MEDICAL TEAM • ทีมงานของเรา
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            บุคลากรทางการแพทย์และทีมกู้ชีพผู้เชี่ยวชาญ
          </h2>
          <div className="h-1 w-12 bg-rose-500 mx-auto rounded" />
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            อุ่นใจทุกวินาทีกับทีมแพทย์ พยาบาลวิชาชีพ และเจ้าหน้าที่เวชกิจฉุกเฉินระดับสูง ที่พร้อมดูแลเคียงข้างคุณด้วยทักษะความเชี่ยวชาญเฉพาะทางตามมาตรฐานวิชาชีพ
          </p>
        </motion.div>

        {sortedMembers.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/40 rounded-3xl border border-slate-800/80 max-w-lg mx-auto">
            <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-300">ยังไม่มีข้อมูลรายชื่อสมาชิกในขณะนี้</h3>
            <p className="text-xs text-slate-500 mt-1">คลิกปุ่มจัดการด้านบนเพื่อเพิ่มสมาชิกคนแรกของคุณ</p>
            {isAdmin && (
              <button
                onClick={() => onDirectEdit?.('team')}
                className="mt-4 inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มสมาชิกทันที</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-16">
            {/* Director Section (Centered on Top alone) */}
            {directors.length > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-4 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
                  ผู้อำนวยการและหัวหน้าคณะแพทย์ (DIRECTOR)
                </span>
                
                <div className="flex flex-col items-center justify-center w-full">
                  {directors.map((member, idx) => (
                    <motion.div
                      key={member.id || `dir-${idx}`}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="group relative bg-gradient-to-b from-slate-800/90 to-slate-900/95 rounded-3xl overflow-hidden border-2 border-amber-400 hover:border-amber-300 transition-all duration-300 flex flex-col w-full max-w-[290px] shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:shadow-[0_0_30px_rgba(245,158,11,0.18)]"
                    >
                      {/* Ribbon / Tag Badge */}
                      <div className="absolute top-3 right-3 z-20">
                        <span className="bg-amber-400 text-slate-950 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-md tracking-wider">
                          ★ CHIEF
                        </span>
                      </div>

                      {/* Profile Image */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-slate-950 flex items-center justify-center">
                        {member.imageUrl ? (
                          <img 
                            src={member.imageUrl} 
                            alt={member.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-700">
                            <User className="w-12 h-12 opacity-30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-85" />
                        
                        {/* Role Overlay */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="inline-block bg-amber-400 text-slate-950 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300/30 shadow-md">
                            {member.role}
                          </span>
                        </div>
                      </div>

                      {/* Body Details */}
                      <div className="p-4 flex flex-col flex-grow space-y-2.5">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors">
                            {member.name}
                          </h3>
                        </div>
                        
                        <div className="flex-grow">
                          {member.description && (
                            <p className="text-xs text-slate-300 leading-relaxed font-light">
                              {member.description}
                            </p>
                          )}
                        </div>

                        {/* Trust Icon */}
                        <div className="pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 mt-auto">
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-amber-400 animate-pulse" />
                            <span>ผ่านการรับรองและตรวจสอบ</span>
                          </span>
                        </div>
                      </div>

                      {/* Admin Edit Shortcut */}
                      {isAdmin && (
                        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                          <button
                            onClick={() => onDirectEdit?.('team', `member-edit-${member.id}`)}
                            className="p-2 bg-slate-950/80 backdrop-blur-md hover:bg-amber-400 text-slate-300 hover:text-slate-950 rounded-xl border border-slate-700/50 hover:border-amber-400 transition-all shadow-md cursor-pointer"
                            title="แก้ไขข้อมูลผู้บริหาร"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Members Section (3 in a Row Grid with Beautiful Frames) */}
            {others.length > 0 && (
              <div className="space-y-8">
                <div className="flex items-center justify-center gap-4">
                  <div className="h-[1px] bg-gradient-to-r from-transparent to-slate-800 flex-grow max-w-[120px]" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    TEAM MEMBERS • คณะทำงานแพทย์และทีมกู้ชีพ
                  </span>
                  <div className="h-[1px] bg-gradient-to-l from-transparent to-slate-800 flex-grow max-w-[120px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto justify-center">
                  {others.map((member, idx) => (
                    <motion.div
                      key={member.id || idx}
                      initial={{ opacity: 0, y: 35 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="group relative bg-gradient-to-b from-slate-800/50 to-slate-900/60 rounded-3xl overflow-hidden border-2 border-blue-500/20 hover:border-blue-400/80 hover:bg-slate-800/80 transition-all duration-300 flex flex-col h-full max-w-[270px] w-full mx-auto shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.12)]"
                    >
                      {/* Profile Image */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-slate-950 flex items-center justify-center">
                        {member.imageUrl ? (
                          <img 
                            src={member.imageUrl} 
                            alt={member.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-700">
                            <User className="w-12 h-12 opacity-30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                        
                        {/* Role Overlay */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="inline-block bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-400/20 shadow-md">
                            {member.role}
                          </span>
                        </div>
                      </div>

                      {/* Body Details */}
                      <div className="p-4 flex flex-col flex-grow space-y-2.5">
                        <div className="flex justify-between items-start">
                          <h3 className="text-base font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                            {member.name}
                          </h3>
                          <span className="text-[9px] text-slate-600 font-mono">
                            #{idx + 1}
                          </span>
                        </div>
                        
                        <div className="flex-grow">
                          {member.description && (
                            <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                              {member.description}
                            </p>
                          )}
                        </div>

                        {/* Trust Icon */}
                        <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[9px] text-slate-500 mt-auto">
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-emerald-500" />
                            <span>ผ่านการตรวจสอบประวัติ</span>
                          </span>
                        </div>
                      </div>

                      {/* Admin Edit Shortcut */}
                      {isAdmin && (
                        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                          <button
                            onClick={() => onDirectEdit?.('team', `member-edit-${member.id}`)}
                            className="p-2 bg-slate-950/80 backdrop-blur-md hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl border border-slate-700/50 hover:border-blue-400 transition-all shadow-md cursor-pointer"
                            title="แก้ไขสมาชิกท่านนี้"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
