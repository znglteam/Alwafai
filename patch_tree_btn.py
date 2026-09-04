with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

import re

bad_btn = r"""                      <button\s+onClick=\{\(\) => \{\s+if \(confirm\(`هل أنت متأكد من حذف \$\{selectedMember.name\} بن \$\{selectedMember.fatherName\} من شجرة العائلة\?`\)\) \{\s+onDeleteMember\(selectedMember.id\);\s+setSelectedMember\(null\);\s+\}\s+\}\}\s+className="px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all flex items-center justify-center"\s+title="حذف هذا الفرد"\s+>\s+<Trash2 size=\{14\} />\s+</button>"""

good_btn = """                      <button
                        onClick={() => setMemberToDelete(selectedMember.id)}
                        className="px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all flex items-center justify-center"
                        title="حذف هذا الفرد"
                      >
                        <Trash2 size={14} />
                      </button>"""

text = re.sub(bad_btn, good_btn, text)

with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(text)
