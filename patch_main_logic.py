import re

with open("src/components/MainPage.tsx", "r") as f:
    text = f.read()

logic = """
  // Statistics calculations
  const totalCount = members.length;
  const aliveCount = members.filter(m => m.isAlive).length;
  const deceasedCount = totalCount - aliveCount;

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const countryStats = members.reduce((acc, member) => {
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
  }, {} as Record<string, string[]>);
"""

text = re.sub(r'  // Statistics calculations.*?// Specialization counts', logic + '  // Specialization counts', text, flags=re.DOTALL)

with open("src/components/MainPage.tsx", "w") as f:
    f.write(text)
