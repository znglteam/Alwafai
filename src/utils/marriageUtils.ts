import { FamilyMember, SpouseInfo, getMemberSpouses } from '../types';

export const FEMALE_FIRST_NAMES = new Set([
  'فاطمة', 'فاطمه', 'سارة', 'ساره', 'هند', 'سعاد', 'منى', 'ريم', 'حصة', 'نورة', 'نوره',
  'أميرة', 'اميرة', 'عائشة', 'عائشه', 'مريم', 'زينب', 'خديجة', 'خديجه', 'رندة', 'رنده',
  'ليلى', 'ليلي', 'رنا', 'رانية', 'رانيه', 'هالة', 'هاله', 'سهى', 'تامي', 'شهد', 'ديما',
  'ديمة', 'ديمه', 'لمى', 'لمي', 'نور', 'هدى', 'هدي', 'سمية', 'سميه', 'إلهام', 'الهام',
  'إسراء', 'اسراء', 'بيان', 'ولاء', 'نجلاء', 'ياسمين', 'تغريد', 'تسنيم', 'رغد', 'غادة',
  'غاده', 'آلاء', 'الاء', 'إيمان', 'ايمان', 'بشرى', 'بشري', 'جمانة', 'جمانه', 'حنان',
  'خلود', 'دعاء', 'رحاب', 'روان', 'سلوى', 'سلوي', 'عبير', 'عفاف', 'فاتن', 'لبنى', 'لبني',
  'مروة', 'مروه', 'ميادة', 'مياده', 'نهى', 'نهي', 'وسام', 'وفاء', 'هبة', 'هبه', 'هيا',
  'هنادي', 'أمل', 'امل', 'جميلة', 'جميله', 'لطيفة', 'لطيفه', 'صفاء', 'شيماء', 'صفية',
  'صفيه', 'سلمى', 'سلمي', 'مها', 'ميساء', 'ميس', 'داليا', 'لينة', 'لينة', 'لينا', 'رنا'
]);

export const isMemberFemale = (member?: { gender?: string; name?: string } | null): boolean => {
  if (!member) return false;
  if (member.gender === 'female') return true;
  if (member.gender === 'male') return false;
  if (!member.name) return false;
  const firstWord = member.name.trim().split(' ')[0];
  return FEMALE_FIRST_NAMES.has(firstWord);
};

export const formatMemberSpouseLabel = (m: { name: string; fatherName?: string; gender?: string }): string => {
  const isFemale = isMemberFemale(m);
  const connector = isFemale ? 'بنت' : 'بن';
  if (m.fatherName && m.fatherName.trim()) {
    return `${m.name.trim()} ${connector} ${m.fatherName.trim()}`;
  }
  return m.name.trim();
};

/**
 * Ensures clean, normalized spouse array for a member
 */
export const normalizeMemberSpouses = (m: Partial<FamilyMember>, allMembers: FamilyMember[] = []): SpouseInfo[] => {
  const rawSpouses = getMemberSpouses(m);
  const memberMap = new Map<string, FamilyMember>();
  allMembers.forEach(mem => memberMap.set(mem.id, mem));

  return rawSpouses.map(s => {
    if (s.id && memberMap.has(s.id)) {
      const spouseObj = memberMap.get(s.id)!;
      return {
        id: s.id,
        name: formatMemberSpouseLabel(spouseObj)
      };
    }
    return {
      id: s.id || null,
      name: (s.name || '').trim()
    };
  }).filter(s => s.name.length > 0 || !!s.id);
};

/**
 * Synchronize spouse relationships bidirectionally when a member is updated.
 */
export const syncSpouseRelationships = (
  currentMembers: FamilyMember[],
  updatedMember: FamilyMember,
  previousMember?: FamilyMember | null
): FamilyMember[] => {
  const memberMap = new Map<string, FamilyMember>();
  currentMembers.forEach(m => memberMap.set(m.id, { ...m }));

  // Normalize updated member's spouses
  const newSpouses = normalizeMemberSpouses(updatedMember, currentMembers);
  const prevSpouses = previousMember ? normalizeMemberSpouses(previousMember, currentMembers) : [];

  const updatedCopy: FamilyMember = {
    ...updatedMember,
    spouses: newSpouses,
    spouseName: newSpouses.map(s => s.name).filter(Boolean).join('، ') || null,
    spouseId: newSpouses.find(s => s.id)?.id || null,
    maritalStatus: newSpouses.length > 0 ? (updatedMember.maritalStatus === 'منفصل/ أرمل' ? 'منفصل/ أرمل' : 'متزوج') : updatedMember.maritalStatus
  };

  memberMap.set(updatedCopy.id, updatedCopy);

  const prevSpouseIds = new Set(prevSpouses.map(s => s.id).filter((id): id is string => !!id));
  const newSpouseIds = new Set(newSpouses.map(s => s.id).filter((id): id is string => !!id));

  // 1. Remove link from spouses that were removed
  prevSpouseIds.forEach(spouseId => {
    if (!newSpouseIds.has(spouseId) && memberMap.has(spouseId)) {
      const spouseMem = memberMap.get(spouseId)!;
      const spouseMemSpouses = getMemberSpouses(spouseMem).filter(s => s.id !== updatedCopy.id);
      const newSpouseName = spouseMemSpouses.map(s => s.name).filter(Boolean).join('، ') || null;
      const newSpouseId = spouseMemSpouses.find(s => s.id)?.id || null;

      memberMap.set(spouseId, {
        ...spouseMem,
        spouses: spouseMemSpouses,
        spouseName: newSpouseName,
        spouseId: newSpouseId,
        maritalStatus: spouseMemSpouses.length > 0 ? spouseMem.maritalStatus : (spouseMem.maritalStatus === 'متزوج' ? '' : spouseMem.maritalStatus)
      });
    }
  });

  // 2. Add or update link on new spouses from the same family
  newSpouseIds.forEach(spouseId => {
    if (memberMap.has(spouseId)) {
      const spouseMem = memberMap.get(spouseId)!;
      const spouseMemSpouses = getMemberSpouses(spouseMem);
      const formattedSelf = formatMemberSpouseLabel(updatedCopy);

      const existingIndex = spouseMemSpouses.findIndex(s => s.id === updatedCopy.id);
      let updatedSpouseList: SpouseInfo[];

      if (existingIndex >= 0) {
        updatedSpouseList = spouseMemSpouses.map((s, idx) => idx === existingIndex ? { id: updatedCopy.id, name: formattedSelf } : s);
      } else {
        updatedSpouseList = [...spouseMemSpouses, { id: updatedCopy.id, name: formattedSelf }];
      }

      const newSpouseName = updatedSpouseList.map(s => s.name).filter(Boolean).join('، ') || null;
      const newSpouseId = updatedSpouseList.find(s => s.id)?.id || null;

      memberMap.set(spouseId, {
        ...spouseMem,
        spouses: updatedSpouseList,
        spouseName: newSpouseName,
        spouseId: newSpouseId,
        maritalStatus: 'متزوج'
      });
    }
  });

  return Array.from(memberMap.values());
};

/**
 * Reconcile lineage (fathers, grandfathers, childrenIds) AND cross-member marriages
 */
export const reconcileLineageAndMarriages = (list: FamilyMember[]): FamilyMember[] => {
  const memberMap = new Map<string, FamilyMember>();
  list.forEach(m => {
    const normSpouses = normalizeMemberSpouses(m, list);
    memberMap.set(m.id, {
      ...m,
      spouses: normSpouses,
      spouseName: normSpouses.map(s => s.name).filter(Boolean).join('، ') || m.spouseName || null,
      spouseId: normSpouses.find(s => s.id)?.id || m.spouseId || null
    });
  });

  // Ensure bidirectional links exist
  list.forEach(m => {
    const spouses = getMemberSpouses(m);
    spouses.forEach(s => {
      if (s.id && memberMap.has(s.id)) {
        const spouseMem = memberMap.get(s.id)!;
        const spouseMemSpouses = getMemberSpouses(spouseMem);
        const hasSelf = spouseMemSpouses.some(s2 => s2.id === m.id);

        if (!hasSelf) {
          const formattedSelf = formatMemberSpouseLabel(m);
          const updatedSpouses = [...spouseMemSpouses, { id: m.id, name: formattedSelf }];
          memberMap.set(s.id, {
            ...spouseMem,
            spouses: updatedSpouses,
            spouseName: updatedSpouses.map(s3 => s3.name).filter(Boolean).join('، ') || null,
            spouseId: updatedSpouses.find(s3 => s3.id)?.id || null,
            maritalStatus: 'متزوج'
          });
        }
      }
    });
  });

  const childrenMap: Record<string, string[]> = {};
  list.forEach(m => {
    if (m.fatherId) {
      if (!childrenMap[m.fatherId]) childrenMap[m.fatherId] = [];
      childrenMap[m.fatherId].push(m.id);
    }
    if (m.motherId) {
      if (!childrenMap[m.motherId]) childrenMap[m.motherId] = [];
      childrenMap[m.motherId].push(m.id);
    }
  });

  return Array.from(memberMap.values()).map(m => {
    let newFatherName = m.fatherName;
    let newGrandfatherName = m.grandfatherName;

    if (m.fatherId && memberMap.has(m.fatherId)) {
      const father = memberMap.get(m.fatherId)!;
      if (father.name) {
        newFatherName = father.name;
      }
      const grandFatherNameResolved = father.fatherId && memberMap.has(father.fatherId)
        ? memberMap.get(father.fatherId)!.name
        : (father.fatherName || m.grandfatherName);
      if (grandFatherNameResolved) {
        newGrandfatherName = grandFatherNameResolved;
      }
    }

    const correctChildren = childrenMap[m.id] || [];

    return {
      ...m,
      fatherName: newFatherName,
      grandfatherName: newGrandfatherName,
      childrenIds: correctChildren
    };
  });
};
