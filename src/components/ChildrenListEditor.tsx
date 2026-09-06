import { Plus, Trash2, User } from 'lucide-react';

interface ChildrenListEditorProps {
  childrenList: string[];
  onChange: (newList: string[]) => void;
  title?: string;
  compact?: boolean;
}

export default function ChildrenListEditor({
  childrenList,
  onChange,
  title = 'الأبناء',
  compact = false
}: ChildrenListEditorProps) {
  const handleAddChild = () => {
    onChange([...childrenList, '']);
  };

  const handleUpdateChild = (index: number, val: string) => {
    const updated = [...childrenList];
    updated[index] = val;
    onChange(updated);
  };

  const handleRemoveChild = (index: number) => {
    const updated = childrenList.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-2 text-right dir-rtl">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <label className={`block font-bold text-slate-700 ${compact ? 'text-xs' : 'text-xs md:text-sm'}`}>
          {title}
        </label>
        <button
          type="button"
          onClick={handleAddChild}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all border border-indigo-100 cursor-pointer shadow-xs active:scale-95"
        >
          <Plus size={13} />
          <span>إضافة ابن/ابنة</span>
        </button>
      </div>

      {childrenList.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {childrenList.map((childName, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-slate-50/70 p-2 rounded-xl border border-slate-200/70 transition-all hover:border-slate-300"
            >
              <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-500 text-[11px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                {index + 1}
              </span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => handleUpdateChild(index, e.target.value)}
                  placeholder={`اسم الابن أو الابنة (${index + 1})`}
                  className={`w-full border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white text-slate-800 font-medium ${
                    compact ? 'py-1.5 text-xs' : 'py-2 text-xs md:text-sm'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveChild(index)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                title="حذف هذا الاسم"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
