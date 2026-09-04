with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

text = text.replace(
    "onAddMemberDirectly?: (member: Omit<FamilyMember, 'id' | 'childrenIds'>) => void;",
    "onAddMemberDirectly?: (member: Omit<FamilyMember, 'id' | 'childrenIds'>) => void | string;"
)

# Add addingFatherTo state
if "const [addingFatherTo, setAddingFatherTo] = useState<FamilyMember | null>(null);" not in text:
    text = text.replace(
        "const [isAddingMember, setIsAddingMember] = useState(false);",
        "const [isAddingMember, setIsAddingMember] = useState(false);\n  const [addingFatherTo, setAddingFatherTo] = useState<FamilyMember | null>(null);"
    )

bad_save = """  const handleSaveNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddMemberDirectly) return;

    onAddMemberDirectly({
      name: newMemName,
      fatherId: newMemFatherId || null,
      fatherName: newMemFatherName,
      grandfatherName: newMemGrandfatherName,
      birthYear: newMemBirthYear === '' ? 0 : Number(newMemBirthYear),
      country: newMemCountry || 'غير محدد',
      specialization: newMemSpecialization,
      isAlive: newMemIsAlive,
      deathYear: (!newMemIsAlive && newMemDeathYear) ? Number(newMemDeathYear) : null,
      bio: newMemBio,
      gender: newMemGender as 'male' | 'female'
    });

    setIsAddingMember(false);
    // Reset fields"""

good_save = """  const handleSaveNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddMemberDirectly) return;

    const newId = onAddMemberDirectly({
      name: newMemName,
      fatherId: newMemFatherId || null,
      fatherName: newMemFatherName,
      grandfatherName: newMemGrandfatherName,
      birthYear: newMemBirthYear === '' ? 0 : Number(newMemBirthYear),
      country: newMemCountry || 'غير محدد',
      specialization: newMemSpecialization,
      isAlive: newMemIsAlive,
      deathYear: (!newMemIsAlive && newMemDeathYear) ? Number(newMemDeathYear) : null,
      bio: newMemBio,
      gender: newMemGender as 'male' | 'female'
    });

    if (addingFatherTo && onUpdateMember && typeof newId === 'string') {
      onUpdateMember({ ...addingFatherTo, fatherId: newId });
    }

    setIsAddingMember(false);
    setAddingFatherTo(null);
    // Reset fields"""
text = text.replace(bad_save, good_save)

# Reset addingFatherTo in handleAddChildDirectly and root add
text = text.replace("setIsAddingMember(true);", "setIsAddingMember(true);\n    setAddingFatherTo(null);")

with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(text)
