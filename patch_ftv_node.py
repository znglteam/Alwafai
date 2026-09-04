import re

with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

bad_label = """                        <span className="block text-[10px] text-amber-500 font-bold">الزوجة / شريك الحياة</span>"""
good_label = """                        <span className="block text-[10px] text-amber-500 font-bold">
                          {selectedMember.gender === 'female' ? 'الزوج' : 'الزوجة'}
                        </span>"""

text = text.replace(bad_label, good_label)

with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(text)
