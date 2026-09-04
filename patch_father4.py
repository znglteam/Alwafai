with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

bad = """  const handleAddChildDirectly = (father: FamilyMember) => {
    setIsAddingMember(true);
    setAddingFatherTo(null);
    setNewMemFatherId(father.id);
    setNewMemFatherName(father.name);
    setNewMemGrandfatherName(father.fatherName);
    setNewMemCountry(father.country || 'الكويت');
  };"""

good = """  const handleAddChildDirectly = (father: FamilyMember) => {
    setIsAddingMember(true);
    setAddingFatherTo(null);
    setNewMemFatherId(father.id);
    setNewMemFatherName(father.name);
    setNewMemGrandfatherName(father.fatherName);
    setNewMemCountry(father.country || 'الكويت');
  };

  const handleAddFatherDirectly = (child: FamilyMember) => {
    setAddingFatherTo(child);
    setIsAddingMember(true);
    setNewMemFatherId('');
    setNewMemFatherName('');
    setNewMemGrandfatherName('');
    setNewMemCountry(child.country || 'الكويت');
  };"""

if bad in text:
    print("Found it!")
    text = text.replace(bad, good)
else:
    print("Not found!")

with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(text)

