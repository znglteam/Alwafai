with open("src/App.tsx", "r") as f:
    text = f.read()

bad = """  const handleAddMemberDirectly = (newMem: Omit<FamilyMember, 'id' | 'childrenIds'>) => {
    const id = 'member-' + Date.now().toString();"""
good = """  const handleAddMemberDirectly = (newMem: Omit<FamilyMember, 'id' | 'childrenIds'>): string => {
    const id = 'member-' + Date.now().toString();"""

text = text.replace(bad, good)

bad_ret = """      // Link to father if supplied
      if (newMem.fatherId) {
        updated = updated.map(m => {
          if (m.id === newMem.fatherId) {
            return {
              ...m,
              childrenIds: [...(m.childrenIds || []), id]
            };
          }
          return m;
        });
      }
      return updated;
    });
  };"""

good_ret = """      // Link to father if supplied
      if (newMem.fatherId) {
        updated = updated.map(m => {
          if (m.id === newMem.fatherId) {
            return {
              ...m,
              childrenIds: [...(m.childrenIds || []), id]
            };
          }
          return m;
        });
      }
      return updated;
    });
    return id;
  };"""
text = text.replace(bad_ret, good_ret)

with open("src/App.tsx", "w") as f:
    f.write(text)
