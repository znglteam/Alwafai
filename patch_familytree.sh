cat << 'INNEREOF' > temp_birth_death.tsx
                  {/* Birth Year */}
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <User className="text-indigo-600 shrink-0" size={16} />
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-slate-400 font-bold">سنة الميلاد</span>
                      <span className="font-semibold text-slate-700">
                        {selectedMember.birthYear ? \`\${selectedMember.birthYear}م\` : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Death Year (if applicable) */}
                  {!selectedMember.isAlive && (
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <User className="text-slate-500 shrink-0" size={16} />
                      <div className="space-y-0.5">
                        <span className="block text-[10px] text-slate-400 font-bold">سنة الوفاة</span>
                        <span className="font-semibold text-slate-700">
                          {selectedMember.deathYear ? \`\${selectedMember.deathYear}م\` : '-'}
                        </span>
                      </div>
                    </div>
                  )}
INNEREOF
sed -i '598,609d' src/components/FamilyTreeVisualizer.tsx
sed -i '597r temp_birth_death.tsx' src/components/FamilyTreeVisualizer.tsx
