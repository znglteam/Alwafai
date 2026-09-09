const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const targetStr = `                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                            <Link size={15} className="text-indigo-600" />
                            طريقة ربط واعتماد الحساب بالشجرة:
                          </label>
                          
                          {/* Mode Selection Pills */}
                          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => setRequestApprovalModes({ ...requestApprovalModes, [req.id]: 'existing' })}
                              className={\`text-xs px-3 py-1 rounded-lg font-bold transition-all \${
                                currentMode === 'existing'
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }\`}
                            >
                              🔗 ربط مع فرد مسجل مسبقاً (بدون تكرار)
                            </button>
                            <button
                              type="button"
                              onClick={() => setRequestApprovalModes({ ...requestApprovalModes, [req.id]: 'new' })}
                              className={\`text-xs px-3 py-1 rounded-lg font-bold transition-all \${
                                currentMode === 'new'
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }\`}
                            >
                              ➕ إضافة كفرد جديد بالشجرة
                            </button>
                          </div>
                        </div>`;

const newStr = `                        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4">
                          <label className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                            <Link size={16} className="text-indigo-600" />
                            كيف تريد اعتماد هذا الطلب وربطه بالشجرة؟
                          </label>
                          
                          {/* Mode Selection Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setRequestApprovalModes({ ...requestApprovalModes, [req.id]: 'existing' })}
                              className={\`flex flex-col text-right p-3 rounded-xl border-2 transition-all \${
                                currentMode === 'existing'
                                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                                  : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                              }\`}
                            >
                              <span className={\`text-sm font-bold flex items-center gap-1.5 \${currentMode === 'existing' ? 'text-indigo-700' : 'text-slate-700'}\`}>
                                🔗 ربطه بشخص موجود مسبقاً
                              </span>
                              <span className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                                اختر هذا إذا كان الاسم موجوداً بالفعل في الشجرة، حتى لا يتكرر.
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setRequestApprovalModes({ ...requestApprovalModes, [req.id]: 'new' })}
                              className={\`flex flex-col text-right p-3 rounded-xl border-2 transition-all \${
                                currentMode === 'new'
                                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                                  : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                              }\`}
                            >
                              <span className={\`text-sm font-bold flex items-center gap-1.5 \${currentMode === 'new' ? 'text-indigo-700' : 'text-slate-700'}\`}>
                                ➕ إضافته كشخص جديد
                              </span>
                              <span className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                                اختر هذا إذا لم يكن مضافاً، وسنطلب منك تحديد والده لإضافته تحته.
                              </span>
                            </button>
                          </div>
                        </div>`;

if(code.includes(targetStr)) {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync('src/components/AdminPanel.tsx', code);
    console.log("Replaced successfully");
} else {
    console.log("Could not find target block");
}
