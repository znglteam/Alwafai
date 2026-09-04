sed -i '458,501d' src/components/MemberProfileEdit.tsx

cat << 'INNEREOF' > temp_insert.tsx
            <Reorder.Group axis="y" values={myChildren} onReorder={handleReorderMyChildren} className="space-y-3">
              {myChildren.map((child) => (
                <Reorder.Item key={child.id} value={child} className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between gap-3 relative cursor-grab active:cursor-grabbing">
                  <div className="flex items-center gap-2 pointer-events-none">
                    <div className="flex flex-col gap-1 items-center justify-center pl-1 text-slate-300">
                      <GripVertical size={16} />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px] overflow-hidden">
                      {child.avatar ? (
                        <img src={child.avatar} alt={child.name} referrerPolicy="no-referrer" className="object-cover w-full h-full" />
                      ) : (
                        child.name.slice(0, 2)
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        {child.name}
                        {child.gender === 'female' ? (
                          <Venus size={12} className={child.isAlive ? 'text-[#bb5791]' : 'text-slate-400'} />
                        ) : (
                          <Mars size={12} className={child.isAlive ? 'text-[#607fc4]' : 'text-slate-400'} />
                        )}
                      </h4>
                      <p className="text-[9px] text-slate-400">سنة الميلاد: {child.birthYear}م | الإقامة: {child.country}</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold pointer-events-none">
                    {child.specialization}
                  </span>
                </Reorder.Item>
              ))}

              {myChildren.length === 0 && !showAddChild && (
                <div className="py-8 text-center text-slate-400 text-xs leading-relaxed">
                  لا يوجد أولاد مسجلين تحت اسمك في الشجرة حتى الآن. اضغط على زر "إضافة ولد" لربط أولادك بالشجرة.
                </div>
              )}
            </Reorder.Group>
INNEREOF

sed -i '457r temp_insert.tsx' src/components/MemberProfileEdit.tsx
