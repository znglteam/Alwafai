import re

with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

# Replace New Member Form spouse
bad_new_spouse = """                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الزوجة / شريك الحياة</label>
                  <input
                    type="text"
                    placeholder="اسم الزوجة"
                    value={newMemSpouseName}
                    onChange={e => setNewMemSpouseName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>"""

good_new_spouse = """                {/* Marital Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الحالة الاجتماعية</label>
                  <select
                    value={newMemMaritalStatus}
                    onChange={e => setNewMemMaritalStatus(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                  >
                    <option value="أعزب">أعزب</option>
                    <option value="مرتبط">مرتبط</option>
                    <option value="متزوج">متزوج</option>
                    <option value="منفصل/ أرمل">منفصل/ أرمل</option>
                  </select>
                </div>

                {/* Spouse */}
                {newMemMaritalStatus === 'متزوج' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      {newMemGender === 'female' ? 'اسم الزوج' : 'اسم الزوجة'}
                    </label>
                    <input
                      type="text"
                      placeholder={newMemGender === 'female' ? 'اسم الزوج' : 'اسم الزوجة'}
                      value={newMemSpouseName}
                      onChange={e => setNewMemSpouseName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                )}"""
text = text.replace(bad_new_spouse, good_new_spouse)

# Replace Node Card (editForm)
bad_edit_spouse = """                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">شريك الحياة / الزوجة</label>
                          <input type="text" value={editForm.spouseName || ''} onChange={e => setEditForm({...editForm, spouseName: e.target.value || null})} placeholder="شريك الحياة" className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white" />
                        </div>"""

good_edit_spouse = """                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الحالة الاجتماعية</label>
                            <select value={editForm.maritalStatus || 'أعزب'} onChange={e => setEditForm({...editForm, maritalStatus: e.target.value as any, spouseName: e.target.value === 'متزوج' ? editForm.spouseName : null})} className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white cursor-pointer">
                              <option value="أعزب">أعزب</option>
                              <option value="مرتبط">مرتبط</option>
                              <option value="متزوج">متزوج</option>
                              <option value="منفصل/ أرمل">منفصل/ أرمل</option>
                            </select>
                          </div>
                          {editForm.maritalStatus === 'متزوج' && (
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                {editForm.gender === 'female' ? 'اسم الزوج' : 'اسم الزوجة'}
                              </label>
                              <input type="text" value={editForm.spouseName || ''} onChange={e => setEditForm({...editForm, spouseName: e.target.value || null})} placeholder={editForm.gender === 'female' ? 'اسم الزوج' : 'اسم الزوجة'} className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white" />
                            </div>
                          )}
                        </div>"""
text = text.replace(bad_edit_spouse, good_edit_spouse)

with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(text)
