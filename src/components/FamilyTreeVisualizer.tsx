import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { FamilyMember, SpouseInfo, getMemberSpouses } from '../types';
import { Search, MapPin, Award, Heart, HelpCircle, Eye, EyeOff, User, GitCommit, ChevronDown, ChevronRight, Share2, CornerDownLeft, Network, LogIn, UserPlus, X, Trash2, Plus, Minus, ZoomIn, ZoomOut, Mars, Venus, Edit2, GripVertical, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GenderUserIcon } from './GenderIcon';
import AvatarImage from './AvatarImage';
import SpouseEditor from './SpouseEditor';
import ChildrenListEditor from './ChildrenListEditor';


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

// Helper to determine gender: explicit gender always takes precedence over name guessing
const isMemberFemale = (member?: { gender?: string; name?: string } | null): boolean => {
  if (!member) return false;
  if (member.gender === 'female') return true;
  if (member.gender === 'male') return false;
  if (!member.name) return false;
  const femaleNames = ['فاطمة', 'سارة', 'هند', 'سعاد', 'منى', 'ريم', 'حصة', 'نورة', 'أميرة', 'عائشة', 'فاطمه', 'ساره', 'مريم', 'زينب', 'خديجة', 'رندة', 'ليلى', 'رنا', 'رانية', 'هالة', 'سهى'];
  const firstWord = member.name.trim().split(' ')[0];
  return femaleNames.includes(firstWord);
};

interface FamilyTreeVisualizerProps {
  members: FamilyMember[];
  initialSelectedMemberId?: string | null;
  onClearInitialSelection?: () => void;
  onSelectMember?: (member: FamilyMember) => void;
  isApprovedMember: boolean;
  onOpenAuth: () => void;
  isAdmin?: boolean;
  onAddMemberDirectly?: (member: Omit<FamilyMember, 'id' | 'childrenIds'>) => void | string;
  onDeleteMember?: (id: string) => void;
  onUpdateMember?: (updated: FamilyMember) => void;
  onUpdateMembers?: (updatedList: FamilyMember[]) => void;
  currentSession?: any;
}

export default function FamilyTreeVisualizer({ 
  members,
  initialSelectedMemberId,
  onClearInitialSelection,
  isApprovedMember,  
  onOpenAuth,
  isAdmin = false,
  onAddMemberDirectly,
  onDeleteMember,
  onUpdateMember,
  onUpdateMembers,
  currentSession
}: FamilyTreeVisualizerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'tree' | 'directory'>('tree');
  const [isSortedByAge, setIsSortedByAge] = useState(false);
  
  // Navigation State
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});

  const [isReorderMode, setIsReorderMode] = useState(false);
  const [canDragId, setCanDragId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Helper to check if logged in user has rights to reorder siblings of a given member
  const canUserReorderSiblingsOf = useCallback((member: FamilyMember) => {
    if (!isApprovedMember) return false;
    if (isAdmin) return true; // Admin has the right to reorder any siblings in the tree
    if (!currentSession || !currentSession.userId) return false;

    const parentId = member.fatherId || member.motherId;
    if (!parentId) return false; // Root has no parent/siblings

    const userId = currentSession.userId;
    const userMember = members.find(m => m.id === userId);
    if (!userMember) return false;

    // 1. Check if parentId is the user themselves (reordering user's own children)
    if (parentId === userId) return true;

    // 2. Check if parentId is the user's parents (reordering user's own siblings)
    const userFatherId = userMember.fatherId;
    const userMotherId = userMember.motherId;
    if ((userFatherId && parentId === userFatherId) || (userMotherId && parentId === userMotherId)) {
      return true;
    }

    // 3. Check if parentId is the user's grandparents (reordering user's uncles/aunts)
    const userGrandparents = new Set<string>();
    if (userFatherId) {
      const father = members.find(m => m.id === userFatherId);
      if (father) {
        if (father.fatherId) userGrandparents.add(father.fatherId);
        if (father.motherId) userGrandparents.add(father.motherId);
      }
    }
    if (userMotherId) {
      const mother = members.find(m => m.id === userMotherId);
      if (mother) {
        if (mother.fatherId) userGrandparents.add(mother.fatherId);
        if (mother.motherId) userGrandparents.add(mother.motherId);
      }
    }
    if (userGrandparents.has(parentId)) {
      return true;
    }

    // 4. Check if parentId is the user's great-grandparents (reordering user's grandfathers' siblings/grandfathers)
    const userGreatGrandparents = new Set<string>();
    userGrandparents.forEach(grandparentId => {
      const grandparent = members.find(m => m.id === grandparentId);
      if (grandparent) {
        if (grandparent.fatherId) userGreatGrandparents.add(grandparent.fatherId);
        if (grandparent.motherId) userGreatGrandparents.add(grandparent.motherId);
      }
    });
    if (userGreatGrandparents.has(parentId)) {
      return true;
    }

    return false;
  }, [isApprovedMember, isAdmin, currentSession, members]);

  // Drag & Drop Handlers for Siblings
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    if (!isReorderMode || !isApprovedMember) {
      e.preventDefault();
      return;
    }
    const member = members.find(m => m.id === id);
    if (!member || !canUserReorderSiblingsOf(member)) {
      e.preventDefault();
      return;
    }
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isReorderMode || !draggedId || draggedId === id) return;

    const draggedMember = members.find(m => m.id === draggedId);
    const targetMember = members.find(m => m.id === id);

    if (draggedMember && targetMember && draggedMember.fatherId === targetMember.fatherId && canUserReorderSiblingsOf(draggedMember)) {
      setDragOverId(id);
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(null);
    if (!isReorderMode || !draggedId || draggedId === targetId) return;

    const draggedMember = members.find(m => m.id === draggedId);
    const targetMember = members.find(m => m.id === targetId);

    if (draggedMember && targetMember && draggedMember.fatherId === targetMember.fatherId && canUserReorderSiblingsOf(draggedMember)) {
      const draggedIndex = members.findIndex(m => m.id === draggedId);
      const targetIndex = members.findIndex(m => m.id === targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newMembers = [...members];
        const [removed] = newMembers.splice(draggedIndex, 1);
        
        // Find new target index in the modified array
        const newTargetIndex = newMembers.findIndex(m => m.id === targetId);
        newMembers.splice(newTargetIndex, 0, removed);

        if (onUpdateMembers) {
          onUpdateMembers(newMembers);
        }
      }
    }
    setDraggedId(null);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedId(null);
    setDragOverId(null);
    setCanDragId(null);
  };

  useEffect(() => {
    if (initialSelectedMemberId) {
      const member = members.find(m => m.id === initialSelectedMemberId);
      if (member) {
        setSelectedMember(member);
        
        // Expand path to the member
        let current = member;
        const newExpanded = { ...expandedBranches };
        while (current.fatherId) {
          newExpanded[current.fatherId] = true;
          const father = members.find(m => m.id === current.fatherId);
          if (father) {
            current = father;
          } else {
            break;
          }
        }
        setExpandedBranches(newExpanded);
      }
      if (onClearInitialSelection) {
        onClearInitialSelection();
      }
    }
  }, [initialSelectedMemberId, members, onClearInitialSelection]);

  const [isEditingSelected, setIsEditingSelected] = useState(false);
  const [editForm, setEditForm] = useState<FamilyMember | null>(null);

  // Dragging states for tree editing avatar
  const [treeEditAvatarAspectRatio, setTreeEditAvatarAspectRatio] = useState<number>(1);
  const [isDraggingTreeEdit, setIsDraggingTreeEdit] = useState(false);
  const [dragStartTreeEdit, setDragStartTreeEdit] = useState({ x: 0, y: 0 });
  const [touchStartDistTreeEdit, setTouchStartDistTreeEdit] = useState<number | null>(null);
  const [touchStartScaleTreeEdit, setTouchStartScaleTreeEdit] = useState<number>(1);

  // Wheel event cleanup refs & callbacks to allow zoom via mouse wheel without page scrolling
  const treeEditWheelCleanupRef = useRef<(() => void) | null>(null);
  const treeEditAvatarRef = useCallback((node: HTMLDivElement | null) => {
    if (treeEditWheelCleanupRef.current) {
      treeEditWheelCleanupRef.current();
      treeEditWheelCleanupRef.current = null;
    }
    if (node) {
      const handleWheelRaw = (e: WheelEvent) => {
        e.preventDefault();
        const zoomFactor = 0.08;
        const direction = e.deltaY < 0 ? 1 : -1;
        setEditForm(prev => {
          if (!prev) return null;
          const currentScale = prev.avatarScale ?? 1;
          const newScale = Math.max(1, Math.min(4, currentScale + direction * zoomFactor));
          return { ...prev, avatarScale: newScale };
        });
      };
      node.addEventListener('wheel', handleWheelRaw, { passive: false });
      treeEditWheelCleanupRef.current = () => {
        node.removeEventListener('wheel', handleWheelRaw);
      };
    }
  }, []);

  useEffect(() => {
    setIsEditingSelected(false);
  }, [selectedMember?.id]);

  // Comments form states
  const [newCommenterName, setNewCommenterName] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');

  useEffect(() => {
    if (currentSession && currentSession.role !== 'guest') {
      setNewCommenterName(currentSession.name);
    } else {
      setNewCommenterName('');
    }
    setNewCommentContent('');
  }, [selectedMember?.id, currentSession]);

  // Admin add member form states
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addingFatherTo, setAddingFatherTo] = useState<FamilyMember | null>(null);
  const [newMemName, setNewMemName] = useState('');
  const [newMemFatherId, setNewMemFatherId] = useState<string>('');
  const [newMemMotherId, setNewMemMotherId] = useState<string>('');
  const [newMemFatherName, setNewMemFatherName] = useState('');
  const [newMemGrandfatherName, setNewMemGrandfatherName] = useState('');
  const [newMemBirthYear, setNewMemBirthYear] = useState<number | ''>('');
  const [newMemBirthDate, setNewMemBirthDate] = useState('');
  const [newMemCountry, setNewMemCountry] = useState('');
  const [newMemSpecialization, setNewMemSpecialization] = useState('');
  const [newMemIsAlive, setNewMemIsAlive] = useState(true);
  const [newMemDeathYear, setNewMemDeathYear] = useState<string>('');
  const [newMemDeathDate, setNewMemDeathDate] = useState('');
  const [newMemBio, setNewMemBio] = useState('');
  const [newMemSpouses, setNewMemSpouses] = useState<SpouseInfo[]>([]);
  const [newMemSpouseName, setNewMemSpouseName] = useState('');
  const [newMemSpouseId, setNewMemSpouseId] = useState<string | null>(null);
  const [newMemMaritalStatus, setNewMemMaritalStatus] = useState<string>('');
  const [newMemAvatar, setNewMemAvatar] = useState('');
  const [newMemGender, setNewMemGender] = useState<'male' | 'female'>('male');

  const [isEditingFemaleFamilyText, setIsEditingFemaleFamilyText] = useState(false);
  const [editingFemaleMember, setEditingFemaleMember] = useState<FamilyMember | null>(null);
  const [femaleChildrenList, setFemaleChildrenList] = useState<string[]>([]);
  const [femaleSpouseName, setFemaleSpouseName] = useState('');

  const [activeFullscreenMember, setActiveFullscreenMember] = useState<FamilyMember | null>(null);

  const handleFatherChange = (fatherId: string) => {
    setNewMemFatherId(fatherId);
    if (fatherId) {
      const father = members.find(m => m.id === fatherId);
      if (father) {
        setNewMemFatherName(father.name);
        const resolvedGrandfather = father.fatherId 
          ? (members.find(g => g.id === father.fatherId)?.name || father.fatherName || '')
          : (father.fatherName || '');
        setNewMemGrandfatherName(resolvedGrandfather);
      }
    } else {
      setNewMemFatherName('');
      setNewMemGrandfatherName('');
    }
  };

  const handleAddChildDirectly = (parent: FamilyMember) => {
    if (isMemberFemale(parent)) {
      setEditingFemaleMember(parent);
      const parsedList = parent.childrenNamesText
        ? parent.childrenNamesText.split(/[,،\n]+/).map(s => s.trim()).filter(Boolean)
        : [];
      setFemaleChildrenList(parsedList.length > 0 ? parsedList : ['']);
      setFemaleSpouseName(parent.spouseName || '');
      setIsEditingFemaleFamilyText(true);
    } else {
      setIsAddingMember(true);
      setAddingFatherTo(null);
      setNewMemMotherId('');
      setNewMemFatherId(parent.id);
      setNewMemFatherName(parent.name);
      const resolvedGrandfather = parent.fatherId
        ? (members.find(g => g.id === parent.fatherId)?.name || parent.fatherName || '')
        : (parent.fatherName || '');
      setNewMemGrandfatherName(resolvedGrandfather);
      setNewMemCountry(parent.country || '');
    }
  };

  const handleAddFatherDirectly = (child: FamilyMember) => {
    setAddingFatherTo(child);
    setIsAddingMember(true);
    setNewMemFatherId('');
    setNewMemMotherId('');
    setNewMemFatherName('');
    setNewMemGrandfatherName('');
    setNewMemCountry(child.country || '');
  };

  const handleSaveNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddMemberDirectly) return;

    const effectiveSpouses = newMemMaritalStatus === "متزوج" ? newMemSpouses : [];
    const formattedSpouseName = effectiveSpouses.map(s => s.name).filter(Boolean).join('، ') || null;
    const formattedSpouseId = effectiveSpouses.find(s => s.id)?.id || null;

    const newId = onAddMemberDirectly({
      name: newMemName,
      fatherId: newMemFatherId || null,
      motherId: newMemMotherId || null,
      fatherName: newMemFatherName,
      grandfatherName: newMemGrandfatherName,
      birthYear: newMemBirthYear === '' ? 0 : Number(newMemBirthYear),
      birthDate: newMemBirthDate || undefined,
      country: newMemIsAlive ? (newMemCountry || 'غير محدد') : '',
      specialization: newMemSpecialization,
      isAlive: newMemIsAlive,
      deathYear: (!newMemIsAlive && newMemDeathYear) ? Number(newMemDeathYear) : null,
      deathDate: (!newMemIsAlive && newMemDeathDate) ? newMemDeathDate : undefined,
      bio: newMemBio,
      spouseName: formattedSpouseName,
      spouseId: formattedSpouseId,
      spouses: effectiveSpouses,
      maritalStatus: newMemMaritalStatus,
      avatar: newMemAvatar || undefined,
      gender: newMemGender
    });

    if (addingFatherTo && onUpdateMember && typeof newId === 'string') {
      onUpdateMember({ ...addingFatherTo, fatherId: newId });
    }

    // Reset Form
    setIsAddingMember(false);
    setAddingFatherTo(null);
    setNewMemName('');
    setNewMemFatherId('');
    setNewMemMotherId('');
    setNewMemFatherName('');
    setNewMemGrandfatherName('');
    setNewMemBirthYear('');
    setNewMemBirthDate('');
    setNewMemCountry('');
    setNewMemSpecialization('');
    setNewMemIsAlive(true);
    setNewMemDeathYear('');
    setNewMemDeathDate('');
    setNewMemBio('');
    setNewMemSpouses([]);
    setNewMemSpouseName('');
    setNewMemSpouseId(null);
    setNewMemMaritalStatus('');
    setNewMemAvatar('');
    setNewMemGender('male');
  };

  const handleSaveFemaleFamilyText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFemaleMember || !onUpdateMember) return;

    const formattedChildren = femaleChildrenList
      .map(s => s.trim())
      .filter(Boolean)
      .join('، ');

    const updated = {
      ...editingFemaleMember,
      spouseName: femaleSpouseName.trim() || null,
      childrenNamesText: formattedChildren || null,
      // also ensure marital status is updated if they fill in the spouse name
      maritalStatus: (femaleSpouseName.trim() ? 'متزوج' : editingFemaleMember.maritalStatus) as any
    };

    onUpdateMember(updated);
    
    // If the selected member in the sidebar is the one we just updated, update the selectedMember state so it reflects immediately
    if (selectedMember && selectedMember.id === editingFemaleMember.id) {
      setSelectedMember(updated);
    }

    setIsEditingFemaleFamilyText(false);
    setEditingFemaleMember(null);
    setFemaleChildrenList([]);
    setFemaleSpouseName('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !onUpdateMember) return;
    if (!newCommentContent.trim()) return;
    const finalName = (currentSession && currentSession.role !== 'guest') ? currentSession.name : (newCommenterName.trim() || 'زائر كريم');
    
    const newComment = {
      id: 'comment-' + Date.now(),
      senderName: finalName,
      senderEmail: currentSession?.email || 'guest@family.com',
      content: newCommentContent.trim(),
      createdAt: new Date().toLocaleDateString('ar-SA') + ' ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedComments = [...(selectedMember.comments || []), newComment];
    const updatedMember = {
      ...selectedMember,
      comments: updatedComments
    };

    onUpdateMember(updatedMember);
    setSelectedMember(updatedMember);
    setNewCommentContent('');
  };

  const handleSaveMemberEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm && onUpdateMember) {
      const { fatherName: resFather, grandfatherName: resGrandfather } = getResolvedLineage(editForm);
      const updatedForm = {
        ...editForm,
        fatherName: resFather || editForm.fatherName,
        grandfatherName: resGrandfather || editForm.grandfatherName,
        country: editForm.isAlive ? editForm.country : ''
      };
      onUpdateMember(updatedForm);
      setSelectedMember(updatedForm);
      setIsEditingSelected(false);
      setEditForm(null);
    }
  };

  // Get unique countries for filter
  const countries = useMemo(() => {
    const list = members.map(m => m.country).filter(Boolean);
    return Array.from(new Set(list));
  }, [members]);

  // Find patriarchs (members with no fatherId or whose father is not in the list)
  const patriarchs = useMemo(() => {
    const ids = members.map(m => m.id);
    const roots = members.filter(m => (!m.fatherId || !ids.includes(m.fatherId)) && !m.motherId);
    return roots.length > 0 ? roots : (members.length > 0 ? [members[0]] : []);
  }, [members]);

  // Group members by their fatherId for fast tree rendering
  const membersByFather = useMemo(() => {
    const map: Record<string, FamilyMember[]> = {};
    members.forEach(m => {
      if (m.fatherId) {
        if (!map[m.fatherId]) map[m.fatherId] = [];
        map[m.fatherId].push(m);
      }
    });

    if (isSortedByAge) {
      Object.keys(map).forEach(key => {
        map[key].sort((a, b) => {
          const yearA = (a.birthYear && a.birthYear > 0) ? a.birthYear : 9999;
          const yearB = (b.birthYear && b.birthYear > 0) ? b.birthYear : 9999;
          return yearA - yearB;
        });
      });
    }

    return map;
  }, [members, isSortedByAge]);

  // Helper to resolve lineage (Father and Grandfather) directly from tree hierarchy if connected
  const getResolvedLineage = (m: FamilyMember) => {
    const father = m.fatherId ? members.find(f => f.id === m.fatherId) : null;
    const grandfather = father?.fatherId ? members.find(g => g.id === father.fatherId) : null;
    const resolvedFatherName = (father?.name || m.fatherName || '').trim();
    const resolvedGrandfatherName = ((grandfather?.name || father?.fatherName || m.grandfatherName) || '').trim();
    return { fatherName: resolvedFatherName, grandfatherName: resolvedGrandfatherName };
  };

  // Helper to build full Arabic patrilineal name
  const getFullName = (m: FamilyMember) => {
    const { fatherName: fName, grandfatherName: gName } = getResolvedLineage(m);
    const connector = isMemberFemale(m) ? 'بنت' : 'بن';
    return [
      m.name,
      fName ? `${connector} ${fName}` : '',
      gName ? `بن ${gName}` : ''
    ].filter(Boolean).join(' ');
  };

  // Filtered directory members
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const fullName = getFullName(m).toLowerCase();
      
      const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
        (m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.fatherName && m.fatherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.grandfatherName && m.grandfatherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.specialization && m.specialization.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.bio && m.bio.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCountry = selectedCountry === 'all' || m.country === selectedCountry;
      const matchesStatus = selectedStatus === 'all' || 
        (selectedStatus === 'alive' && m.isAlive) || 
        (selectedStatus === 'deceased' && !m.isAlive);
        
      const matchesSpecialization = selectedSpecialization === 'all' || m.specialization === selectedSpecialization;
      
      const isFemale = isMemberFemale(m);
      const matchesGender = selectedGender === 'all' ||
        (selectedGender === 'male' && !isFemale) ||
        (selectedGender === 'female' && isFemale);
        
      const matchesMaritalStatus = selectedMaritalStatus === 'all' || m.maritalStatus === selectedMaritalStatus;

      return matchesSearch && matchesCountry && matchesStatus && matchesSpecialization && matchesGender && matchesMaritalStatus;
    });
  }, [members, searchQuery, selectedCountry, selectedStatus, selectedSpecialization, selectedGender, selectedMaritalStatus]);

  const toggleBranch = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setExpandedBranches(prev => {
      const current = Boolean(prev[id]);
      return {
        ...prev,
        [id]: !current
      };
    });
  };

  const expandAllBranches = () => {
    const newExpanded: Record<string, boolean> = {};
    members.forEach(m => {
      newExpanded[m.id] = true;
    });
    setExpandedBranches(newExpanded);
  };

  const collapseAllBranches = () => {
    const newExpanded: Record<string, boolean> = {};
    members.forEach(m => {
      newExpanded[m.id] = false;
    });
    setExpandedBranches(newExpanded);
  };

  const handleViewInTree = (member: FamilyMember, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    setViewMode('tree');
    
    let current = member;
    const newExpanded = { ...expandedBranches };
    while (current.fatherId) {
      newExpanded[current.fatherId] = true;
      const father = members.find(m => m.id === current.fatherId);
      if (father) {
        current = father;
      } else {
        break;
      }
    }
    setExpandedBranches(newExpanded);
    
    setTimeout(() => {
      const element = document.getElementById(`node-card-${member.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        element.classList.add('ring-4', 'ring-indigo-600', 'scale-105');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-indigo-600', 'scale-105');
        }, 2000);
      }
    }, 300);
  };

  // Render initials badge if avatar isn't loaded
  const renderInitials = (name: string) => {
    return name.trim().slice(0, 2);
  };

  const formatDateArabic = (dateStr?: string) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day} / ${month} / ${year}م`;
  };

  const getDescendantsCount = (nodeId: string): number => {
    const children = membersByFather[nodeId] || [];
    let count = children.length;
    for (const child of children) {
      count += getDescendantsCount(child.id);
    }
    return count;
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: FamilyMember, depth: number = 0) => {
    const children = membersByFather[node.id] || [];
    const hasChildren = children.length > 0;
    const isFemale = isMemberFemale(node);
    const isExpanded = Boolean(expandedBranches[node.id]);

    return (
      <div key={node.id} id={`node-card-${node.id}`} className="flex flex-col items-center relative transition-all duration-500">
        {/* Compact Node Card */}
        <div className="flex flex-col items-center gap-1.5 relative group/node">
          <div className="relative">
            {/* Drag Handle for Reordering Siblings */}
            {isReorderMode && canUserReorderSiblingsOf(node) && (
              <div 
                onMouseDown={() => setCanDragId(node.id)}
                onMouseUp={() => setCanDragId(null)}
                onTouchStart={() => setCanDragId(node.id)}
                onTouchEnd={() => setCanDragId(null)}
                className="absolute -top-4 left-1/2 -translate-x-1/2 p-1 bg-amber-500 hover:bg-amber-600 border border-amber-400 text-white rounded-lg shadow-md cursor-grab active:cursor-grabbing z-30 flex items-center justify-center transition-all scale-110"
                title="اسحب لتغيير ترتيب هذا الأخ"
              >
                <GripVertical size={11} />
              </div>
            )}
            <div 
              onClick={(e) => {
                if (node.avatar) {
                  e.stopPropagation();
                  setActiveFullscreenMember(node);
                } else {
                  setSelectedMember(node);
                }
              }}
              className={`w-14 h-14 rounded-full overflow-hidden border-2 relative flex items-center justify-center font-bold text-sm cursor-pointer shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md z-10 bg-white ${
                selectedMember?.id === node.id 
                  ? 'border-indigo-600 ring-4 ring-indigo-500/20 scale-105' 
                  : isFemale 
                    ? node.isAlive ? 'border-[#bb5791]' : 'border-[#bb5791]/40' 
                    : node.isAlive ? 'border-[#607fc4]' : 'border-[#607fc4]/40'
              }`}
              title={node.avatar ? `انقر لتكبير صورة ${node.name}` : `انقر لمشاهدة تفاصيل ${node.name}`}
            >
              {node.avatar ? (
                <AvatarImage 
                  src={node.avatar} 
                  alt={node.name} 
                  avatarX={node.avatarX}
                  avatarY={node.avatarY}
                  avatarScale={node.avatarScale}
                />
              ) : (
                <div className={`flex items-center justify-center ${isFemale ? 'text-[#bb5791]' : 'text-[#607fc4]'}`}>
                  <GenderUserIcon gender={isFemale ? 'female' : 'male'} size={32} className="stroke-[1.5]" isAlive={node.isAlive} />
                </div>
              )}
            </div>

            {/* Descendants Count Badge */}
            {getDescendantsCount(node.id) > 0 && (
              <div 
                className="absolute -top-1 -right-1 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm z-30" 
                title={`عدد النسل: ${getDescendantsCount(node.id)}`}
              >
                {getDescendantsCount(node.id)}
              </div>
            )}
          </div>

          {/* Under Avatar: First Name with +/- symbol if has children */}
          <div className="flex items-center gap-1 select-none">
            <div 
              onClick={() => setSelectedMember(node)}
              className="flex items-center gap-1 cursor-pointer hover:text-indigo-600 px-1.5 py-0.5 rounded-lg hover:bg-indigo-50/50 transition-all"
            >
              <span className="font-extrabold text-slate-800 text-xs whitespace-nowrap">
                {node.name}
              </span>
            </div>

            {hasChildren && (
              <button
                type="button"
                onClick={(e) => toggleBranch(node.id, e)}
                className={`w-4 h-4 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs border ${
                  isExpanded
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600'
                }`}
                title={isExpanded ? `طي أبناء ${node.name} (${children.length})` : `فتح أبناء ${node.name} (${children.length})`}
              >
                {isExpanded ? (
                  <Minus size={10} className="stroke-[3]" />
                ) : (
                  <Plus size={10} className="stroke-[3]" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Children Render if expanded */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col items-center w-full">
            {/* Vertical connector from parent to horizontal line */}
            <div className="w-[2px] h-6 bg-indigo-300"></div>

            {/* Row of children */}
            <div className="flex flex-row items-start justify-center relative">
              {children.map((child, index) => {
                const isFirst = index === 0;
                const isLast = index === children.length - 1;
                return (
                  <div 
                    key={child.id} 
                    draggable={canDragId === child.id}
                    onDragStart={(e) => handleDragStart(e, child.id)}
                    onDragOver={(e) => handleDragOver(e, child.id)}
                    onDrop={(e) => handleDrop(e, child.id)}
                    onDragEnd={handleDragEnd}
                    onDragLeave={handleDragLeave}
                    className={`flex flex-col items-center relative px-2 md:px-4 shrink-0 pt-6 transition-all duration-300 ${
                      draggedId === child.id ? 'opacity-30 scale-95 blur-xs' : ''
                    } ${
                      dragOverId === child.id ? 'border-2 border-dashed border-indigo-500 rounded-3xl bg-indigo-50/15 ring-4 ring-indigo-500/10' : ''
                    }`}
                  >
                    {/* Horizontal connector line */}
                    {children.length > 1 && (
                      <div 
                        className={`absolute top-0 h-[2px] bg-indigo-300 ${
                          isFirst 
                            ? 'right-1/2 left-0' 
                            : isLast 
                              ? 'left-1/2 right-0' 
                              : 'left-0 right-0'
                        }`}
                      ></div>
                    )}
                    {/* Vertical line to this child */}
                    <div className="absolute top-0 left-0 right-0 flex justify-center"><div className="w-[2px] h-6 bg-indigo-300"></div></div>

                    {renderTreeNode(child, depth + 1)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isApprovedMember) {
    return (
      <div className="min-h-[480px] flex flex-col items-center justify-center bg-white border border-slate-100 rounded-3xl p-8 md:p-12 shadow-sm text-center space-y-6 dir-rtl max-w-2xl mx-auto my-8">
        <div className="flex items-center justify-center w-full">
          <img 
            src="/family_logo.png" 
            alt="شعار آل الوفائي والعطائي" 
            className="w-64 h-64 md:w-80 md:h-80 object-contain hover:scale-105 transition-transform duration-300 drop-shadow-sm"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs pt-2">
          <button
            onClick={onOpenAuth}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogIn size={14} />
            تسجيل الدخول
          </button>
          <button
            onClick={onOpenAuth}
            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-extrabold text-xs px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserPlus size={14} />
            طلب حساب جديد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="tree-visualizer-container" className="space-y-8 dir-rtl text-right">
      
      {/* Search and Navigation Bar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              شجرة العائلة
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {isAdmin && (
              <button
                onClick={() => setIsAddingMember(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow"
              >
                <Plus size={14} />
                إضافة فرد جديد للشجرة
              </button>
            )}

            {isApprovedMember && viewMode === 'tree' && (
              <button
                onClick={() => setIsReorderMode(!isReorderMode)}
                className={`font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  isReorderMode 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-400' 
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
                title="تعديل ترتيب الإخوة"
              >
                <GripVertical size={13} className={isReorderMode ? 'animate-pulse text-white' : 'text-slate-500'} />
                {isReorderMode ? 'إنهاء إعادة الترتيب' : 'تعديل ترتيب الإخوة'}
              </button>
            )}

            {viewMode === 'tree' && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={expandAllBranches}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-white transition-all cursor-pointer"
                  title="فتح وتوسيع جميع فروع الشجرة"
                >
                  فتح الكل
                </button>
                <button
                  onClick={collapseAllBranches}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-white transition-all cursor-pointer"
                  title="طي جميع فروع الشجرة"
                >
                  طي الكل
                </button>
              </div>
            )}

            {/* Toggle View Mode */}
            <div className="flex bg-slate-100 p-1 rounded-xl self-start">
              <button
                onClick={() => setViewMode('tree')}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'tree' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                شجرة العائلة الهرمية
              </button>
              <button
                onClick={() => setViewMode('directory')}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'directory' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                بحث
              </button>
            </div>
          </div>
        </div>

        {/* Filters Grid */}
        {viewMode === 'directory' && (
          <div className="space-y-4 pt-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="ابحث بالاسم بالكامل، التخصص، أو السيرة..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
              />
            </div>

            {/* Directory Search Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 bg-slate-50/55 p-3.5 rounded-2xl border border-slate-100/80">
              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">الحالة</label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer font-medium"
                >
                  <option value="all">الكل (حي ومتوفى)</option>
                  <option value="alive">حي يرزق</option>
                  <option value="deceased">متوفى</option>
                </select>
              </div>

              {/* Specialization Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">مجال العمل</label>
                <select
                  value={selectedSpecialization}
                  onChange={e => setSelectedSpecialization(e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer font-medium"
                >
                  <option value="all">كل مجالات العمل</option>
                  {SPECIALIZATIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">بلد الإقامة</label>
                <select
                  value={selectedCountry}
                  onChange={e => setSelectedCountry(e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer font-medium"
                >
                  <option value="all">كل البلدان</option>
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Gender Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">الجنس</label>
                <select
                  value={selectedGender}
                  onChange={e => setSelectedGender(e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer font-medium"
                >
                  <option value="all">الجنس (الكل)</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>

              {/* Marital Status Filter */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-bold text-slate-500 mb-1">الحالة الاجتماعية</label>
                <select
                  value={selectedMaritalStatus}
                  onChange={e => setSelectedMaritalStatus(e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer font-medium"
                >
                  <option value="all">الحالة الاجتماعية (الكل)</option>
                  <option value="أعزب">أعزب/عزباء</option>
                  <option value="متزوج">متزوج/متزوجة</option>
                  <option value="مرتبط">مرتبط/مرتبطة</option>
                  <option value="منفصل/ أرمل">منفصل/أرمل</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Tree Container / Directory Grid */}
        <div className="lg:col-span-12 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm min-h-[500px] transition-all duration-300">
          {viewMode === 'tree' ? (
            <div className="space-y-4">


              {isReorderMode && (
                <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 text-amber-800 text-xs font-medium md:text-sm shadow-xs animate-fade-in mb-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    <strong className="text-amber-900">وضع إعادة الترتيب نشط:</strong>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    {isAdmin
                      ? "بصفتك مسؤولاً (آدمن)، يمكنك إعادة ترتيب أي إخوة في أي فرع من فروع الشجرة. اضغط واسحب مقبض السحب الأصفر الموجود أعلى الدائرة للشخص المراد تعديل ترتيبه."
                      : "يمكنك فقط إعادة ترتيب أبنائك أو إخوتك أو أعمامك أو أجدادك. اضغط واسحب مقبض السحب الأصفر الموجود أعلى الدائرة للشخص المراد نقله لتعديل ترتيبه بين إخوته."}
                  </p>
                </div>
              )}
              
              <div className="overflow-x-auto pb-4">
                <div className="min-w-max flex justify-center p-4 gap-12">
                  {patriarchs.length > 0 ? (
                    patriarchs.map(p => (
                      <div key={p.id}>
                        {renderTreeNode(p)}
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-center py-16 px-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center max-w-lg mx-auto">
                      <Network size={48} className="text-indigo-400 mb-4 stroke-[1.5]" />
                      <h4 className="text-sm font-extrabold text-slate-700 mb-2">شجرة العائلة فارغة حالياً</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-6 max-w-sm">
                        لقد قمنا بتهيئة البوابة وحذف البيانات التجريبية لتتمكن من بناء شجرتك الحقيقية. ابدأ الآن بإضافة الجد الأكبر (رأس الشجرة) ليتفرع منه باقي الأجيال والأنسباء.
                      </p>
                      {isAdmin ? (
                        <button
                          onClick={() => {
                            setNewMemFatherId('');
                            setNewMemFatherName('');
                            setNewMemGrandfatherName('');
                            setIsAddingMember(true);
    setAddingFatherTo(null);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
                        >
                          <Plus size={16} />
                          إضافة الجد الأكبر (رأس الشجرة)
                        </button>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-3.5 text-xs text-amber-800 font-medium">
                          يرجى تسجيل الدخول كمسؤول (آدمن) أو محاكاة دور الآدمن من الشريط السفلي لإضافة أول فرد وتأسيس الشجرة.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Directory view
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-500">تم العثور على {filteredMembers.length} فرد</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredMembers.map(member => {
                  const isFemale = isMemberFemale(member);
                  
                  // Calculate age
                  let birthYearNum = member.birthYear;
                  if (!birthYearNum && member.birthDate) {
                    const b = new Date(member.birthDate);
                    if (!isNaN(b.getTime())) birthYearNum = b.getFullYear();
                  }
                  
                  let calculatedAge: number | null = null;
                  if (birthYearNum && birthYearNum > 0) {
                    const endYear = member.isAlive ? CURRENT_YEAR : (member.deathYear || (member.deathDate ? new Date(member.deathDate).getFullYear() : CURRENT_YEAR));
                    calculatedAge = Math.max(0, endYear - birthYearNum);
                  }

                  return (
                    <div
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-100 rounded-2xl p-4 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          onClick={(e) => {
                            if (member.avatar) {
                              e.stopPropagation();
                              setActiveFullscreenMember(member);
                            }
                          }}
                          className={`w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 relative flex items-center justify-center font-bold text-sm hover:scale-105 transition-transform duration-200 cursor-pointer bg-white ${
                            isFemale 
                              ? member.isAlive ? 'border-[#bb5791]' : 'border-[#bb5791]/40' 
                              : member.isAlive ? 'border-[#607fc4]' : 'border-[#607fc4]/40'
                          }`}
                          title={member.avatar ? `انقر لتكبير صورة ${member.name}` : undefined}
                        >
                          {member.avatar ? (
                            <AvatarImage 
                              src={member.avatar} 
                              alt={member.name} 
                              avatarX={member.avatarX}
                              avatarY={member.avatarY}
                              avatarScale={member.avatarScale}
                            />
                          ) : (
                            <span className={isFemale ? 'text-[#bb5791]' : 'text-[#607fc4]'}>
                              <GenderUserIcon gender={isFemale ? 'female' : 'male'} size={26} className="stroke-[1.5]" isAlive={member.isAlive} />
                            </span>
                          )}
                        </div>
                        
                        <div className="text-right min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors truncate">
                            {getFullName(member)}
                          </h4>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                            {member.isAlive ? (
                              member.country ? (
                                <>
                                  <MapPin size={11} className="text-slate-400 shrink-0" />
                                  <span className="truncate">{member.country}</span>
                                </>
                              ) : null
                            ) : (
                              <span className="text-rose-600 font-medium">
                                {(() => {
                                  let dYear = member.deathYear;
                                  if (!dYear && member.deathDate) {
                                    const d = new Date(member.deathDate);
                                    if (!isNaN(d.getTime())) dYear = d.getFullYear();
                                  }
                                  if (dYear) {
                                    return `متوفي منذ ${CURRENT_YEAR - dYear} سنة`;
                                  }
                                  return 'متوفى (رحمه الله)';
                                })()}
                              </span>
                            )}
                          </div>
                          {calculatedAge !== null && (
                            <span className="inline-block bg-slate-200/50 text-slate-700 text-[9px] px-1.5 py-0.5 rounded-md mt-1 font-semibold">
                              العمر: {calculatedAge} سنة
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleViewInTree(member, e)}
                        className="shrink-0 bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 border border-indigo-100/30"
                        title="رؤية في الشجرة"
                      >
                        <Network size={12} />
                        رؤية في الشجرة
                      </button>
                    </div>
                  );
                })}

                {filteredMembers.length === 0 && (
                  <div className="col-span-full py-16 text-center text-slate-400">
                    <Search className="mx-auto mb-2 text-slate-300" size={36} />
                    <p className="text-sm">لم نجد نتائج مطابقة لفلترة البحث الحالية.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Selected Member Profile Card Side Drawer */}
        {selectedMember && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMember.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border-2 border-slate-100 shadow-2xl rounded-3xl p-6 space-y-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => setSelectedMember(null)} className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors z-10"><X size={16} /></button>
                {!isEditingSelected ? (
                  <>
                {/* Header Profile Photo */}
                <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100 space-y-3">
                  <div className="relative">
                    <div 
                      onClick={() => {
                        if (selectedMember.avatar) {
                          setActiveFullscreenMember(selectedMember);
                        }
                      }}
                      className={`w-24 h-24 rounded-full overflow-hidden border-4 relative flex items-center justify-center hover:scale-105 transition-transform duration-200 bg-white ${
                        selectedMember.avatar ? 'cursor-pointer' : ''
                      } ${
                        isMemberFemale(selectedMember) 
                          ? selectedMember.isAlive ? 'border-[#bb5791]' : 'border-[#bb5791]/40'
                          : selectedMember.isAlive ? 'border-[#607fc4]' : 'border-[#607fc4]/40'
                      }`}
                      title={selectedMember.avatar ? `انقر لتكبير صورة ${selectedMember.name}` : undefined}
                    >
                      {selectedMember.avatar ? (
                        <AvatarImage 
                          src={selectedMember.avatar} 
                          alt={selectedMember.name} 
                          avatarX={selectedMember.avatarX}
                          avatarY={selectedMember.avatarY}
                          avatarScale={selectedMember.avatarScale}
                        />
                      ) : (
                        <span className={`flex items-center justify-center h-full ${isMemberFemale(selectedMember) ? 'text-[#bb5791]' : 'text-[#607fc4]'}`}>
                          <GenderUserIcon gender={isMemberFemale(selectedMember) ? 'female' : 'male'} size={48} isAlive={selectedMember.isAlive} />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800">
                      {getFullName(selectedMember)}
                    </h3>
                  </div>
                </div>

                {/* Specific Fields */}
                <div className="space-y-4 text-xs">
                  {/* Birth Date */}
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <User className="text-indigo-600 shrink-0" size={16} />
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-slate-400 font-bold">تاريخ الميلاد</span>
                      <span className="font-semibold text-slate-700">
                        {selectedMember.birthDate ? formatDateArabic(selectedMember.birthDate) : (selectedMember.birthYear ? `${selectedMember.birthYear}م` : '-')}
                      </span>
                    </div>
                  </div>

                  {/* Death Date (if applicable) */}
                  {!selectedMember.isAlive && (
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <User className="text-slate-500 shrink-0" size={16} />
                      <div className="space-y-0.5">
                        <span className="block text-[10px] text-slate-400 font-bold">تاريخ الوفاة</span>
                        <span className="font-semibold text-slate-700">
                          {selectedMember.deathDate ? formatDateArabic(selectedMember.deathDate) : (selectedMember.deathYear ? `${selectedMember.deathYear}م` : '-')}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Gender */}
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {isMemberFemale(selectedMember) ? (
                      <Venus className="shrink-0 text-[#bb5791]" size={16} />
                    ) : (
                      <Mars className="shrink-0 text-[#607fc4]" size={16} />
                    )}
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-slate-400 font-bold">الجنس</span>
                      <span className="font-semibold text-slate-700">
                        {isMemberFemale(selectedMember) ? 'أنثى' : 'ذكر'}
                      </span>
                    </div>
                  </div>

                  {/* Residence */}
                  {selectedMember.isAlive && (
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <MapPin className="text-indigo-600 shrink-0" size={16} />
                      <div className="space-y-0.5">
                        <span className="block text-[10px] text-slate-400 font-bold">بلد الإقامة الحالي</span>
                        <span className="font-semibold text-slate-700">{selectedMember.country || 'غير محدد'}</span>
                      </div>
                    </div>
                  )}

                  {/* Specialization */}
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <Award className="text-indigo-600 shrink-0" size={16} />
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-slate-400 font-bold">التخصص المهني/العلمي</span>
                      <span className="font-semibold text-slate-700">{selectedMember.specialization || 'غير محدد'}</span>
                    </div>
                  </div>

                  {/* Spouses if any */}
                  {(() => {
                    const memberSpouses = getMemberSpouses(selectedMember);
                    if (memberSpouses.length === 0 && !selectedMember.spouseName) return null;
                    const isFemale = isMemberFemale(selectedMember);
                    const spouseLabel = isFemale
                      ? (memberSpouses.length > 1 ? `الأزواج (${memberSpouses.length})` : 'الزوج')
                      : (memberSpouses.length > 1 ? `الزوجات (${memberSpouses.length})` : 'الزوجة');

                    return (
                      <div className="flex items-start gap-3 bg-amber-50/40 p-3 rounded-2xl border border-amber-100/60">
                        <Heart className="text-amber-600 shrink-0 mt-1" size={16} />
                        <div className="space-y-1.5 flex-1">
                          <span className="block text-[10px] text-amber-500 font-bold">
                            {spouseLabel}
                          </span>
                          <div className="space-y-1">
                            {memberSpouses.map((sp, idx) => {
                              const spouseObj = sp.id ? members.find(m => m.id === sp.id) : null;
                              return (
                                <div key={sp.id || idx} className="flex items-center justify-between text-xs">
                                  {spouseObj ? (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedMember(spouseObj)}
                                      className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline text-right cursor-pointer"
                                    >
                                      {isMemberFemale(spouseObj)
                                        ? `${spouseObj.name}${spouseObj.fatherName ? ` بنت ${spouseObj.fatherName}` : ''}`
                                        : `${spouseObj.name}${spouseObj.fatherName ? ` بن ${spouseObj.fatherName}` : ''}`}
                                    </button>
                                  ) : (
                                    <span className="font-semibold text-slate-800">{sp.name}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Free Text Bio */}
                {selectedMember.bio && selectedMember.bio.trim() !== '' && (
                  <div className="space-y-2 border-t border-slate-100 pt-4 text-right">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide font-extrabold text-slate-600">نبذة شخصية</h4>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 min-h-[80px]">
                      {selectedMember.bio}
                    </p>
                  </div>
                )}

                {/* Unified Children Section */}
                {(() => {
                  const isFemale = isMemberFemale(selectedMember);
                  
                  if (isFemale && selectedMember.childrenNamesText) {
                    const namesList = selectedMember.childrenNamesText
                      .split(/[،,]+/)
                      .map(name => name.trim())
                      .filter(Boolean);
                      
                    if (namesList.length > 0) {
                      return (
                        <div className="space-y-2 border-t border-slate-100 pt-4 text-right">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide font-extrabold text-slate-600">
                            الأبناء ({namesList.length})
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {namesList.map((name, idx) => (
                              <span
                                key={idx}
                                className="flex items-center gap-1 bg-slate-50 text-slate-600 text-[10px] font-bold px-2.5 py-1.5 rounded-xl border border-slate-200/60"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  }

                  const myChildren = members.filter(m => m.fatherId === selectedMember.id || m.motherId === selectedMember.id)
                    .sort((a, b) => {
                      const yearA = a.birthYear && a.birthYear > 0 ? a.birthYear : 9999;
                      const yearB = b.birthYear && b.birthYear > 0 ? b.birthYear : 9999;
                      return yearA - yearB;
                    });
                  if (myChildren.length > 0) {
                    return (
                      <div className="space-y-2 border-t border-slate-100 pt-4 text-right">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide font-extrabold text-slate-600">
                          الأبناء ({myChildren.length})
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {myChildren.map(child => (
                            <button
                              key={child.id}
                              onClick={() => setSelectedMember(child)}
                              className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all border border-indigo-100/60 cursor-pointer"
                            >
                              <CornerDownLeft size={10} />
                              {child.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Comments & Guestbook Section */}
                <div className="space-y-4 border-t border-slate-100 pt-4 text-right">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 font-extrabold text-slate-600">
                      <MessageSquare size={14} className="text-indigo-600" />
                      التعليقات والمباركات ({selectedMember.comments?.length || 0})
                    </h4>
                  </div>

                  {/* List of comments */}
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {(!selectedMember.comments || selectedMember.comments.length === 0) ? (
                      <p className="text-[11px] text-slate-400 text-center py-4 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                        لا توجد تعليقات بعد. اكتب كلمة طيبة أو مباركة للفرد!
                      </p>
                    ) : (
                      selectedMember.comments.map((comment) => {
                        const isCommenterFamilyMember = members.some(m => m.name === comment.senderName || `${m.name} بن ${m.fatherName}` === comment.senderName);
                        return (
                          <div key={comment.id} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-700 text-[11px]">{comment.senderName}</span>
                                {comment.senderEmail === 'admin@family.com' ? (
                                  <span className="bg-red-50 text-red-600 border border-red-100 rounded-md px-1.5 py-0.5 text-[8px] font-bold">مدير البوابة</span>
                                ) : isCommenterFamilyMember ? (
                                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md px-1.5 py-0.5 text-[8px] font-bold">فرد من العائلة</span>
                                ) : null}
                              </div>
                              <span className="text-[8px] text-slate-400">{comment.createdAt}</span>
                            </div>
                            <p className="text-slate-600 text-xs leading-relaxed font-medium">{comment.content}</p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add comment form */}
                  <form onSubmit={handleAddComment} className="bg-slate-50/50 border border-slate-100 p-3 rounded-2xl space-y-2.5 text-right">
                    <span className="text-[10px] font-bold text-slate-500 block">إضافة تعليق أو كلمة تهنئة</span>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {/* Name input - visible & editable only for guests, prefilled & read-only for logged-in members */}
                      {(!currentSession || currentSession.role === 'guest') ? (
                        <input
                          type="text"
                          required
                          placeholder="اسمك الكريم"
                          value={newCommenterName}
                          onChange={(e) => setNewCommenterName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-right text-slate-700"
                        />
                      ) : (
                        <div className="bg-slate-100/80 text-slate-500 border border-slate-200/60 rounded-xl px-2.5 py-1.5 text-xs font-semibold select-none flex items-center justify-between">
                          <span>المعلق: {currentSession.name}</span>
                          <span className="text-[8px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md font-bold">تم التحقق</span>
                        </div>
                      )}

                      <textarea
                        required
                        rows={2}
                        placeholder="اكتب تهنئة، مباركة، أو كلمة طيبة هنا..."
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed text-right text-slate-700"
                      />
                    </div>

                    <div className="flex justify-start">
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-4 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        إرسال التعليق
                      </button>
                    </div>
                  </form>
                </div>

                {isAdmin && (
                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                    <div className="flex gap-2 w-full">
                      {isMemberFemale(selectedMember) ? (
                        <button
                          type="button"
                          onClick={() => handleAddChildDirectly(selectedMember)}
                          className="flex-1 text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <UserPlus size={14} />
                          إضافة ولد/بنت
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddChildDirectly(selectedMember)}
                          className="flex-1 text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <UserPlus size={14} />
                          إضافة ابن
                        </button>
                      )}
                      {(!selectedMember.fatherId || !members.find(m => m.id === selectedMember.fatherId)) && (
                        <button
                          type="button"
                          onClick={() => handleAddFatherDirectly(selectedMember)}
                          className="flex-1 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <UserPlus size={14} />
                          إضافة أب
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 w-full">
                      {onUpdateMember && (
                        <button
                          type="button"
                          onClick={() => {
                            const { fatherName: resFather, grandfatherName: resGrandfather } = getResolvedLineage(selectedMember);
                            setEditForm({
                              ...selectedMember,
                              fatherName: resFather,
                              grandfatherName: resGrandfather,
                              spouses: getMemberSpouses(selectedMember)
                            });
                            setIsEditingSelected(true);
                          }}
                          className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 rounded-xl transition-all flex items-center justify-center gap-2 py-2 cursor-pointer text-xs font-bold"
                          title="تعديل بيانات الفرد"
                        >
                          <Edit2 size={14} />
                          تعديل البيانات
                        </button>
                      )}
                      {onDeleteMember && (
                        <button
                          type="button"
                          onClick={() => setMemberToDelete(selectedMember.id)}
                          className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all flex items-center justify-center gap-2 py-2 cursor-pointer text-xs font-bold"
                          title="حذف هذا الفرد"
                        >
                          <Trash2 size={14} />
                          حذف الفرد
                        </button>
                      )}
                    </div>
                  </div>
                )}

                  </>
                ) : (
                  editForm && (
                    <form onSubmit={handleSaveMemberEdit} className="bg-amber-50/50 border border-amber-200 p-5 rounded-2xl space-y-4 shadow-sm">
                      <h4 className="text-xs font-bold text-amber-800 border-b border-amber-200 pb-2">تعديل بيانات {editForm.name}</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الاسم الأول</label>
                          <input type="text" required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                              اسم الأب <span className="text-[9px] text-amber-700 font-normal">(مربوط بالشجرة)</span>
                            </label>
                            <input 
                              type="text" 
                              value={editForm.fatherName} 
                              disabled 
                              className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-slate-100 text-slate-500 cursor-not-allowed select-none" 
                              title="اسم الأب مرتبط بالشجرة تلقائياً ولا يمكن تعديله يدوياً"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                              اسم الجد <span className="text-[9px] text-amber-700 font-normal">(مربوط بالشجرة)</span>
                            </label>
                            <input 
                              type="text" 
                              value={editForm.grandfatherName} 
                              disabled 
                              className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-slate-100 text-slate-500 cursor-not-allowed select-none" 
                              title="اسم الجد مرتبط بالشجرة تلقائياً ولا يمكن تعديله يدوياً"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className={editForm.isAlive ? "col-span-2" : ""}>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">تاريخ الميلاد</label>
                            <input
                              type="date"
                              value={editForm.birthDate || ''}
                              onChange={e => {
                                const val = e.target.value;
                                if (val) {
                                  const yr = new Date(val).getFullYear();
                                  setEditForm({ ...editForm, birthDate: val, birthYear: yr });
                                } else {
                                  setEditForm({ ...editForm, birthDate: '', birthYear: 0 });
                                }
                              }}
                              className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white cursor-pointer"
                            />
                          </div>
                          {!editForm.isAlive && (
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">تاريخ الوفاة</label>
                              <input
                                type="date"
                                value={editForm.deathDate || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  if (val) {
                                    const yr = new Date(val).getFullYear();
                                    setEditForm({ ...editForm, deathDate: val, deathYear: yr });
                                  } else {
                                    setEditForm({ ...editForm, deathDate: '', deathYear: null });
                                  }
                                }}
                                className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {editForm.isAlive && (
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">بلد الإقامة</label>
                              <select value={editForm.country || ''} onChange={e => setEditForm({...editForm, country: e.target.value})} className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white cursor-pointer">
                                <option value="">بلد الإقامة...</option>
                                {ARAB_COUNTRIES.map(c => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                          )}
                          <div className={editForm.isAlive ? "" : "col-span-2"}>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">التخصص المهني/العلمي</label>
                            <select value={editForm.specialization || ''} onChange={e => setEditForm({...editForm, specialization: e.target.value})} className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white cursor-pointer">
                              <option value="">التخصص المهني...</option>
                              {SPECIALIZATIONS.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الحالة الاجتماعية</label>
                            <select
                              value={editForm.maritalStatus || ''}
                              onChange={e => {
                                const newStatus = e.target.value as any;
                                setEditForm({
                                  ...editForm,
                                  maritalStatus: newStatus,
                                  spouses: newStatus === 'متزوج' ? (editForm.spouses || getMemberSpouses(editForm)) : [],
                                  spouseName: newStatus === 'متزوج' ? editForm.spouseName : null,
                                  spouseId: newStatus === 'متزوج' ? editForm.spouseId : null
                                });
                              }}
                              className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white cursor-pointer"
                            >
                              <option value="">( اختر )</option>
                              <option value="أعزب">أعزب</option>
                              <option value="مرتبط">مرتبط</option>
                              <option value="متزوج">متزوج</option>
                              <option value="منفصل/ أرمل">منفصل/ أرمل</option>
                            </select>
                          </div>
                        </div>

                        {editForm.maritalStatus === 'متزوج' && (
                          <div className="pt-1">
                            <SpouseEditor
                              gender={editForm.gender}
                              memberName={editForm.name}
                              currentMemberId={editForm.id}
                              spouses={editForm.spouses || getMemberSpouses(editForm)}
                              onChange={(newSpouses) => {
                                setEditForm({
                                  ...editForm,
                                  spouses: newSpouses,
                                  spouseName: newSpouses.map(s => s.name).filter(Boolean).join('، ') || null,
                                  spouseId: newSpouses.find(s => s.id)?.id || null
                                });
                              }}
                              allMembers={members}
                              compact={true}
                            />
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الحالة</label>
                            <select value={editForm.isAlive ? 'alive' : 'deceased'} onChange={e => setEditForm({...editForm, isAlive: e.target.value === 'alive', deathYear: e.target.value === 'alive' ? null : editForm.deathYear})} className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white cursor-pointer">
                              <option value="alive">على قيد الحياة</option>
                              <option value="deceased">متوفى</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الجنس</label>
                            <select value={editForm.gender || 'male'} onChange={e => setEditForm({...editForm, gender: e.target.value as 'male' | 'female'})} className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white cursor-pointer">
                              <option value="male">ذكر</option>
                              <option value="female">أنثى</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الصورة الشخصية</label>
                          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    setEditForm({ ...editForm, avatar: ev.target?.result as string, avatarScale: 1, avatarX: 0, avatarY: 0 });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer"
                            />
                            {editForm.avatar && (
                              <button
                                type="button"
                                onClick={() => setEditForm({ ...editForm, avatar: undefined, avatarScale: 1, avatarX: 0, avatarY: 0 })}
                                className="text-[10px] text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer"
                              >
                                حذف الصورة
                              </button>
                            )}
                          </div>

                          {editForm.avatar && (
                            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 mt-2 flex flex-col items-center justify-center gap-2">
                              <span className="text-[9px] font-bold text-slate-500">اسحب للتحريك • عجلة الماوس أو اللمس للتكبير</span>
                              
                              <div className="flex items-center gap-3">
                                {/* Zoom Out Button */}
                                <button
                                  type="button"
                                  onClick={() => setEditForm(prev => {
                                    if (!prev) return null;
                                    return { ...prev, avatarScale: Math.max(1, (prev.avatarScale ?? 1) - 0.1) };
                                  })}
                                  className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-200 active:scale-95 transition-all shadow-xs cursor-pointer"
                                  title="تصغير"
                                >
                                  <ZoomOut size={12} />
                                </button>

                                {/* Interactive Container with Ref */}
                                <div 
                                  ref={treeEditAvatarRef}
                                  className={`w-20 h-20 rounded-full overflow-hidden border-2 border-white bg-slate-100 shadow-sm relative flex items-center justify-center select-none touch-none ${isDraggingTreeEdit ? 'cursor-grabbing' : 'cursor-grab'}`}
                                  onMouseDown={(e) => {
                                    setIsDraggingTreeEdit(true);
                                    setDragStartTreeEdit({ x: e.clientX, y: e.clientY });
                                  }}
                                  onMouseMove={(e) => {
                                    if (!isDraggingTreeEdit) return;
                                    const dx = e.clientX - dragStartTreeEdit.x;
                                    const dy = e.clientY - dragStartTreeEdit.y;
                                    const containerWidth = 80;
                                    const scale = editForm.avatarScale ?? 1;
                                    const sensitivity = 100 / (containerWidth * scale);
                                    setEditForm({
                                      ...editForm,
                                      avatarX: Math.max(-100, Math.min(100, (editForm.avatarX ?? 0) + dx * sensitivity)),
                                      avatarY: Math.max(-100, Math.min(100, (editForm.avatarY ?? 0) + dy * sensitivity))
                                    });
                                    setDragStartTreeEdit({ x: e.clientX, y: e.clientY });
                                  }}
                                  onMouseUp={() => setIsDraggingTreeEdit(false)}
                                  onMouseLeave={() => setIsDraggingTreeEdit(false)}
                                  onTouchStart={(e) => {
                                    if (e.touches.length === 1) {
                                      setIsDraggingTreeEdit(true);
                                      const touch = e.touches[0];
                                      setDragStartTreeEdit({ x: touch.clientX, y: touch.clientY });
                                      setTouchStartDistTreeEdit(null);
                                    } else if (e.touches.length === 2) {
                                      setIsDraggingTreeEdit(false);
                                      const t1 = e.touches[0];
                                      const t2 = e.touches[1];
                                      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
                                      setTouchStartDistTreeEdit(dist);
                                      setTouchStartScaleTreeEdit(editForm.avatarScale ?? 1);
                                    }
                                  }}
                                  onTouchMove={(e) => {
                                    if (e.touches.length === 1 && isDraggingTreeEdit) {
                                      const touch = e.touches[0];
                                      const dx = touch.clientX - dragStartTreeEdit.x;
                                      const dy = touch.clientY - dragStartTreeEdit.y;
                                      const containerWidth = 80;
                                      const scale = editForm.avatarScale ?? 1;
                                      const sensitivity = 100 / (containerWidth * scale);
                                      setEditForm({
                                        ...editForm,
                                        avatarX: Math.max(-100, Math.min(100, (editForm.avatarX ?? 0) + dx * sensitivity)),
                                        avatarY: Math.max(-100, Math.min(100, (editForm.avatarY ?? 0) + dy * sensitivity))
                                      });
                                      setDragStartTreeEdit({ x: touch.clientX, y: touch.clientY });
                                    } else if (e.touches.length === 2 && touchStartDistTreeEdit !== null) {
                                      const t1 = e.touches[0];
                                      const t2 = e.touches[1];
                                      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
                                      const factor = dist / touchStartDistTreeEdit;
                                      const newScale = Math.max(1, Math.min(4, touchStartScaleTreeEdit * factor));
                                      setEditForm({
                                        ...editForm,
                                        avatarScale: newScale
                                      });
                                    }
                                  }}
                                  onTouchEnd={() => {
                                    setIsDraggingTreeEdit(false);
                                    setTouchStartDistTreeEdit(null);
                                  }}
                                >
                                  <img 
                                    src={editForm.avatar} 
                                    alt="Avatar Preview" 
                                    className="absolute origin-center pointer-events-none select-none" 
                                    referrerPolicy="no-referrer" 
                                    style={{ 
                                      left: '50%',
                                      top: '50%',
                                      transform: `translate(-50%, -50%) translate(${editForm.avatarX ?? 0}%, ${editForm.avatarY ?? 0}%) scale(${editForm.avatarScale ?? 1})`,
                                      width: treeEditAvatarAspectRatio > 1 ? 'auto' : '100%',
                                      height: treeEditAvatarAspectRatio > 1 ? '100%' : 'auto',
                                      maxWidth: 'none',
                                      maxHeight: 'none',
                                    }} 
                                    onLoad={(e) => {
                                      const img = e.currentTarget;
                                      setTreeEditAvatarAspectRatio(img.naturalWidth / img.naturalHeight);
                                    }}
                                    draggable={false}
                                    onDragStart={(e) => e.preventDefault()}
                                  />
                                </div>

                                {/* Zoom In Button */}
                                <button
                                  type="button"
                                  onClick={() => setEditForm(prev => {
                                    if (!prev) return null;
                                    return { ...prev, avatarScale: Math.max(1, Math.min(4, (prev.avatarScale ?? 1) + 0.1)) };
                                  })}
                                  className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-200 active:scale-95 transition-all shadow-xs cursor-pointer"
                                  title="تكبير"
                                >
                                  <ZoomIn size={12} />
                                </button>
                              </div>

                              {/* Reset button and Info */}
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] text-slate-500 font-medium">الزوم: <strong className="text-indigo-600">x{(editForm.avatarScale ?? 1).toFixed(2)}</strong></span>
                                <span className="text-slate-300">|</span>
                                <button
                                  type="button"
                                  onClick={() => setEditForm({ ...editForm, avatarScale: 1, avatarX: 0, avatarY: 0 })}
                                  className="text-[8px] text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md cursor-pointer hover:bg-slate-50 font-bold transition-all"
                                >
                                  إعادة تعيين الأبعاد
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">نبذة شخصية</label>
                          <textarea rows={2} value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white" />
                        </div>
                      </div>
                      
                      <div className="flex justify-start gap-2 pt-2 border-t border-amber-200/50 mt-4">
                        <button type="submit" className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-bold transition-colors">
                          حفظ التعديلات
                        </button>
                        <button type="button" onClick={() => setIsEditingSelected(false)} className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl font-bold transition-colors">
                          إلغاء
                        </button>
                      </div>
                    </form>
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

      </div>
      {isAddingMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm md:text-base font-extrabold text-slate-800 flex items-center gap-2">
                <UserPlus size={18} className="text-emerald-600" />
                {addingFatherTo ? `إضافة أب لـ ${addingFatherTo.name}` : (newMemMotherId ? `إضافة ولد لـ ${members.find(m => m.id === newMemMotherId)?.name}` : (newMemFatherName ? `إضافة ابن لـ ${newMemFatherName}` : 'إضافة الجد الأكبر (رأس الشجرة)'))}
              </h3>
              <button
                onClick={() => setIsAddingMember(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveNewMember} className="p-6 overflow-y-auto space-y-4 text-xs md:text-sm text-right">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الاسم الأول للفرد *</label>
                  <input
                    type="text"
                    required
                    placeholder="الاسم الأول للفرد"
                    value={newMemName}
                    onChange={e => setNewMemName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ربطه بالأب في الشجرة</label>
                  <select
                    value={newMemFatherId}
                    onChange={e => handleFatherChange(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                  >
                    <option value="">-- فرع جديد (دون أب محدد) --</option>
                    {members.filter(m => !isMemberFemale(m)).map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} بن {m.fatherName} {m.country ? `(${m.country})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Patrilineal details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">اسم الأب بالكامل *</label>
                  <input
                    type="text"
                    required
                    placeholder="اسم الأب بالكامل"
                    value={newMemFatherName}
                    onChange={e => setNewMemFatherName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">اسم الجد بالكامل *</label>
                  <input
                    type="text"
                    required
                    placeholder="اسم الجد بالكامل"
                    value={newMemGrandfatherName}
                    onChange={e => setNewMemGrandfatherName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Birth / Death Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">تاريخ الميلاد</label>
                  <input
                    type="date"
                    value={newMemBirthDate}
                    onChange={e => {
                      const val = e.target.value;
                      setNewMemBirthDate(val);
                      if (val) {
                        setNewMemBirthYear(new Date(val).getFullYear());
                      } else {
                        setNewMemBirthYear('');
                      }
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                  />
                </div>
                {/* Marital Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الحالة الاجتماعية</label>
                  <select
                    value={newMemMaritalStatus}
                    onChange={e => setNewMemMaritalStatus(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                  >
                    <option value="">( اختر )</option>
                    <option value="أعزب">أعزب</option>
                    <option value="مرتبط">مرتبط</option>
                    <option value="متزوج">متزوج</option>
                    <option value="منفصل/ أرمل">منفصل/ أرمل</option>
                  </select>
                </div>

                {/* Spouse Editor */}
                {newMemMaritalStatus === 'متزوج' && (
                  <div className="pt-1">
                    <SpouseEditor
                      gender={newMemGender}
                      memberName={newMemName}
                      currentMemberId={undefined}
                      spouses={newMemSpouses}
                      onChange={setNewMemSpouses}
                      allMembers={members}
                    />
                  </div>
                )}
              </div>

              {/* Gender Toggle */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">الجنس (ذكر / أنثى)</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewMemGender('male')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      newMemGender === 'male' ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Mars size={12} />
                    ذكر
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMemGender('female')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      newMemGender === 'female' ? 'bg-rose-600 text-white shadow' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Venus size={12} />
                    أنثى
                  </button>
                </div>
              </div>

              {/* Alive/Deceased Toggle */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">هذا الفرد على قيد الحياة؟</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewMemIsAlive(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      newMemIsAlive ? 'bg-emerald-600 text-white shadow' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    نعم (حي)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMemIsAlive(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      !newMemIsAlive ? 'bg-rose-600 text-white shadow' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    لا (متوفى)
                  </button>
                </div>
              </div>

              {/* Death Date if Deceased */}
              {!newMemIsAlive && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">تاريخ الوفاة</label>
                  <input
                    type="date"
                    value={newMemDeathDate}
                    onChange={e => {
                      const val = e.target.value;
                      setNewMemDeathDate(val);
                      if (val) {
                        setNewMemDeathYear(String(new Date(val).getFullYear()));
                      } else {
                        setNewMemDeathYear('');
                      }
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                  />
                </div>
              )}

              {/* Country & Specialization */}
              <div className="grid grid-cols-2 gap-4">
                {newMemIsAlive && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">بلد الإقامة</label>
                    <select
                      value={newMemCountry || ''}
                      onChange={e => setNewMemCountry(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                    >
                      <option value="">بلد الإقامة...</option>
                      {ARAB_COUNTRIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={newMemIsAlive ? "" : "col-span-2"}>
                  <label className="block text-xs font-bold text-slate-600 mb-1">التخصص المهني/العلمي</label>
                  <select
                    value={newMemSpecialization || ''}
                    onChange={e => setNewMemSpecialization(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                  >
                    <option value="">التخصص المهني...</option>
                    {SPECIALIZATIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bio & Avatar */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">صورة شخصية من جهازك</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setNewMemAvatar(e.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setNewMemAvatar('');
                    }
                  }}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">نبذة شخصية</label>
                <textarea
                  rows={3}
                  placeholder="اكتب هنا أهم الإنجازات أو السيرة العلمية..."
                  value={newMemBio}
                  onChange={e => setNewMemBio(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-start gap-2 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow animate-none"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {isEditingFemaleFamilyText && editingFemaleMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] dir-rtl text-right">
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm md:text-base font-extrabold text-slate-800 flex items-center gap-2">
                <UserPlus size={18} className="text-emerald-600" />
                تعديل بيانات عائلة العضوة: {editingFemaleMember.name}
              </h3>
              <button
                onClick={() => setIsEditingFemaleFamilyText(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveFemaleFamilyText} className="p-6 space-y-4 text-xs md:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">اسم الزوج</label>
                <input
                  type="text"
                  placeholder="اسم الزوج"
                  value={femaleSpouseName}
                  onChange={e => setFemaleSpouseName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                />
              </div>

              <div>
                <ChildrenListEditor
                  childrenList={femaleChildrenList}
                  onChange={setFemaleChildrenList}
                  title="الأبناء"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-start gap-2 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow animate-none"
                >
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingFemaleFamilyText(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {memberToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 dir-rtl text-right">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">تأكيد الحذف</h3>
            <p className="text-sm text-slate-600">هل أنت متأكد من حذف هذا الفرد من شجرة العائلة؟ (لا يمكن التراجع)</p>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setMemberToDelete(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors">إلغاء</button>
              <button onClick={() => { if(onDeleteMember) { onDeleteMember(memberToDelete); } setSelectedMember(null); setMemberToDelete(null); }} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-colors">نعم، احذف</button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Avatar Lightbox */}
      <AnimatePresence>
        {activeFullscreenMember && activeFullscreenMember.avatar && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={() => setActiveFullscreenMember(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-lg w-full flex flex-col items-center gap-4" 
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveFullscreenMember(null)}
                className="absolute -top-12 left-1/2 -translate-x-1/2 md:-top-4 md:-left-12 text-white hover:text-slate-200 transition-colors bg-white/10 hover:bg-white/20 p-2.5 rounded-full shadow-lg border border-white/15 cursor-pointer"
                title="إغلاق"
              >
                <X size={20} />
              </button>
              
              {(() => {
                const isFemale = isMemberFemale(activeFullscreenMember);
                return (
                  <div className={`w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full overflow-hidden border-4 relative bg-white shadow-2xl flex items-center justify-center ${
                    isFemale ? 'border-[#bb5791]' : 'border-[#607fc4]'
                  }`}>
                    <AvatarImage 
                      src={activeFullscreenMember.avatar} 
                      alt={activeFullscreenMember.name} 
                      avatarX={activeFullscreenMember.avatarX}
                      avatarY={activeFullscreenMember.avatarY}
                      avatarScale={activeFullscreenMember.avatarScale}
                    />
                  </div>
                );
              })()}
              
              <div className="bg-slate-900/60 backdrop-blur-xs px-4 py-2 rounded-2xl border border-white/10 shadow-lg text-center">
                <p className="text-white text-xs md:text-sm font-bold dir-rtl">
                  الصورة الشخصية لـ <strong className="text-indigo-300 font-extrabold">{getFullName(activeFullscreenMember)}</strong>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

