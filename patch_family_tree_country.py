with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

bad_new_country = """                  <input
                    type="text"
                    placeholder="بلد الإقامة الحالي"
                    value={newMemCountry}
                    onChange={e => setNewMemCountry(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />"""

good_new_country = """                  <select
                    value={newMemCountry || 'غير محدد'}
                    onChange={e => setNewMemCountry(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                  >
                    {ARAB_COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>"""

text = text.replace(bad_new_country, good_new_country)

with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(text)
