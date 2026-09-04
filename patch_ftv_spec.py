with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    content = f.read()

bad1 = """<input type="text" value={editForm.specialization} onChange={e => setEditForm({...editForm, specialization: e.target.value})} placeholder="التخصص العلمي" className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white" />"""
good1 = """<select value={editForm.specialization || ''} onChange={e => setEditForm({...editForm, specialization: e.target.value})} className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white cursor-pointer">
                              <option value="" disabled>اختر التخصص</option>
                              {SPECIALIZATIONS.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>"""
content = content.replace(bad1, good1)

bad2 = """<input
                    type="text"
                    placeholder="التخصص العلمي أو المهنة"
                    value={newMemSpecialization}
                    onChange={e => setNewMemSpecialization(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />"""
good2 = """<select
                    value={newMemSpecialization || ''}
                    onChange={e => setNewMemSpecialization(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                  >
                    <option value="" disabled>اختر التخصص</option>
                    {SPECIALIZATIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>"""
content = content.replace(bad2, good2)

with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(content)
