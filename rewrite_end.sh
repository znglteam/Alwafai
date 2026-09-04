sed -i '480,$d' src/components/MemberProfileEdit.tsx
cat << 'INNEREOF' >> src/components/MemberProfileEdit.tsx
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
          </div>
        </div>
      </div>
    </div>
  );
}
INNEREOF
