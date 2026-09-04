with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

bad_header = """              <h3 className="text-sm md:text-base font-extrabold text-slate-800 flex items-center gap-2">
                <UserPlus size={18} className="text-emerald-600" />
                إضافة فرد جديد يدوياً لشجرة العائلة
              </h3>"""

good_header = """              <h3 className="text-sm md:text-base font-extrabold text-slate-800 flex items-center gap-2">
                <UserPlus size={18} className="text-emerald-600" />
                {addingFatherTo ? `إضافة أب لـ ${addingFatherTo.name}` : (newMemFatherName ? `إضافة ابن لـ ${newMemFatherName}` : 'إضافة الجد الأكبر (رأس الشجرة)')}
              </h3>"""

text = text.replace(bad_header, good_header)

with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(text)
