with open("src/components/AdminPanel.tsx", "r") as f:
    text = f.read()

# Add state for confirm deletion
if "const [memberToDelete, setMemberToDelete] = useState<string | null>(null);" not in text:
    text = text.replace("const [activeTab, setActiveTab] = useState", "const [memberToDelete, setMemberToDelete] = useState<string | null>(null);\n  const [activeTab, setActiveTab] = useState")

bad_btn = """                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد تماماً من رغبتك في حذف ${m.name} وأي تفرعات متصلة به؟ لا يمكن التراجع.`)) {
                            onDeleteMember(m.id);
                          }
                        }}
                        className="bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 font-semibold"
                      >
                        <Trash2 size={12} />
                        حذف
                      </button>"""

good_btn = """                      <button
                        onClick={() => setMemberToDelete(m.id)}
                        className="bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 font-semibold"
                      >
                        <Trash2 size={12} />
                        حذف
                      </button>"""

text = text.replace(bad_btn, good_btn)

modal = """
      {memberToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 dir-rtl text-right">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">تأكيد الحذف</h3>
            <p className="text-sm text-slate-600">هل أنت متأكد تماماً من رغبتك في حذف الفرد وأي تفرعات متصلة به؟ لا يمكن التراجع.</p>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setMemberToDelete(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors">إلغاء</button>
              <button onClick={() => { onDeleteMember(memberToDelete); setMemberToDelete(null); }} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-colors">نعم، احذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"""

text = text.replace("    </div>\n  );\n}", modal)

with open("src/components/AdminPanel.tsx", "w") as f:
    f.write(text)
