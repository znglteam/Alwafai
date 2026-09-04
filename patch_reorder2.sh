sed -i '/onUpdateMember(swapChild);/a\
  };\n\
  const handleReorderMyChildren = (newOrder: FamilyMember[]) => {\n\
    newOrder.forEach((child, index) => {\n\
      if (child.orderIndex !== index) {\n\
        onUpdateMember({ ...child, orderIndex: index });\n\
      }\n\
    });\n\
' src/components/MemberProfileEdit.tsx
