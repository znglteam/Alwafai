cat << 'INNEREOF' > temp_relatives.tsx

          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200/60 pb-3">
              الأصول والإخوة
            </h3>
            
            <div className="space-y-3">
              {[father, grandfather, greatGrandfather].map((relative, i) => {
                if (!relative) return null;
                const labels = ["الأب", "الجد", "أبو الجد"];
                return (
                  <div key={relative.id} className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between gap-3 relative">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center font-bold text-[11px] overflow-hidden shrink-0">
                        <User size={14} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{relative.name}</h4>
                        <p className="text-[9px] text-slate-400">{labels[i]}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setSelectedRelativeForEdit(relative)} className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg transition-colors font-bold">
                      تعديل
                    </button>
                  </div>
                );
              })}

              {siblings.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-500">الإخوة والأخوات ({siblings.length})</h4>
                  {siblings.map(sibling => (
                    <div key={sibling.id} className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between gap-3 relative">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center font-bold text-[11px] overflow-hidden shrink-0">
                          {sibling.gender === 'female' ? <Venus size={14} /> : <Mars size={14} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">{sibling.name}</h4>
                          <p className="text-[9px] text-slate-400">{sibling.gender === 'female' ? 'أخت' : 'أخ'}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setSelectedRelativeForEdit(sibling)} className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg transition-colors font-bold">
                        تعديل
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
INNEREOF

sed -i '/<\/Reorder.Group>/r temp_relatives.tsx' src/components/MemberProfileEdit.tsx
