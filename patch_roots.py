with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

bad_patriarch = """  // Find patriarch (member with no fatherId or whose father is not in the list)
  const patriarch = useMemo(() => {
    const ids = members.map(m => m.id);
    return members.find(m => !m.fatherId || !ids.includes(m.fatherId)) || members[0];
  }, [members]);"""

good_patriarchs = """  // Find patriarchs (members with no fatherId or whose father is not in the list)
  const patriarchs = useMemo(() => {
    const ids = members.map(m => m.id);
    const roots = members.filter(m => !m.fatherId || !ids.includes(m.fatherId));
    return roots.length > 0 ? roots : (members.length > 0 ? [members[0]] : []);
  }, [members]);"""

text = text.replace(bad_patriarch, good_patriarchs)

bad_render = """              <div className="overflow-x-auto pb-4">
                <div className="min-w-max flex justify-center p-4">
                  {patriarch ? renderTreeNode(patriarch) : (
                    <div className="w-full text-center py-16 px-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center max-w-lg mx-auto">"""

good_render = """              <div className="overflow-x-auto pb-4">
                <div className="min-w-max flex justify-center p-4 gap-12">
                  {patriarchs.length > 0 ? (
                    patriarchs.map(p => (
                      <div key={p.id}>
                        {renderTreeNode(p)}
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-center py-16 px-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center max-w-lg mx-auto">"""

text = text.replace(bad_render, good_render)

with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(text)
