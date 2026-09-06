import { FamilyMember, RegistrationRequest } from '../types';

/**
 * Normalizes Arabic text for flexible matching (removes diacritics, unifies alef, taa marbuta, etc.)
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // Remove tashkeel / tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[ؤئ]/g, 'ء')
    .replace(/\s+/g, ' ');
}

/**
 * Resolves a member's father and grandfather names from the tree structure if missing in fields
 */
export function getResolvedMemberLineage(
  member: FamilyMember,
  allMembers: FamilyMember[]
): { fatherName: string; grandfatherName: string; fatherNode: FamilyMember | null } {
  const fatherNode = member.fatherId ? allMembers.find(f => f.id === member.fatherId) || null : null;
  const grandfatherNode = fatherNode?.fatherId ? allMembers.find(g => g.id === fatherNode.fatherId) || null : null;

  const fatherName = (fatherNode?.name || member.fatherName || '').trim();
  const grandfatherName = (grandfatherNode?.name || fatherNode?.fatherName || member.grandfatherName || '').trim();

  return { fatherName, grandfatherName, fatherNode };
}

/**
 * Calculates a match score between a registration request and a tree member.
 * The focus is strictly on matching the applicant's OWN name first, then validating father/lineage.
 */
export function calculateMatchScore(
  req: RegistrationRequest,
  member: FamilyMember,
  allMembers: FamilyMember[]
): number {
  if (!req || !member) return 0;

  // 1. Direct ID / Registered User Match
  if (member.registeredUserId && member.registeredUserId === req.id) {
    return 100;
  }

  // 2. Email Match
  if (
    member.email &&
    req.email &&
    member.email.trim().toLowerCase() === req.email.trim().toLowerCase()
  ) {
    return 95;
  }

  const reqNameNorm = normalizeArabic(req.name);
  const memNameNorm = normalizeArabic(member.name);

  // If first name doesn't match at all, score is 0 (we want to match the person by his own name!)
  if (!reqNameNorm || !memNameNorm || reqNameNorm !== memNameNorm) {
    return 0;
  }

  const { fatherName: resFather, grandfatherName: resGrand } = getResolvedMemberLineage(member, allMembers);
  const reqFatherNorm = normalizeArabic(req.fatherName || '');
  const memFatherNorm = normalizeArabic(member.fatherName || resFather);
  const reqGrandNorm = normalizeArabic(req.grandfatherName || '');
  const memGrandNorm = normalizeArabic(member.grandfatherName || resGrand);

  // Name + Father + Grandfather Match
  if (reqFatherNorm && memFatherNorm && reqFatherNorm === memFatherNorm) {
    if (reqGrandNorm && memGrandNorm && reqGrandNorm === memGrandNorm) {
      return 90; // Triple name exact match
    }
    return 80; // Name + Father exact match
  }

  // Exact Name match with no contradictory father
  if (!reqFatherNorm || !memFatherNorm) {
    return 70;
  }

  // Name matches, but father name is different
  return 40;
}

/**
 * Finds the best matching member in the tree for a registration request.
 * Matches by the applicant's own name.
 */
export function findMatchingMemberInTree(
  req: RegistrationRequest,
  allMembers: FamilyMember[]
): FamilyMember | null {
  if (!req || !req.name || !allMembers || allMembers.length === 0) return null;

  let bestScore = 0;
  let bestMember: FamilyMember | null = null;

  for (const m of allMembers) {
    const score = calculateMatchScore(req, m, allMembers);
    if (score > bestScore) {
      bestScore = score;
      bestMember = m;
    }
  }

  // Only consider it a match if score is at least 40 (meaning at least first name matched)
  return bestScore >= 40 ? bestMember : null;
}

/**
 * Returns tree members sorted and ranked for linking a given request.
 * Members with the same name appear at the top.
 */
export function getRankedCandidateMembers(
  req: RegistrationRequest,
  allMembers: FamilyMember[],
  searchQuery: string = ''
): { member: FamilyMember; score: number; resolvedFather: string; resolvedGrandfather: string }[] {
  const queryNorm = normalizeArabic(searchQuery);

  const list = allMembers.map(m => {
    const { fatherName, grandfatherName } = getResolvedMemberLineage(m, allMembers);
    const score = calculateMatchScore(req, m, allMembers);
    return {
      member: m,
      score,
      resolvedFather: fatherName,
      resolvedGrandfather: grandfatherName
    };
  });

  return list
    .filter(item => {
      if (!queryNorm) return true;
      const fullName = `${item.member.name} ${item.resolvedFather} ${item.resolvedGrandfather} ${item.member.email || ''}`;
      return normalizeArabic(fullName).includes(queryNorm);
    })
    .sort((a, b) => {
      // Best score first
      if (b.score !== a.score) return b.score - a.score;
      // Then alphabetical
      return a.member.name.localeCompare(b.member.name, 'ar');
    });
}
