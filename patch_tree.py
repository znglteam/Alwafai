with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

if "const [memberToDelete, setMemberToDelete] = useState<string | null>(null);" not in text:
    text = text.replace("const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);", "const [memberToDelete, setMemberToDelete] = useState<string | null>(null);\n  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);")

bad_btn = """                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف ${selectedMember.name} بن ${selectedMember.fatherName} من شجرة العائلة؟`)) {
                            onDeleteMember(selectedMember.id);
                            setSelectedMember(null);
                          }
                        }}
                        className="px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all flex items-center justify-center"
                        title="حذف الفرد"
                      >
                        <Trash2 size={16} />
                      </button>"""

good_btn = """                      <button
                        onClick={() => setMemberToDelete(selectedMember.id)}
                        className="px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all flex items-center justify-center"
                        title="حذف الفرد"
                      >
                        <Trash2 size={16} />
                      </button>"""

text = text.replace(bad_btn, good_btn)

modal = """
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
    </div>
  );
}
"""

text = text.replace("    </div>\n  );\n}", modal)

with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(text)
