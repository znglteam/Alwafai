import re

with open("src/components/AdminPanel.tsx", "r") as f:
    text = f.read()

# Add maritalStatus state
state_replace = """  const [newMemSpecialization, setNewMemSpecialization] = useState('');
  const [newMemIsAlive, setNewMemIsAlive] = useState(true);
  const [newMemDeathYear, setNewMemDeathYear] = useState('');
  const [newMemBio, setNewMemBio] = useState('');
  const [newMemSpouse, setNewMemSpouse] = useState('');
  const [newMemMaritalStatus, setNewMemMaritalStatus] = useState<"أعزب" | "مرتبط" | "متزوج" | "منفصل/ أرمل">("أعزب");
  const [newMemAvatar, setNewMemAvatar] = useState('');"""
text = text.replace("  const [newMemSpecialization, setNewMemSpecialization] = useState('');\n  const [newMemIsAlive, setNewMemIsAlive] = useState(true);\n  const [newMemDeathYear, setNewMemDeathYear] = useState('');\n  const [newMemBio, setNewMemBio] = useState('');\n  const [newMemSpouse, setNewMemSpouse] = useState('');\n  const [newMemAvatar, setNewMemAvatar] = useState('');", state_replace)

reset_replace = """      setNewMemSpouse('');
      setNewMemMaritalStatus('أعزب');
      setNewMemAvatar('');"""
text = text.replace("      setNewMemSpouse('');\n      setNewMemAvatar('');", reset_replace)

submit_replace = """      bio: newMemBio,
      maritalStatus: newMemMaritalStatus,
      spouseName: newMemMaritalStatus === "متزوج" ? (newMemSpouse || null) : null,
      avatar: newMemAvatar || undefined,"""
text = text.replace("      bio: newMemBio,\n      spouseName: newMemSpouse || null,\n      avatar: newMemAvatar || undefined,", submit_replace)


# Replace new member UI
bad_new_ui = """                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">شريك الحياة / الزوجة</label>
                    <input
                      type="text" placeholder="أدخل اسم الزوجة إن وجد"
                      value={newMemSpouse} onChange={e => setNewMemSpouse(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                    />
                  </div>"""
good_new_ui = """                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">الحالة الاجتماعية</label>
                    <select
                      value={newMemMaritalStatus} onChange={e => setNewMemMaritalStatus(e.target.value as any)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white cursor-pointer"
                    >
                      <option value="أعزب">أعزب</option>
                      <option value="مرتبط">مرتبط</option>
                      <option value="متزوج">متزوج</option>
                      <option value="منفصل/ أرمل">منفصل/ أرمل</option>
                    </select>
                  </div>
                  {newMemMaritalStatus === 'متزوج' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        {newMemGender === 'female' ? 'اسم الزوج' : 'اسم الزوجة'}
                      </label>
                      <input
                        type="text" placeholder={newMemGender === 'female' ? 'اسم الزوج' : 'اسم الزوجة'}
                        value={newMemSpouse} onChange={e => setNewMemSpouse(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                      />
                    </div>
                  )}"""
text = text.replace(bad_new_ui, good_new_ui)


# Replace edit UI
bad_edit_ui = """                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">شريك الحياة / الزوجة</label>
                    <input
                      type="text"
                      value={editForm.spouseName || ''}
                      onChange={e => setEditForm({ ...editForm, spouseName: e.target.value || null })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                    />
                  </div>"""

good_edit_ui = """                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">الحالة الاجتماعية</label>
                    <select
                      value={editForm.maritalStatus || 'أعزب'}
                      onChange={e => setEditForm({ ...editForm, maritalStatus: e.target.value as any, spouseName: e.target.value === 'متزوج' ? editForm.spouseName : null })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white cursor-pointer"
                    >
                      <option value="أعزب">أعزب</option>
                      <option value="مرتبط">مرتبط</option>
                      <option value="متزوج">متزوج</option>
                      <option value="منفصل/ أرمل">منفصل/ أرمل</option>
                    </select>
                  </div>
                  {editForm.maritalStatus === 'متزوج' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        {editForm.gender === 'female' ? 'اسم الزوج' : 'اسم الزوجة'}
                      </label>
                      <input
                        type="text"
                        value={editForm.spouseName || ''}
                        onChange={e => setEditForm({ ...editForm, spouseName: e.target.value || null })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                      />
                    </div>
                  )}"""
text = text.replace(bad_edit_ui, good_edit_ui)

with open("src/components/AdminPanel.tsx", "w") as f:
    f.write(text)
