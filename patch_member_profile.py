import re

with open("src/components/MemberProfileEdit.tsx", "r") as f:
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

# Patch birth year in main edit form
bad_birth_year = """              <input
                type="number"
                required
                value={birthYear}
                onChange={(e) => setBirthYear(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />"""

good_birth_year = """              <select
                required
                value={birthYear || ""}
                onChange={(e) => setBirthYear(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
              >
                <option value="" disabled>اختر سنة الميلاد</option>
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>"""
text = text.replace(bad_birth_year, good_birth_year)

# Patch country in main edit form
bad_country = """              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />"""
good_country = """              <select
                required
                value={country || "غير محدد"}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
              >
                {ARAB_COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>"""
text = text.replace(bad_country, good_country)

# Patch child birth year
bad_child_birth_year = """                    <input
                      type="number"
                      value={childBirthYear}
                      onChange={(e) =>
                        setChildBirthYear(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      placeholder="سنة الميلاد"
                      className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />"""

good_child_birth_year = """                    <select
                      value={childBirthYear}
                      onChange={(e) =>
                        setChildBirthYear(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                    >
                      <option value="" disabled>سنة الميلاد</option>
                      {YEARS.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>"""
text = text.replace(bad_child_birth_year, good_child_birth_year)

# We need to find the childCountry input. Let's look for it
with open("src/components/MemberProfileEdit.tsx", "w") as f:
    f.write(text)
