with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

bad = """                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">سنة الميلاد</label>
                            <input type="number" value={editForm.birthYear === 0 ? '' : editForm.birthYear} onChange={e => setEditForm({...editForm, birthYear: e.target.value === '' ? 0 : Number(e.target.value)})} placeholder="سنة الميلاد" className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">سنة الوفاة (إن وجد)</label>
                            <input type="number" value={editForm.deathYear || ''} onChange={e => setEditForm({...editForm, deathYear: e.target.value === '' ? null : Number(e.target.value)})} placeholder="سنة الوفاة" className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white" disabled={editForm.isAlive} />
                          </div>
                        </div>"""

good = """                        <div className="grid grid-cols-2 gap-3">
                          <div className={editForm.isAlive ? "col-span-2" : ""}>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">سنة الميلاد</label>
                            <input type="number" value={editForm.birthYear === 0 ? '' : editForm.birthYear} onChange={e => setEditForm({...editForm, birthYear: e.target.value === '' ? 0 : Number(e.target.value)})} placeholder="سنة الميلاد" className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white" />
                          </div>
                          {!editForm.isAlive && (
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">سنة الوفاة</label>
                              <input type="number" value={editForm.deathYear || ''} onChange={e => setEditForm({...editForm, deathYear: e.target.value === '' ? null : Number(e.target.value)})} placeholder="سنة الوفاة" className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white" />
                            </div>
                          )}
                        </div>"""

text = text.replace(bad, good)

with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(text)
