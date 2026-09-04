with open("src/components/MemberProfileEdit.tsx", "r") as f:
    content = f.read()

bad1 = """              <input
                type="text"
                required
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />"""
good1 = """              <select
                required
                value={specialization || ""}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
              >
                <option value="" disabled>اختر التخصص</option>
                {SPECIALIZATIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>"""
content = content.replace(bad1, good1)

bad2 = """                    <input
                      type="text"
                      placeholder="التخصص/المرحلة"
                      value={childSpecialization}
                      onChange={(e) => setChildSpecialization(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />"""
good2 = """                    <select
                      value={childSpecialization || ""}
                      onChange={(e) => setChildSpecialization(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                    >
                      <option value="" disabled>اختر التخصص</option>
                      {SPECIALIZATIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>"""
content = content.replace(bad2, good2)

with open("src/components/MemberProfileEdit.tsx", "w") as f:
    f.write(content)
