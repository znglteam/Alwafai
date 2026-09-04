with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

bad_btns = """                 {isAdmin && (
                  <div className="flex gap-2 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => handleAddChildDirectly(selectedMember)}
                      className="flex-1 text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <UserPlus size={14} />
                      إضافة ابن لـ {selectedMember.name}
                    </button>
                    {onUpdateMember && (
                      <button
                        onClick={() => {
                          setEditForm(selectedMember);
                          setIsEditingSelected(true);
                        }}
                        className="px-3 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 rounded-xl transition-all flex items-center justify-center"
                        title="تعديل بيانات الفرد"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    {onDeleteMember && (
                      <button
                        onClick={() => setMemberToDelete(selectedMember.id)}
                        className="px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all flex items-center justify-center"
                        title="حذف هذا الفرد"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}"""


good_btns = """                 {isAdmin && (
                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => handleAddChildDirectly(selectedMember)}
                        className="flex-1 text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <UserPlus size={14} />
                        إضافة ابن
                      </button>
                      {(!selectedMember.fatherId || !members.find(m => m.id === selectedMember.fatherId)) && (
                        <button
                          onClick={() => handleAddFatherDirectly(selectedMember)}
                          className="flex-1 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <UserPlus size={14} />
                          إضافة أب
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 w-full">
                      {onUpdateMember && (
                        <button
                          onClick={() => {
                            setEditForm(selectedMember);
                            setIsEditingSelected(true);
                          }}
                          className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 rounded-xl transition-all flex items-center justify-center gap-2 py-2"
                          title="تعديل بيانات الفرد"
                        >
                          <Edit2 size={14} />
                          تعديل
                        </button>
                      )}
                      {onDeleteMember && (
                        <button
                          onClick={() => setMemberToDelete(selectedMember.id)}
                          className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all flex items-center justify-center gap-2 py-2"
                          title="حذف هذا الفرد"
                        >
                          <Trash2 size={14} />
                          حذف
                        </button>
                      )}
                    </div>
                  </div>
                )}"""

if bad_btns in text:
    print("Found exact block, replacing...")
    text = text.replace(bad_btns, good_btns)
else:
    print("Block not found!")

with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(text)

