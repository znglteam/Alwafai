import React from 'react';
import { FamilyMember, SpouseInfo } from '../types';
import { isMemberFemale, formatMemberSpouseLabel } from '../utils/marriageUtils';
import { Plus, Trash2, Heart, Users } from 'lucide-react';

interface SpouseEditorProps {
  gender?: 'male' | 'female';
  memberName?: string;
  currentMemberId?: string;
  spouses: SpouseInfo[];
  onChange: (spouses: SpouseInfo[]) => void;
  allMembers: FamilyMember[];
  compact?: boolean;
}

export default function SpouseEditor({
  gender,
  memberName,
  currentMemberId,
  spouses,
  onChange,
  allMembers,
  compact = false,
}: SpouseEditorProps) {
  const isFemale = isMemberFemale({ gender, name: memberName });
  const spouseTerm = isFemale ? 'الزوج' : 'الزوجة';
  const spouseTermPlural = isFemale ? 'الأزواج' : 'الزوجات';

  // Opposite-gender members from family tree, excluding self
  const eligibleFamilyMembers = allMembers.filter(m => {
    if (currentMemberId && m.id === currentMemberId) return false;
    const isCandidateFemale = isMemberFemale(m);
    // If current is female, candidates must be male; if current is male, candidates must be female
    return isFemale ? !isCandidateFemale : isCandidateFemale;
  });

  const handleAddSpouse = () => {
    const nextList: SpouseInfo[] = [
      ...spouses,
      { id: null, name: '' }
    ];
    onChange(nextList);
  };

  const handleRemoveSpouse = (index: number) => {
    const nextList = spouses.filter((_, idx) => idx !== index);
    onChange(nextList);
  };

  const handleSpouseFieldChange = (index: number, field: 'isFamily' | 'id' | 'name', value: any) => {
    const nextList = [...spouses];
    const current = { ...nextList[index] };

    if (field === 'isFamily') {
      if (value) {
        // Switched to from same family
        current.id = '';
        current.name = '';
      } else {
        // Switched to outside family
        current.id = null;
        current.name = '';
      }
    } else if (field === 'id') {
      current.id = value;
      const found = eligibleFamilyMembers.find(m => m.id === value);
      current.name = found ? formatMemberSpouseLabel(found) : '';
    } else if (field === 'name') {
      current.name = value;
    }

    nextList[index] = current;
    onChange(nextList);
  };

  const getSpouseOrderLabel = (index: number) => {
    const ordinalsMale = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس'];
    const ordinalsFemale = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'];
    const ordinals = isFemale ? ordinalsMale : ordinalsFemale;
    const suffix = ordinals[index] || `#${index + 1}`;
    return `${spouseTerm} ${suffix}`;
  };

  return (
    <div className={`space-y-3 ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart size={compact ? 14 : 16} className="text-rose-500 fill-rose-500/20" />
          <label className={`font-bold text-slate-700 ${compact ? 'text-xs' : 'text-sm'}`}>
            {spouses.length > 1 ? `بيانات ${spouseTermPlural} (${spouses.length})` : `بيانات ${spouseTerm}`}
          </label>
        </div>
        <button
          type="button"
          onClick={handleAddSpouse}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors border border-indigo-100"
        >
          <Plus size={12} />
          <span>{isFemale ? 'إضافة زوج آخر' : 'إضافة زوجة أخرى'}</span>
        </button>
      </div>

      {spouses.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-400 mb-2">لم يتم تحديد أي {isFemale ? 'زوج' : 'زوجة'} بعد</p>
          <button
            type="button"
            onClick={handleAddSpouse}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-xl shadow-xs transition-all"
          >
            <Plus size={13} />
            <span>{isFemale ? 'إضافة زوج' : 'إضافة زوجة'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {spouses.map((spouse, idx) => {
            const isFamily = spouse.id !== null && spouse.id !== undefined;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs space-y-2 relative group hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700">
                      {getSpouseOrderLabel(idx)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isFamily}
                        onChange={(e) => handleSpouseFieldChange(idx, 'isFamily', e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-3.5 h-3.5"
                      />
                      <span className="text-[11px] font-bold text-slate-600">من نفس العائلة؟</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveSpouse(idx)}
                      title={`حذف ${spouseTerm}`}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {isFamily ? (
                  <div>
                    <select
                      value={spouse.id || ''}
                      onChange={(e) => handleSpouseFieldChange(idx, 'id', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                    >
                      <option value="" disabled>
                        اختر {spouseTerm} من أفراد العائلة
                      </option>
                      {eligibleFamilyMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {formatMemberSpouseLabel(m)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder={`اسم ${spouseTerm} (من خارج العائلة)`}
                      value={spouse.name || ''}
                      onChange={(e) => handleSpouseFieldChange(idx, 'name', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
