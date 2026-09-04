import re

with open("src/components/MemberProfileEdit.tsx", "r") as f:
    text = f.read()

bad_ui = """            {/* Spouse Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                اسم الزوجة (إن وجد)
              </label>
              <input
                type="text"
                placeholder="اسم الزوجة"
                value={spouseName}
                onChange={(e) => setSpouseName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-amber-50/20 border-amber-100"
              />
            </div>"""

good_ui = """            {/* Marital Status */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                الحالة الاجتماعية
              </label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value as any)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
              >
                <option value="أعزب">أعزب</option>
                <option value="مرتبط">مرتبط</option>
                <option value="متزوج">متزوج</option>
                <option value="منفصل/ أرمل">منفصل/ أرمل</option>
              </select>
            </div>

            {/* Spouse Name */}
            {maritalStatus === 'متزوج' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  {gender === 'female' ? 'اسم الزوج' : 'اسم الزوجة'}
                </label>
                <input
                  type="text"
                  placeholder={gender === 'female' ? 'اسم الزوج' : 'اسم الزوجة'}
                  value={spouseName}
                  onChange={(e) => setSpouseName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-amber-50/20 border-amber-100"
                />
              </div>
            )}"""

if "اسم الزوجة (إن وجد)" in text:
    text = text.replace(bad_ui, good_ui)

with open("src/components/MemberProfileEdit.tsx", "w") as f:
    f.write(text)
