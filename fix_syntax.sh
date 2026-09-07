#!/bin/bash
sed -i '768,769d' src/App.tsx
sed -i '771i\
  const handleAddMemberDirectly = (newMem: Omit<FamilyMember, "id" | "childrenIds">): string => {' src/App.tsx
