with open("src/components/AdminPanel.tsx", "r") as f:
    text = f.read()

bad_block = """                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">ترتيب الظهور</label>
                    <input
                      type="number"
                      value={editForm.orderIndex ?? ''}
                      onChange={e => setEditForm({ ...editForm, orderIndex: e.target.value === '' ? undefined : Number(e.target.value) })}
                      placeholder="رقم (اختياري)"
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                      placeholder="بلد الإقامة"
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                    />
                  </div>"""

good_block = """                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">بلد الإقامة</label>
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={e => setEditForm({ ...editForm, country: e.target.value })}
                      placeholder="بلد الإقامة"
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                    />
                  </div>"""

text = text.replace(bad_block, good_block)

with open("src/components/AdminPanel.tsx", "w") as f:
    f.write(text)
