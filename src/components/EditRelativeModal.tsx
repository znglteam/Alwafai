import React, { useState, useEffect } from 'react';
import { FamilyMember } from '../types';
import { X } from 'lucide-react';

interface Props {
  relative: FamilyMember;
  onClose: () => void;
  onSave: (updated: FamilyMember) => void;
}

export default function EditRelativeModal({ relative, onClose, onSave }: Props) {
  const [isAlive, setIsAlive] = useState(relative.isAlive);
  const [deathYear, setDeathYear] = useState<number | ''>(relative.deathYear || '');
  const [gender, setGender] = useState(relative.gender || 'male');
  const [bio, setBio] = useState(relative.bio || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...relative,
      isAlive,
      deathYear: !isAlive && deathYear !== '' ? Number(deathYear) : null,
      gender: gender as 'male' | 'female',
      bio
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col relative" onClick={(e) => e.stopPropagation()}>
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">تعديل بيانات: {relative.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-500 mb-1">الحالة (على قيد الحياة؟)</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="relativeIsAlive" checked={isAlive} onChange={() => setIsAlive(true)} className="accent-indigo-600" />
                <span className="font-semibold">حي يرزق</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="relativeIsAlive" checked={!isAlive} onChange={() => setIsAlive(false)} className="accent-indigo-600" />
                <span className="font-semibold">متوفى</span>
              </label>
            </div>
          </div>
          
          {!isAlive && (
            <div>
              <label className="block font-bold text-slate-500 mb-1">سنة الوفاة</label>
              <input type="number" value={deathYear} onChange={e => setDeathYear(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-600 outline-none" />
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-500 mb-1">الجنس</label>
            <select value={gender} onChange={e => setGender(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-600 outline-none">
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-500 mb-1">نبذة شخصية</label>
            <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-600 outline-none" />
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl">حفظ</button>
            <button type="button" onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
