import re

with open("src/components/MainPage.tsx", "r") as f:
    text = f.read()

bad_stats = """  const countryStats = members.reduce((acc, member) => {
    const c = member.country || 'غير محدد';
    if (!acc[c]) acc[c] = [];
    acc[c].push(member.name);
    return acc;
  }, {} as Record<string, string[]>);

  const specStats = members.reduce((acc, member) => {
    const s = member.specialization || 'غير محدد';
    if (!acc[s]) acc[s] = [];
    acc[s].push(member.name);
    return acc;
  }, {} as Record<string, string[]>);"""

good_stats = """  const countryStats = members.reduce((acc, member) => {
    const c = member.country || 'غير محدد';
    if (!acc[c]) acc[c] = [];
    acc[c].push({ id: member.id, name: member.name });
    return acc;
  }, {} as Record<string, {id: string, name: string}[]>);

  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);
  const specStats = members.reduce((acc, member) => {
    const s = member.specialization || 'غير محدد';
    if (!acc[s]) acc[s] = [];
    acc[s].push({ id: member.id, name: member.name });
    return acc;
  }, {} as Record<string, {id: string, name: string}[]>);"""
text = text.replace(bad_stats, good_stats)

text = text.replace("onGoToTree: () => void;", "onGoToTree: (memberId?: string) => void;")

with open("src/components/MainPage.tsx", "w") as f:
    f.write(text)
