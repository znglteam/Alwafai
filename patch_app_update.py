with open("src/App.tsx", "r") as f:
    text = f.read()

bad_update = """  const handleUpdateMember = (updated: FamilyMember) => {
    // Check if the member was ALIVE, but now edited to DECEASED (Newly Deceased Condolence Announcement)
    const oldMember = members.find(m => m.id === updated.id);
    const wasAlive = oldMember ? oldMember.isAlive : true;
    
    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));"""

good_update = """  const handleUpdateMember = (updated: FamilyMember) => {
    // Check if the member was ALIVE, but now edited to DECEASED (Newly Deceased Condolence Announcement)
    const oldMember = members.find(m => m.id === updated.id);
    const wasAlive = oldMember ? oldMember.isAlive : true;
    
    setMembers(prev => {
      let next = prev.map(m => m.id === updated.id ? updated : m);
      
      // Auto-repair childrenIds based on fatherId for consistency
      const childrenMap: Record<string, string[]> = {};
      next.forEach(m => {
        if (m.fatherId) {
          if (!childrenMap[m.fatherId]) childrenMap[m.fatherId] = [];
          childrenMap[m.fatherId].push(m.id);
        }
      });
      next = next.map(m => {
        const correctChildren = childrenMap[m.id] || [];
        if (JSON.stringify(m.childrenIds || []) !== JSON.stringify(correctChildren)) {
          return { ...m, childrenIds: correctChildren };
        }
        return m;
      });
      return next;
    });"""

text = text.replace(bad_update, good_update)

with open("src/App.tsx", "w") as f:
    f.write(text)
