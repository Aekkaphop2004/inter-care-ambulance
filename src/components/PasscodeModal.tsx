import React, { useState } from 'react';
import { Lock, ShieldAlert, X, Eye, EyeOff, Loader2, Smartphone, ShieldCheck, ChevronLeft } from 'lucide-react';
import { authenticateAdmin, getMfaSettings } from '../dbService';
import { verifyTOTP } from '../utils/totp';

interface PasscodeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PasscodeModal({ onClose, onSuccess }: PasscodeModalProps) {
  const [passcode, setPasscode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  // MFA States
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState(false);

  const handleSubmitPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    
    try {
      const isValid = await authenticateAdmin(passcode);
      
      if (isValid) {
        // Passcode is valid, check if MFA is enabled
        const mfaConfig = await getMfaSettings();
        if (mfaConfig.mfaEnabled && mfaConfig.mfaSecret) {
          setMfaSecret(mfaConfig.mfaSecret);
          setMfaStep(true);
          setLoading(false);
        } else {
          // MFA not enabled, login successfully
          onSuccess();
        }
      } else {
        setError(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("Passcode auth failed:", err);
      setError(true);
      setLoading(false);
    }
  };

  const handleSubmitMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError(false);
    setLoading(true);

    try {
      const isValidMfa = await verifyTOTP(mfaSecret, mfaCode);
      if (isValidMfa) {
        onSuccess();
      } else {
        setMfaError(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("MFA verification failed:", err);
      setMfaError(true);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl text-center text-slate-100">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {!mfaStep ? (
          /* Step 1: Passcode Verification */
          <>
            {/* Lock Icon */}
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mx-auto animate-bounce">
              <Lock className="w-8 h-8" />
            </div>

            {/* Header Titles */}
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white tracking-tight">ยืนยันรหัสผ่านเข้าสู่ระบบ CMS</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                กรุณาป้อนรหัสแอดมินหลังบ้านเพื่อตรวจสอบสิทธิ์ในการเข้าแก้ไขรายละเอียดผลงานและสไลด์ข้อมูลหน้าหลัก
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmitPasscode} className="space-y-4 text-left">
              <div className="relative">
                <input 
                  type={showPass ? "text" : "password"} 
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="ป้อนรหัสผ่านเข้าสู่ระบบ"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-4 pr-12 py-3.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center tracking-widest" 
                />
                
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-500" />
                  <span>รหัสเข้าสู่ระบบไม่ถูกต้อง! กรุณาลองใหม่อีกครั้ง</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-950/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังยืนยันรหัสผ่าน...</span>
                  </>
                ) : (
                  <span>เข้าสู่ระบบหลังบ้าน</span>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Step 2: Multi-Factor Authentication (MFA) */
          <>
            {/* Phone/Shield Icon */}
            <div className="w-16 h-16 bg-blue-500/15 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-400 mx-auto relative">
              <span className="absolute inset-0 bg-blue-500/10 rounded-2xl animate-ping scale-110 opacity-70" style={{ animationDuration: '3s' }} />
              <Smartphone className="w-8 h-8 relative z-10" />
            </div>

            {/* Header Titles */}
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                การยืนยันตัวตนแบบหลายปัจจัย
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                บัญชีแอดมินเปิดใช้งานการตรวจสอบสิทธิ์แบบ <span className="text-blue-400 font-semibold font-sans">MFA</span> กรุณาเปิดแอปพลิเคชัน Google Authenticator และกรอกรหัส 6 หลักด้านล่าง
              </p>
            </div>

            {/* MFA Input Form */}
            <form onSubmit={handleSubmitMfa} className="space-y-4 text-left">
              <div>
                <input 
                  type="text" 
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  autoFocus
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000 000"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl py-4 text-white text-2xl font-black font-sans text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              {/* Error Message */}
              {mfaError && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-500" />
                  <span>รหัสยืนยันตัวตนไม่ถูกต้องหรือหมดอายุแล้ว! กรุณาตรวจสอบเวลาในโทรศัพท์ของท่าน</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังยืนยันรหัสความปลอดภัย...</span>
                  </>
                ) : (
                  <span>ตรวจสอบและเข้าสู่ระบบ</span>
                )}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => {
                  setMfaStep(false);
                  setMfaCode('');
                  setMfaError(false);
                }}
                className="w-full py-2.5 bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>ย้อนกลับไปใช้รหัสผ่านปกติ</span>
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
