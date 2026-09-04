cat << 'INNEREOF' > temp_mychildren_edit.tsx
                  <div className="flex flex-col items-end gap-1 relative z-10" onPointerDown={(e) => e.stopPropagation()}>
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold pointer-events-none">
                      {child.specialization}
                    </span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedRelativeForEdit(child); }} className="text-[10px] bg-white hover:bg-slate-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100 transition-colors font-bold pointer-events-auto">
                      تعديل
                    </button>
                  </div>
                </Reorder.Item>
INNEREOF

sed -i '626,629d' src/components/MemberProfileEdit.tsx
sed -i '625r temp_mychildren_edit.tsx' src/components/MemberProfileEdit.tsx
