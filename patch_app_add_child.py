import re

with open("src/App.tsx", "r") as f:
    text = f.read()

bad_add_child = """  const handleAddChild = (fatherId: string, childInfo: Omit<FamilyMember, 'id' | 'fatherId' | 'childrenIds'>) => {
    const childId = 'member-' + Date.now().toString();
    const newChild: FamilyMember = {
      ...childInfo,
      id: childId,
      fatherId: fatherId,
      childrenIds: []
    };

    setMembers(prev => {
      let updated = [...prev, newChild];
      // Append child ID to father's node
      updated = updated.map(m => {
        if (m.id === fatherId) {
          return {
            ...m,
            childrenIds: [...(m.childrenIds || []), childId]
          };
        }
        return m;
      });
      return updated;
    });
  };"""

good_add_child = """  const handleAddChild = (parentId: string, childInfo: Omit<FamilyMember, 'id' | 'fatherId' | 'childrenIds' | 'motherId'>) => {
    const childId = 'member-' + Date.now().toString();
    
    setMembers(prev => {
      const parent = prev.find(m => m.id === parentId);
      const isMother = parent?.gender === 'female';
      
      const newChild: FamilyMember = {
        ...childInfo,
        id: childId,
        fatherId: isMother ? null : parentId,
        motherId: isMother ? parentId : null,
        childrenIds: []
      };

      let updated = [...prev, newChild];
      // Append child ID to parent's node
      updated = updated.map(m => {
        if (m.id === parentId) {
          return {
            ...m,
            childrenIds: [...(m.childrenIds || []), childId]
          };
        }
        return m;
      });
      return updated;
    });
  };"""

text = text.replace(bad_add_child, good_add_child)

with open("src/App.tsx", "w") as f:
    f.write(text)
