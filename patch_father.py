with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

func = """  const handleAddChildDirectly = (father: FamilyMember) => {
    setIsAddingMember(true);
    setAddingFatherTo(null);
    setNewMemFatherId(father.id);
    setNewMemFatherName(father.name);
    setNewMemGrandfatherName(father.fatherName);
    setNewMemCountry(father.country || 'الكويت');
  };"""

func_with_father = """  const handleAddChildDirectly = (father: FamilyMember) => {
    setIsAddingMember(true);
    setAddingFatherTo(null);
    setNewMemFatherId(father.id);
    setNewMemFatherName(father.name);
    setNewMemGrandfatherName(father.fatherName);
    setNewMemCountry(father.country || 'الكويت');
  };

  const handleAddFatherDirectly = (child: FamilyMember) => {
    setAddingFatherTo(child);
    setIsAddingMember(true);
    setNewMemFatherId('');
    setNewMemFatherName('');
    setNewMemGrandfatherName('');
    setNewMemCountry(child.country || 'الكويت');
  };"""

text = text.replace(func, func_with_father)

btns = """                 {isAdmin && (
                  <div className="flex gap-2 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => handleAddChildDirectly(selectedMember)}
                      className="flex-1 text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <UserPlus size={14} />
                      إضافة ابن لـ {selectedMember.name}
                    </button>"""

btns_with_father = """                 {isAdmin && (
                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddChildDirectly(selectedMember)}
                        className="flex-1 text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <UserPlus size={14} />
                        إضافة ابن
                      </button>
                      {!selectedMember.fatherId && (
                        <button
                          onClick={() => handleAddFatherDirectly(selectedMember)}
                          className="flex-1 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <UserPlus size={14} />
                          إضافة أب
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">"""

# wait, the existing code:
#                     <button
#                       onClick={() => handleAddChildDirectly(selectedMember)}
#                       className="flex-1 text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
#                     >
#                       <UserPlus size={14} />
#                       إضافة ابن لـ {selectedMember.name}
#                     </button>
#                     {onUpdateMember && (
#                       <button ...
# I will use a regex to replace this block.
