import re

with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

func = """  // Helper to infer female gender from Arabic names
  const isFemaleName = (name: string): boolean => {
    const femaleNames = ['فاطمة', 'سارة', 'هند', 'نور', 'سعاد', 'منى', 'ريم', 'حصة', 'نورة', 'أميرة', 'عائشة', 'فاطمه', 'ساره', 'مريم', 'زينب', 'خديجة', 'رندة', 'ليلى', 'رنا', 'رانية', 'هالة', 'منى', 'سهى'];
    const firstWord = name.trim().split(' ')[0];
    return femaleNames.includes(firstWord);
  };"""

func_with_descendants = """  // Helper to infer female gender from Arabic names
  const isFemaleName = (name: string): boolean => {
    const femaleNames = ['فاطمة', 'سارة', 'هند', 'نور', 'سعاد', 'منى', 'ريم', 'حصة', 'نورة', 'أميرة', 'عائشة', 'فاطمه', 'ساره', 'مريم', 'زينب', 'خديجة', 'رندة', 'ليلى', 'رنا', 'رانية', 'هالة', 'منى', 'سهى'];
    const firstWord = name.trim().split(' ')[0];
    return femaleNames.includes(firstWord);
  };

  const getDescendantsCount = (nodeId: string): number => {
    const children = membersByFather[nodeId] || [];
    let count = children.length;
    for (const child of children) {
      count += getDescendantsCount(child.id);
    }
    return count;
  };"""

text = text.replace(func, func_with_descendants)

bad_badge = """            {/* Collapser Button next to avatar */}
            {hasChildren && (
              <button """

good_badge = """            {/* Descendants Count Badge */}
            {getDescendantsCount(node.id) > 0 && (
              <div 
                className="absolute -top-1 -right-1 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm z-30" 
                title={`عدد النسل: ${getDescendantsCount(node.id)}`}
              >
                {getDescendantsCount(node.id)}
              </div>
            )}
            {/* Collapser Button next to avatar */}
            {hasChildren && (
              <button """

text = text.replace(bad_badge, good_badge)

with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(text)

