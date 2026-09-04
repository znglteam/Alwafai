import re

with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

bad_btns = r"""                 \{isAdmin && \(\s*<div className="flex gap-2 border-t border-slate-100 pt-4">\s*<button\s*onClick=\{\(\) => handleAddChildDirectly\(selectedMember\)\}\s*className="flex-1 text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"\s*>\s*<UserPlus size=\{14\} />\s*إضافة ابن لـ \{selectedMember\.name\}\s*</button>\s*\{onUpdateMember && \(\s*<button"""

good_btns = """                 {isAdmin && (
                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddChildDirectly(selectedMember)}
                        className="flex-1 text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <UserPlus size={14} />
                        إضافة ابن
                      </button>
                      {(!selectedMember.fatherId || !members.find(m => m.id === selectedMember.fatherId)) && (
                        <button
                          onClick={() => handleAddFatherDirectly(selectedMember)}
                          className="flex-1 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <UserPlus size={14} />
                          إضافة أب
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 w-full">
                      {onUpdateMember && (
                        <button"""

text = re.sub(bad_btns, good_btns, text)

# I need to close the extra div I added in good_btns (the `<div className="flex gap-2 w-full">` and the outer `<div className="flex flex-col...`
# Wait, let's just make it simpler.

