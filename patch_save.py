import re

with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

bad_save = r"""  const handleSaveNewMember = \(e: React\.FormEvent\) => \{
    e\.preventDefault\(\);
    if \(!onAddMemberDirectly\) return;

    onAddMemberDirectly\(\{
      name: newMemName,
      fatherId: newMemFatherId \|\| null,
      fatherName: newMemFatherName,
      grandfatherName: newMemGrandfatherName,
      birthYear: newMemBirthYear === '' \? 0 : Number\(newMemBirthYear\),
      country: newMemCountry \|\| 'غير محدد',
      specialization: newMemSpecialization,
      isAlive: newMemIsAlive,
      deathYear: \(!newMemIsAlive && newMemDeathYear\) \? Number\(newMemDeathYear\) : null,
      bio: newMemBio,
      spouseName: newMemSpouseName \|\| null,
      avatar: newMemAvatar \|\| undefined,
      gender: newMemGender
    \}\);

    // Reset Form
    setIsAddingMember\(false\);"""

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
      spouseName: newMemSpouseName || null,
      avatar: newMemAvatar || undefined,
      gender: newMemGender
    });

    if (addingFatherTo && onUpdateMember && typeof newId === 'string') {
      onUpdateMember({ ...addingFatherTo, fatherId: newId });
    }

    // Reset Form
    setIsAddingMember(false);
    setAddingFatherTo(null);"""

match = re.search(bad_save, text)
if match:
    print("Found!")
    text = re.sub(bad_save, good_save, text)
else:
    print("Not found! Here is the actual function:")
    print(text[text.find("const handleSaveNewMember"):text.find("setIsAddingMember(false);")+25])

with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(text)
