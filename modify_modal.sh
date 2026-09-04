sed -i 's/<div className="lg:col-span-4 space-y-4">/<div className="fixed inset-0 bg-slate-900\/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">\n          <AnimatePresence mode="wait">/g' temp_modal.tsx
sed -i 's/initial={{ opacity: 0, x: 20 }}/initial={{ opacity: 0, scale: 0.95 }}/g' temp_modal.tsx
sed -i 's/animate={{ opacity: 1, x: 0 }}/animate={{ opacity: 1, scale: 1 }}/g' temp_modal.tsx
sed -i 's/exit={{ opacity: 0, x: 20 }}/exit={{ opacity: 0, scale: 0.95 }}/g' temp_modal.tsx
sed -i 's/className="bg-white border-2 border-slate-100 shadow-xl rounded-3xl p-6 space-y-6 sticky top-\[80px\]"/className="bg-white border-2 border-slate-100 shadow-2xl rounded-3xl p-6 space-y-6 w-full max-w-lg max-h-\[90vh\] overflow-y-auto relative"/g' temp_modal.tsx

# Add close button
sed -i '/{!isEditingSelected ? (/i\                <button onClick={() => setSelectedMember(null)} className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors z-10"><X size={16} /><\/button>' temp_modal.tsx

# Replace closing tags
# 826                 )}
# 827               </motion.div>
# 828             </AnimatePresence>
# 829           </div>
# 830         )}

