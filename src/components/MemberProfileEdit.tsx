import React, { useState, useEffect, useRef, useCallback } from "react";
import { FamilyMember, SpouseInfo, getMemberSpouses } from "../types";
import EditRelativeModal from "./EditRelativeModal";
import SpouseEditor from "./SpouseEditor";
import ChildrenListEditor from "./ChildrenListEditor";
import { isMemberFemale } from "../utils/marriageUtils";
import {
  User,
  Award,
  MapPin,
  Heart,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
  Trash2,
  Edit3,
  Sparkles,
  Check,
  Mars,
  Venus,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Network,
  LogOut,
} from "lucide-react";
import { Reorder } from "motion/react";
import { GenderUserIcon } from "./GenderIcon";
import AvatarImage from "./AvatarImage";
import { PWAInstallButton } from "./PWAInstallButton";
import { compressImage } from "../utils/imageUtils";


const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 150 }, (_, i) => CURRENT_YEAR - i);

const ARAB_COUNTRIES = [
  "أسبانيا", "استراليا", "الأردن", "الإمارات", "البحرين", "الجزائر", "الدنمارك", "السعودية", "السويد", "الصين", "العراق", "الكويت", "ألمانيا", "المغرب", "المملكة المتحدة", "النرويج", "الولايات المتحدة", "اليابان", "اليمن", "أمريكا الجنوبية", "تركيا", "تونس", "روسيا", "سلطنة عمان", "سوريا", "فرنسا", "فلسطين", "قطر", "كندا", "لبنان", "ليبيا", "ماليزيا", "مصر", "هولندا", "آخر"
];

const SPECIALIZATIONS = [
  "طب وصحة", "هندسة وبرمجة", "تصميم وميديا", "علوم وأبحاث",
  "تجارة وريادة أعمال", "تعليم وتدريب", "مهن حرفية", "فنون وأعمال يدوية",
  "أمومة", "طالب جامعي", "متقاعد", "آخر"
];

interface MemberProfileEditProps {
  member: FamilyMember;
  allMembers: FamilyMember[];
  onUpdateMember: (updated: FamilyMember) => void;
  onAddChild: (
    fatherId: string,
    childInfo: Omit<FamilyMember, "id" | "fatherId" | "childrenIds">,
  ) => void;
  onGoToTree?: (memberId: string) => void;
  onLogout?: () => void;
}

export default function MemberProfileEdit({
  member,
  allMembers,
  onUpdateMember,
  onAddChild,
  onGoToTree,
  onLogout,
}: MemberProfileEditProps) {
  // Form edit states
  const [name, setName] = useState(member.name);
  const [birthYear, setBirthYear] = useState(member.birthYear);
  const [birthDate, setBirthDate] = useState(member.birthDate || "");
  const [country, setCountry] = useState(member.country || "");
  const [specialization, setSpecialization] = useState(member.specialization);
  const [isAlive, setIsAlive] = useState(member.isAlive);
  const [deathYear, setDeathYear] = useState(member.deathYear || 0);
  const [deathDate, setDeathDate] = useState(member.deathDate || "");
  const [bio, setBio] = useState(member.bio || "");
  const [avatar, setAvatar] = useState(member.avatar || "");
  const [avatarScale, setAvatarScale] = useState(member.avatarScale || 1);
  const [avatarX, setAvatarX] = useState(member.avatarX || 0);
  const [avatarY, setAvatarY] = useState(member.avatarY || 0);
  const [spouses, setSpouses] = useState<SpouseInfo[]>(() => getMemberSpouses(member));
  const [spouseName, setSpouseName] = useState(member.spouseName || "");
  const [spouseId, setSpouseId] = useState<string | null>(member.spouseId || null);
  const [childrenList, setChildrenList] = useState<string[]>(() => {
    if (!member.childrenNamesText) return [];
    return member.childrenNamesText.split(/[,،\n]+/).map(s => s.trim()).filter(Boolean);
  });
  const [maritalStatus, setMaritalStatus] = useState<"أعزب" | "مرتبط" | "متزوج" | "منفصل/ أرمل" | "( اختر )" | "">(() => {
    if (member.maritalStatus) return member.maritalStatus;
    if (member.spouseName || (member.spouses && member.spouses.length > 0)) return "متزوج";
    return "";
  });
  const [gender, setGender] = useState<"male" | "female">(
    member.gender || "male",
  );
  const [selectedRelativeForEdit, setSelectedRelativeForEdit] =
    useState<FamilyMember | null>(null);
  const father = member.fatherId
    ? allMembers.find((m) => m.id === member.fatherId)
    : undefined;
  const grandfather = father?.fatherId
    ? allMembers.find((m) => m.id === father.fatherId)
    : undefined;
  const greatGrandfather = grandfather?.fatherId
    ? allMembers.find((m) => m.id === grandfather.fatherId)
    : undefined;
  const siblings = member.fatherId
    ? allMembers.filter(
        (m) => m.fatherId === member.fatherId && m.id !== member.id,
      )
    : [];

  // Child form states
  const [showAddChild, setShowAddChild] = useState(false);
  const [childName, setChildName] = useState("");
  const [childBirthYear, setChildBirthYear] = useState<number | "">("");
  const [childBirthDate, setChildBirthDate] = useState("");
  const [childCountry, setChildCountry] = useState(member.country);
  const [childSpecialization, setChildSpecialization] = useState("");
  const [childBio, setChildBio] = useState("");
  const [childAvatar, setChildAvatar] = useState("");
  const [childAvatarScale, setChildAvatarScale] = useState(1);
  const [childAvatarX, setChildAvatarX] = useState(0);
  const [childAvatarY, setChildAvatarY] = useState(0);
  const [childGender, setChildGender] = useState<"male" | "female">("male");

  // Avatar aspect ratios
  const [avatarAspectRatio, setAvatarAspectRatio] = useState<number>(1);
  const [childAvatarAspectRatio, setChildAvatarAspectRatio] = useState<number>(1);

  // Drag-to-pan and Zoom states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStartDist, setTouchStartDist] = useState<number | null>(null);
  const [touchStartScale, setTouchStartScale] = useState<number>(1);

  const [isDraggingChild, setIsDraggingChild] = useState(false);
  const [dragStartChild, setDragStartChild] = useState({ x: 0, y: 0 });
  const [touchStartDistChild, setTouchStartDistChild] = useState<number | null>(null);
  const [touchStartScaleChild, setTouchStartScaleChild] = useState<number>(1);

  // Wheel event cleanup refs & callbacks to allow zoom via mouse wheel without page scrolling
  const wheelCleanupRef = useRef<(() => void) | null>(null);
  const avatarRef = useCallback((node: HTMLDivElement | null) => {
    if (wheelCleanupRef.current) {
      wheelCleanupRef.current();
      wheelCleanupRef.current = null;
    }
    if (node) {
      const handleWheelRaw = (e: WheelEvent) => {
        e.preventDefault();
        const zoomFactor = 0.08;
        const direction = e.deltaY < 0 ? 1 : -1;
        setAvatarScale(prev => Math.max(1, Math.min(4, prev + direction * zoomFactor)));
      };
      node.addEventListener('wheel', handleWheelRaw, { passive: false });
      wheelCleanupRef.current = () => {
        node.removeEventListener('wheel', handleWheelRaw);
      };
    }
  }, []);

  const childWheelCleanupRef = useRef<(() => void) | null>(null);
  const childAvatarRef = useCallback((node: HTMLDivElement | null) => {
    if (childWheelCleanupRef.current) {
      childWheelCleanupRef.current();
      childWheelCleanupRef.current = null;
    }
    if (node) {
      const handleWheelRaw = (e: WheelEvent) => {
        e.preventDefault();
        const zoomFactor = 0.08;
        const direction = e.deltaY < 0 ? 1 : -1;
        setChildAvatarScale(prev => Math.max(1, Math.min(4, prev + direction * zoomFactor)));
      };
      node.addEventListener('wheel', handleWheelRaw, { passive: false });
      childWheelCleanupRef.current = () => {
        node.removeEventListener('wheel', handleWheelRaw);
      };
    }
  }, []);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentMemberIdRef = useRef(member.id);

  // Sync state if active member changes
  useEffect(() => {
    setName(member.name);
    setBirthYear(member.birthYear);
    setBirthDate(member.birthDate || "");
    setCountry(member.country || "");
    setSpecialization(member.specialization);
    setIsAlive(member.isAlive);
    setDeathYear(member.deathYear || 0);
    setDeathDate(member.deathDate || "");

    const memberSpouses = getMemberSpouses(member);
    const parsedChildren = member.childrenNamesText
      ? member.childrenNamesText.split(/[,،\n]+/).map(s => s.trim()).filter(Boolean)
      : [];

    if (member.id !== currentMemberIdRef.current) {
      currentMemberIdRef.current = member.id;
      setBio(member.bio || "");
      setAvatar(member.avatar || "");
      setAvatarScale(member.avatarScale || 1);
      setAvatarX(member.avatarX || 0);
      setAvatarY(member.avatarY || 0);
      setSpouses(memberSpouses);
      setSpouseName(member.spouseName || "");
      setSpouseId(member.spouseId || null);
      setChildrenList(parsedChildren);
      setMaritalStatus(
        member.maritalStatus || (memberSpouses.length > 0 || member.spouseName ? "متزوج" : "")
      );
      setGender(member.gender || "male");
    } else {
      setBio(prev => {
        if (member.bio && !prev) return member.bio;
        return (prev !== undefined && prev !== "") ? prev : (member.bio || "");
      });
      setSpouses(prev => (prev && prev.length > 0) ? prev : memberSpouses);
      setSpouseName(prev => prev || member.spouseName || "");
      setSpouseId(prev => prev || member.spouseId || null);
      setChildrenList(prev => (prev && prev.length > 0) ? prev : parsedChildren);
      setMaritalStatus(prev => prev || member.maritalStatus || (memberSpouses.length > 0 || member.spouseName ? "متزوج" : ""));
      setGender(member.gender || "male");
    }
  }, [member]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const hasSpouses = spouses.length > 0 || Boolean(member.spouseName) || Boolean(spouseName) || (member.spouses && member.spouses.length > 0);
    const effectiveMaritalStatus = maritalStatus || (hasSpouses ? "متزوج" : "");
    
    let effectiveSpouses: SpouseInfo[] = [];
    if (effectiveMaritalStatus === "متزوج" || spouses.length > 0) {
      effectiveSpouses = spouses.length > 0 ? spouses : getMemberSpouses(member);
    } else if (maritalStatus === "أعزب") {
      effectiveSpouses = [];
    } else {
      effectiveSpouses = member.spouses || (member.spouseName ? [{ name: member.spouseName, id: member.spouseId || undefined }] : []);
    }

    const formattedSpouseName = effectiveSpouses.map(s => s.name).filter(Boolean).join('، ')
      || (effectiveMaritalStatus === "متزوج" ? (spouseName || member.spouseName || null) : null);
    
    const formattedSpouseId = effectiveSpouses.find(s => s.id)?.id || member.spouseId || null;

    const formattedChildren = childrenList.map(s => s.trim()).filter(Boolean).join('، ');
    const finalChildrenNamesText = (formattedChildren && formattedChildren.length > 0)
      ? formattedChildren
      : (member.childrenNamesText || null);

    const finalBio = (bio !== undefined && bio !== null && bio !== "") ? bio : (member.bio || "");

    onUpdateMember({
      ...member,
      name,
      birthYear,
      birthDate: birthDate || undefined,
      country: isAlive ? (country || member.country || "") : "",
      specialization: specialization || member.specialization || "غير محدد",
      isAlive,
      deathYear: isAlive ? null : deathYear,
      deathDate: isAlive ? undefined : (deathDate || undefined),
      bio: finalBio,
      avatar: avatar || member.avatar || undefined,
      avatarScale,
      avatarX,
      avatarY,
      spouseName: formattedSpouseName,
      spouseId: formattedSpouseId,
      spouses: effectiveSpouses,
      childrenNamesText: finalChildrenNamesText,
      maritalStatus: effectiveMaritalStatus || member.maritalStatus,
      gender,
      childrenIds: member.childrenIds || [],
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCreateChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName) return;

    const isFemale = member.gender === "female";
    onAddChild(member.id, {
      name: childName,
      fatherName: isFemale ? (member.spouseName || "غير محدد") : member.name,
      grandfatherName: isFemale ? "غير محدد" : member.fatherName,
      birthYear: childBirthYear === "" ? 0 : Number(childBirthYear),
      birthDate: childBirthDate || undefined,
      country: childCountry || "غير محدد",
      specialization: childSpecialization || "طالب مرحلي",
      isAlive: true,
      bio:
        childBio ||
        (isFemale 
          ? `ابن/ابنة ${member.name}.`
          : `ابن ${member.name} بن ${member.fatherName} بن ${member.grandfatherName}.`),
      avatar: childAvatar || undefined,
      avatarScale: childAvatarScale,
      avatarX: childAvatarX,
      avatarY: childAvatarY,
      spouseName: null,
      gender: childGender,
    });

    // Reset child form
    setChildName("");
    setChildBirthYear("");
    setChildBirthDate("");
    setChildSpecialization("");
    setChildBio("");
    setChildAvatar("");
    setChildAvatarScale(1);
    setChildAvatarX(0);
    setChildAvatarY(0);
    setChildGender("male");
    setShowAddChild(false);
  };

  // Find children of this member for display
  const myChildren = allMembers
    .filter((m) => m.fatherId === member.id || m.motherId === member.id)
    .sort((a, b) => {
      const orderA = typeof a.orderIndex === "number" ? a.orderIndex : 999;
      const orderB = typeof b.orderIndex === "number" ? b.orderIndex : 999;
      if (orderA !== orderB) return orderA - orderB;
      const yearA = a.birthYear && a.birthYear > 0 ? a.birthYear : 9999;
      const yearB = b.birthYear && b.birthYear > 0 ? b.birthYear : 9999;
      return yearA - yearB;
    });

  const moveChild = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= myChildren.length) return;

    const currentChild = myChildren[index];
    const swapChild = myChildren[index + direction];

    // Assign orderIndex to all if not present
    myChildren.forEach((c, idx) => {
      if (typeof c.orderIndex !== "number") {
        c.orderIndex = idx;
      }
    });

    const temp = currentChild.orderIndex;
    currentChild.orderIndex = swapChild.orderIndex;
    swapChild.orderIndex = temp;

    onUpdateMember(currentChild);
    onUpdateMember(swapChild);
  };

  const handleReorderMyChildren = (newOrder: FamilyMember[]) => {
    newOrder.forEach((child, index) => {
      if (child.orderIndex !== index) {
        onUpdateMember({ ...child, orderIndex: index });
      }
    });
  };

  return (
    <div
      id="profile-edit-container"
      className="py-2 space-y-8 dir-rtl text-right"
    >
      {/* Intro Heading */}
      <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-700/10">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">
            الملف الشخصي: {member.name} {member.fatherName ? `بن ${member.fatherName}` : ''}
          </h2>
          <p className="text-xs text-indigo-100 mt-1">تعديل بياناتك الشخصية، وإدارة أسرتك وأبنائك</p>
        </div>
        {onGoToTree && (
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              type="button"
              onClick={() => onGoToTree(member.id)}
              className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 active:scale-95 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm border border-white/80 cursor-pointer"
              id="view-me-in-tree-btn"
              title="رؤية موقعك ومكانك في شجرة العائلة"
            >
              <Network size={16} className="text-indigo-600" />
              <span>رؤيتي في الشجرة</span>
            </button>
          </div>
        )}
      </div>

      {/* PWA Install Notice in Profile Page */}
      <PWAInstallButton 
        variant="banner" 
        label="تثبيت أيقونة الموقع في سطح المكتب" 
        sublabel="احصل على أيقونة مباشرة على سطح مكتبك أو شاشة هاتفك لتصل لملفك وشجرة العائلة بضغطة زر واحدة."
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleUpdateProfile}
          className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5"
        >
          <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2 mb-4">
            تعديل المعلومات الأساسية والسيرة
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                الاسم الشخصي الأول *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Date of birth */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                تاريخ الميلاد
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => {
                  const dateVal = e.target.value;
                  setBirthDate(dateVal);
                  if (dateVal) {
                    const yr = new Date(dateVal).getFullYear();
                    setBirthYear(yr);
                  } else {
                    setBirthYear(0);
                  }
                }}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
              />
            </div>

            {/* Status (Alive / Deceased) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                الحالة (حياة / وفاة)
              </label>
              <select
                value={isAlive ? "alive" : "deceased"}
                onChange={(e) => setIsAlive(e.target.value === "alive")}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
              >
                <option value="alive">على قيد الحياة (حياً)</option>
                <option value="deceased">متوفى (رحمه الله)</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                الجنس
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "male" | "female")}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>

            {/* Country of residence (if alive) OR Death date (if deceased) */}
            {isAlive ? (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  بلد الإقامة
                </label>
                <select
                  value={country || ""}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                >
                  <option value="">بلد الإقامة...</option>
                  {ARAB_COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-rose-700 mb-1">
                  تاريخ الوفاة
                </label>
                <input
                  type="date"
                  value={deathDate}
                  onChange={(e) => {
                    const dateVal = e.target.value;
                    setDeathDate(dateVal);
                    if (dateVal) {
                      const yr = new Date(dateVal).getFullYear();
                      setDeathYear(yr);
                    } else {
                      setDeathYear(0);
                    }
                  }}
                  className="w-full border border-rose-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 bg-white cursor-pointer"
                />
              </div>
            )}

            {/* Specialization */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                التخصص المهني/العلمي
              </label>
              <select
                value={specialization || ""}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
              >
                <option value="">التخصص المهني...</option>
                {SPECIALIZATIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Avatar File */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">
                صورة شخصية من جهازك
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const compressed = await compressImage(file, 0.4);
                      setAvatar(compressed);
                    } catch (err) {
                      console.error("Compression failed", err);
                    }
                  } else {
                    setAvatar("");
                  }
                }}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
              />
            </div>

            {avatar && (
              <div className="md:col-span-2 bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex flex-col items-center justify-center gap-4">
                <span className="text-[11px] font-bold text-slate-500">معاينة وتعديل الصورة (اسحب للتحريك • عجلة الفأرة أو اللمس للتكبير)</span>
                
                <div className="flex items-center gap-5">
                  {/* Zoom Out Button */}
                  <button
                    type="button"
                    onClick={() => setAvatarScale(prev => Math.max(1, prev - 0.1))}
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-200 active:scale-95 transition-all shadow-xs cursor-pointer"
                    title="تصغير"
                  >
                    <ZoomOut size={16} />
                  </button>

                  {/* Interactive Container with Ref */}
                  <div 
                    ref={avatarRef}
                    className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-slate-100 shadow-md relative flex items-center justify-center select-none touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseDown={(e) => {
                      setIsDragging(true);
                      setDragStart({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseMove={(e) => {
                      if (!isDragging) return;
                      const dx = e.clientX - dragStart.x;
                      const dy = e.clientY - dragStart.y;
                      const containerWidth = 128;
                      const sensitivity = 100 / (containerWidth * avatarScale);
                      setAvatarX(prev => Math.max(-100, Math.min(100, prev + dx * sensitivity)));
                      setAvatarY(prev => Math.max(-100, Math.min(100, prev + dy * sensitivity)));
                      setDragStart({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                    onTouchStart={(e) => {
                      if (e.touches.length === 1) {
                        setIsDragging(true);
                        const touch = e.touches[0];
                        setDragStart({ x: touch.clientX, y: touch.clientY });
                        setTouchStartDist(null);
                      } else if (e.touches.length === 2) {
                        setIsDragging(false);
                        const t1 = e.touches[0];
                        const t2 = e.touches[1];
                        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
                        setTouchStartDist(dist);
                        setTouchStartScale(avatarScale);
                      }
                    }}
                    onTouchMove={(e) => {
                      if (e.touches.length === 1 && isDragging) {
                        const touch = e.touches[0];
                        const dx = touch.clientX - dragStart.x;
                        const dy = touch.clientY - dragStart.y;
                        const containerWidth = 128;
                        const sensitivity = 100 / (containerWidth * avatarScale);
                        setAvatarX(prev => Math.max(-100, Math.min(100, prev + dx * sensitivity)));
                        setAvatarY(prev => Math.max(-100, Math.min(100, prev + dy * sensitivity)));
                        setDragStart({ x: touch.clientX, y: touch.clientY });
                      } else if (e.touches.length === 2 && touchStartDist !== null) {
                        const t1 = e.touches[0];
                        const t2 = e.touches[1];
                        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
                        const factor = dist / touchStartDist;
                        const newScale = Math.max(1, Math.min(4, touchStartScale * factor));
                        setAvatarScale(newScale);
                      }
                    }}
                    onTouchEnd={() => {
                      setIsDragging(false);
                      setTouchStartDist(null);
                    }}
                  >
                    <img 
                      src={avatar} 
                      alt="Avatar Preview" 
                      className="absolute origin-center pointer-events-none select-none" 
                      style={{ 
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) translate(${avatarX}%, ${avatarY}%) scale(${avatarScale})`,
                        width: avatarAspectRatio > 1 ? 'auto' : '100%',
                        height: avatarAspectRatio > 1 ? '100%' : 'auto',
                        maxWidth: 'none',
                        maxHeight: 'none',
                      }} 
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        setAvatarAspectRatio(img.naturalWidth / img.naturalHeight);
                      }}
                      referrerPolicy="no-referrer"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </div>

                  {/* Zoom In Button */}
                  <button
                    type="button"
                    onClick={() => setAvatarScale(prev => Math.max(1, Math.min(4, prev + 0.1)))}
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-200 active:scale-95 transition-all shadow-xs cursor-pointer"
                    title="تكبير"
                  >
                    <ZoomIn size={16} />
                  </button>
                </div>

                {/* Reset button and Info */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-medium">الزوم الحالي: <strong className="text-indigo-600">x{avatarScale.toFixed(2)}</strong></span>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarScale(1);
                      setAvatarX(0);
                      setAvatarY(0);
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-xl cursor-pointer hover:bg-slate-50 font-bold transition-all"
                  >
                    إعادة تعيين الأبعاد
                  </button>
                </div>
              </div>
            )}


            {/* Marital Status */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">
                الحالة الاجتماعية
              </label>
              <select
                value={maritalStatus || ""}
                onChange={(e) => setMaritalStatus(e.target.value as any)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
              >
                <option value="">( اختر )</option>
                <option value="أعزب">أعزب</option>
                <option value="مرتبط">مرتبط</option>
                <option value="متزوج">متزوج</option>
                <option value="منفصل/ أرمل">منفصل/ أرمل</option>
              </select>
            </div>

            {/* Spouse Editor */}
            {maritalStatus === 'متزوج' && (
              <div className="md:col-span-2 pt-2">
                <SpouseEditor
                  gender={gender}
                  memberName={name}
                  currentMemberId={member.id}
                  spouses={spouses}
                  onChange={setSpouses}
                  allMembers={allMembers}
                />
              </div>
            )}

            {/* Children names (for females only) */}
            {gender === 'female' && (
              <div className="md:col-span-2">
                <ChildrenListEditor
                  childrenList={childrenList}
                  onChange={setChildrenList}
                  title="الأبناء"
                />
              </div>
            )}
          </div>

          {/* Biography */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              نبذة شخصية
            </label>
            <textarea
              rows={4}
              value={bio || ""}
              onChange={(e) => setBio(e.target.value)}
              placeholder="اكتب نبذة مختصرة..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm px-6 py-2.5 rounded-xl transition-colors shadow-md"
            >
              حفظ
            </button>
            {saveSuccess && (
              <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                <Check size={16} />
                تم الحفظ بنجاح!
              </span>
            )}
          </div>
        </form>

        {/* Sidebar / Extra Details */}
        <div className="lg:col-span-5 space-y-6">
          {member.gender !== 'female' && (
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    الأبناء ({myChildren.length})
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    الأبناء والبنات المتصلين بنسبك مباركاً.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddChild(!showAddChild)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={12} />
                  إضافة ولد
                </button>
              </div>

                {/* Helper Notice Box */}
                <div className="bg-indigo-50 border border-indigo-100/60 rounded-2xl p-4 text-right">
                  <p className="text-[11px] text-indigo-800 leading-relaxed font-medium">
                    💡 بصفتك عضواً في العائلة، يمكنك إضافة اسم زوجتك في النموذج الجانبي الأيمن، وإضافة أبنائك وبناتك من هنا ليرتبطوا بنسبك في الشجرة وتحديثها فوراً.
                  </p>
                </div>

            {/* Add Child Inline Form */}
            {showAddChild && (
              <form
                onSubmit={handleCreateChild}
                className="bg-white border border-slate-100 p-4 rounded-2xl space-y-3 shadow-inner"
              >
                <span className="text-[11px] font-bold text-indigo-600 block border-b border-slate-100 pb-1">
                  ولد جديد
                </span>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                    الاسم الشخصي للابن/البنت
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="الاسم الأول للابن/البنت"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block">
                    سيصبح الاسم كاملاً:{" "}
                    {childName
                      ? (isMemberFemale(member) 
                        ? `${childName} (${childGender === 'female' ? 'بنت' : 'ابن'} ${member.name} من زوجها ${member.spouseName || 'غير محدد'})`
                        : `${childName} ${childGender === 'female' ? 'بنت' : 'بن'} ${member.name} بن ${member.fatherName || ''}`)
                      : "..."}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                      تاريخ الميلاد
                    </label>
                    <input
                      type="date"
                      value={childBirthDate}
                      onChange={(e) => {
                        const dateVal = e.target.value;
                        setChildBirthDate(dateVal);
                        if (dateVal) {
                          const yr = new Date(dateVal).getFullYear();
                          setChildBirthYear(yr);
                        } else {
                          setChildBirthYear("");
                        }
                      }}
                      className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                      الجنس
                    </label>
                    <select
                      value={childGender}
                      onChange={(e) =>
                        setChildGender(e.target.value as "male" | "female")
                      }
                      className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                    >
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                      التخصص المهني/العلمي
                    </label>
                    <select
                      value={childSpecialization || ""}
                      onChange={(e) => setChildSpecialization(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                    >
                      <option value="">التخصص المهني...</option>
                      {SPECIALIZATIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                    صورة شخصية من جهازك
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const compressed = await compressImage(file, 0.4);
                          setChildAvatar(compressed);
                        } catch (err) {
                          console.error("Compression failed", err);
                        }
                      } else {
                        setChildAvatar("");
                      }
                    }}
                    className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  />
                </div>

                {childAvatar && (
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col items-center justify-center gap-3">
                    <span className="text-[10px] font-bold text-slate-500">معاينة وتعديل صورة الابن (اسحب للتحريك • عجلة الفأرة أو اللمس للتكبير)</span>
                    
                    <div className="flex items-center gap-4">
                      {/* Zoom Out Button */}
                      <button
                        type="button"
                        onClick={() => setChildAvatarScale(prev => Math.max(1, prev - 0.1))}
                        className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-200 active:scale-95 transition-all shadow-xs cursor-pointer"
                        title="تصغير"
                      >
                        <ZoomOut size={14} />
                      </button>

                      {/* Interactive Container with Ref */}
                      <div 
                        ref={childAvatarRef}
                        className={`w-24 h-24 rounded-full overflow-hidden border-2 border-white bg-slate-100 shadow-sm relative flex items-center justify-center select-none touch-none ${isDraggingChild ? 'cursor-grabbing' : 'cursor-grab'}`}
                        onMouseDown={(e) => {
                          setIsDraggingChild(true);
                          setDragStartChild({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseMove={(e) => {
                          if (!isDraggingChild) return;
                          const dx = e.clientX - dragStartChild.x;
                          const dy = e.clientY - dragStartChild.y;
                          const containerWidth = 96;
                          const sensitivity = 100 / (containerWidth * childAvatarScale);
                          setChildAvatarX(prev => Math.max(-100, Math.min(100, prev + dx * sensitivity)));
                          setChildAvatarY(prev => Math.max(-100, Math.min(100, prev + dy * sensitivity)));
                          setDragStartChild({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseUp={() => setIsDraggingChild(false)}
                        onMouseLeave={() => setIsDraggingChild(false)}
                        onTouchStart={(e) => {
                          if (e.touches.length === 1) {
                            setIsDraggingChild(true);
                            const touch = e.touches[0];
                            setDragStartChild({ x: touch.clientX, y: touch.clientY });
                            setTouchStartDistChild(null);
                          } else if (e.touches.length === 2) {
                            setIsDraggingChild(false);
                            const t1 = e.touches[0];
                            const t2 = e.touches[1];
                            const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
                            setTouchStartDistChild(dist);
                            setTouchStartScaleChild(childAvatarScale);
                          }
                        }}
                        onTouchMove={(e) => {
                          if (e.touches.length === 1 && isDraggingChild) {
                            const touch = e.touches[0];
                            const dx = touch.clientX - dragStartChild.x;
                            const dy = touch.clientY - dragStartChild.y;
                            const containerWidth = 96;
                            const sensitivity = 100 / (containerWidth * childAvatarScale);
                            setChildAvatarX(prev => Math.max(-100, Math.min(100, prev + dx * sensitivity)));
                            setChildAvatarY(prev => Math.max(-100, Math.min(100, prev + dy * sensitivity)));
                            setDragStartChild({ x: touch.clientX, y: touch.clientY });
                          } else if (e.touches.length === 2 && touchStartDistChild !== null) {
                            const t1 = e.touches[0];
                            const t2 = e.touches[1];
                            const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
                            const factor = dist / touchStartDistChild;
                            const newScale = Math.max(1, Math.min(4, touchStartScaleChild * factor));
                            setChildAvatarScale(newScale);
                          }
                        }}
                        onTouchEnd={() => {
                          setIsDraggingChild(false);
                          setTouchStartDistChild(null);
                        }}
                      >
                        <img 
                          src={childAvatar} 
                          alt="Child Avatar Preview" 
                          className="absolute origin-center pointer-events-none select-none" 
                          style={{ 
                            left: '50%',
                            top: '50%',
                            transform: `translate(-50%, -50%) translate(${childAvatarX}%, ${childAvatarY}%) scale(${childAvatarScale})`,
                            width: childAvatarAspectRatio > 1 ? 'auto' : '100%',
                            height: childAvatarAspectRatio > 1 ? '100%' : 'auto',
                            maxWidth: 'none',
                            maxHeight: 'none',
                          }} 
                          onLoad={(e) => {
                            const img = e.currentTarget;
                            setChildAvatarAspectRatio(img.naturalWidth / img.naturalHeight);
                          }}
                          referrerPolicy="no-referrer"
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                        />
                      </div>

                      {/* Zoom In Button */}
                      <button
                        type="button"
                        onClick={() => setChildAvatarScale(prev => Math.max(1, Math.min(4, prev + 0.1)))}
                        className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-200 active:scale-95 transition-all shadow-xs cursor-pointer"
                        title="تكبير"
                      >
                        <ZoomIn size={14} />
                      </button>
                    </div>

                    {/* Reset button and Info */}
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-slate-500 font-medium">الزوم: <strong className="text-indigo-600">x{childAvatarScale.toFixed(2)}</strong></span>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => {
                          setChildAvatarScale(1);
                          setChildAvatarX(0);
                          setChildAvatarY(0);
                        }}
                        className="text-[9px] text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg cursor-pointer hover:bg-slate-50 font-bold transition-all"
                      >
                        إعادة تعيين الأبعاد
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                    نبذة مختصرة
                  </label>
                  <textarea
                    rows={2}
                    placeholder="اكتب نبذة مختصرة عن الولد..."
                    value={childBio}
                    onChange={(e) => setChildBio(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="flex gap-2 justify-start pt-1">
                  <button
                    type="submit"
                    className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold"
                  >
                    حفظ
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddChild(false)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}

            {/* List of My Children */}
            <Reorder.Group
              axis="y"
              values={myChildren}
              onReorder={handleReorderMyChildren}
              className="space-y-3"
            >
              {myChildren.map((child) => (
                <Reorder.Item
                  key={child.id}
                  value={child}
                  className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between gap-3 relative cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center gap-2 pointer-events-none">
                    <div className="flex flex-col gap-1 items-center justify-center pl-1 text-slate-300">
                      <GripVertical size={16} />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 relative flex items-center justify-center font-bold text-[11px] overflow-hidden">
                      {child.avatar ? (
                        <AvatarImage 
                          src={child.avatar} 
                          alt={child.name} 
                          avatarX={child.avatarX}
                          avatarY={child.avatarY}
                          avatarScale={child.avatarScale}
                        />
                      ) : (
                        <GenderUserIcon gender={child.gender} size={22} isAlive={child.isAlive} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        {child.name}
                        {child.gender === "female" ? (
                          <Venus
                            size={12}
                            className={
                              child.isAlive
                                ? "text-[#bb5791]"
                                : "text-slate-400"
                            }
                          />
                        ) : (
                          <Mars
                            size={12}
                            className={
                              child.isAlive
                                ? "text-[#607fc4]"
                                : "text-slate-400"
                            }
                          />
                        )}
                        {child.gender === "female" ? (
                          <Venus
                            size={12}
                            className={
                              child.isAlive
                                ? "text-[#bb5791]"
                                : "text-slate-400"
                            }
                          />
                        ) : (
                          <Mars
                            size={12}
                            className={
                              child.isAlive
                                ? "text-[#607fc4]"
                                : "text-slate-400"
                            }
                          />
                        )}
                      </h4>
                      <p className="text-[9px] text-slate-400">
                        سنة الميلاد: {child.birthYear ? `${child.birthYear}م` : "-"} | الإقامة:{" "}
                        {child.country}
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex flex-col items-end gap-1 relative z-10"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold pointer-events-none">
                      {child.specialization}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRelativeForEdit(child);
                      }}
                      className="text-[10px] bg-white hover:bg-slate-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100 transition-colors font-bold pointer-events-auto"
                    >
                      تعديل
                    </button>
                  </div>
                </Reorder.Item>
              ))}

              {myChildren.length === 0 && !showAddChild && (
                <div className="py-8 text-center text-slate-400 text-xs leading-relaxed">
                  لا يوجد أولاد مسجلين تحت اسمك في الشجرة حتى الآن. اضغط على زر
                  "إضافة ولد" لربط أولادك بالشجرة.
                </div>
              )}
            </Reorder.Group>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200/60 pb-3">
                الأصول والإخوة
              </h3>

              <div className="space-y-3">
                {[father, grandfather, greatGrandfather].map((relative, i) => {
                  if (!relative) return null;
                  const labels = ["الأب", "الجد", "أبو الجد"];
                  return (
                    <div
                      key={relative.id}
                      className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between gap-3 relative"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center font-bold text-[11px] overflow-hidden shrink-0">
                          <GenderUserIcon gender="male" size={22} isAlive={relative.isAlive} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">
                            {relative.name}
                          </h4>
                          <p className="text-[9px] text-slate-400">
                            {labels[i]}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedRelativeForEdit(relative)}
                        className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg transition-colors font-bold"
                      >
                        تعديل
                      </button>
                    </div>
                  );
                })}

                {siblings.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-500">
                      الإخوة والأخوات ({siblings.length})
                    </h4>
                    {siblings.map((sibling) => (
                      <div
                        key={sibling.id}
                        className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between gap-3 relative"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center font-bold text-[11px] overflow-hidden shrink-0">
                            {sibling.gender === "female" ? (
                              <Venus size={14} />
                            ) : (
                              <Mars size={14} />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs">
                              {sibling.name}
                            </h4>
                            <p className="text-[9px] text-slate-400">
                              {sibling.gender === "female" ? "أخت" : "أخ"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedRelativeForEdit(sibling)}
                          className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg transition-colors font-bold"
                        >
                          تعديل
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action: Logout */}
        {onLogout && (
          <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs">
            <div>
              <h4 className="text-sm font-bold text-slate-800">تسجيل الخروج من الحساب</h4>
              <p className="text-xs text-slate-500 mt-0.5">يمكنك تسجيل الخروج والعودة في أي وقت باستخدام بيانات حسابك.</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 hover:text-rose-800 font-bold px-6 py-3 rounded-2xl text-xs md:text-sm transition-all border border-rose-200 cursor-pointer"
              id="profile-bottom-logout-btn"
              title="تسجيل الخروج من الحساب"
            >
              <LogOut size={16} className="text-rose-600" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        )}
      {selectedRelativeForEdit && (
        <EditRelativeModal
          relative={selectedRelativeForEdit}
          onClose={() => setSelectedRelativeForEdit(null)}
          onSave={(updated) => {
            onUpdateMember(updated);
            setSelectedRelativeForEdit(null);
          }}
        />
      )}
    </div>
  );
}
