#!/bin/bash
sed -i '755,765d' src/App.tsx
sed -i '754a\
    return m;\
  });\
\
  const reconciled = reconcileLineage(updated);\
  setMembers(reconciled);\
\
  const changed = getChangedMembers(members, reconciled);\
  if (changed.length > 0) {\
    await saveMultipleMembersToCloud(changed);\
  }\
\
  if (currentSession.role === "member") {\
    await logFamilyAction(currentSession.name, "إضافة ابن/ابنة جديدة", `إضافة ${childInfo.name}`, childInfo.name);\
  }\
};' src/App.tsx
