import re

with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

# Add constants at the top after imports
constants = """
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 150 }, (_, i) => CURRENT_YEAR - i);

const ARAB_COUNTRIES = [
  "السعودية", "الإمارات", "الكويت", "البحرين", "قطر", "عمان",
  "مصر", "الأردن", "سوريا", "لبنان", "فلسطين", "العراق", "اليمن",
  "المغرب", "الجزائر", "تونس", "ليبيا", "السودان", "موريتانيا", "الصومال", "جيبوتي", "جزر القمر", "غير محدد"
];
"""
text = re.sub(r'(import .*?\n\n)', r'\1' + constants + '\n', text, count=1)

# Patch editForm.birthYear
bad_edit_birth = """                            <input type="number" value={editForm.birthYear === 0 ? '' : editForm.birthYear} onChange={e => setEditForm({...editForm, birthYear: e.target.value === '' ? 0 : Number(e.target.value)})} placeholder="سنة الميلاد" className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white" />"""
good_edit_birth = """                            <select value={editForm.birthYear === 0 ? '' : editForm.birthYear} onChange={e => setEditForm({...editForm, birthYear: e.target.value === '' ? 0 : Number(e.target.value)})} className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white cursor-pointer">
                              <option value="" disabled>سنة الميلاد</option>
                              {YEARS.map(y => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                            </select>"""
text = text.replace(bad_edit_birth, good_edit_birth)

# Patch editForm.country
bad_edit_country = """                            <input type="text" value={editForm.country} onChange={e => setEditForm({...editForm, country: e.target.value})} placeholder="بلد الإقامة" className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white" />"""
good_edit_country = """                            <select value={editForm.country || 'غير محدد'} onChange={e => setEditForm({...editForm, country: e.target.value})} className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white cursor-pointer">
                              {ARAB_COUNTRIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>"""
text = text.replace(bad_edit_country, good_edit_country)

# Patch newMemBirthYear
bad_new_birth = """                  <input
                    type="number"
                    value={newMemBirthYear}
                    onChange={e => setNewMemBirthYear(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="سنة الميلاد"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />"""
good_new_birth = """                  <select
                    value={newMemBirthYear}
                    onChange={e => setNewMemBirthYear(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                  >
                    <option value="" disabled>سنة الميلاد</option>
                    {YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>"""
text = text.replace(bad_new_birth, good_new_birth)

# Patch newMemCountry - oops, I didn't see where it is in FamilyTreeVisualizer. Let's find it.
with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(text)
