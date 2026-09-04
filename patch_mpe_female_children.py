import re

with open("src/components/MemberProfileEdit.tsx", "r") as f:
    text = f.read()

# Patch myChildren filter
bad_myChildren = """  const myChildren = allMembers
    .filter((m) => m.fatherId === member.id)"""

good_myChildren = """  const myChildren = allMembers
    .filter((m) => m.fatherId === member.id || m.motherId === member.id)"""
text = text.replace(bad_myChildren, good_myChildren)

# Patch handleCreateChild
bad_create_child = """    onAddChild(member.id, {
      name: childName,
      fatherName: member.name,
      grandfatherName: member.fatherName,
      birthYear: childBirthYear === "" ? 0 : Number(childBirthYear),
      country: childCountry || "غير محدد",
      specialization: childSpecialization || "طالب مرحلي",
      isAlive: true,
      bio:
        childBio ||
        `ابن ${member.name} بن ${member.fatherName} بن ${member.grandfatherName}.`,
      avatar: childAvatar || undefined,
      spouseName: null,
      gender: childGender,
    });"""

good_create_child = """    const isFemale = member.gender === "female";
    onAddChild(member.id, {
      name: childName,
      fatherName: isFemale ? (member.spouseName || "غير محدد") : member.name,
      grandfatherName: isFemale ? "غير محدد" : member.fatherName,
      birthYear: childBirthYear === "" ? 0 : Number(childBirthYear),
      country: childCountry || "غير محدد",
      specialization: childSpecialization || "طالب مرحلي",
      isAlive: true,
      bio:
        childBio ||
        (isFemale 
          ? `ابن/ابنة ${member.name}.`
          : `ابن ${member.name} بن ${member.fatherName} بن ${member.grandfatherName}.`),
      avatar: childAvatar || undefined,
      spouseName: null,
      gender: childGender,
    });"""
text = text.replace(bad_create_child, good_create_child)

# Patch Helper Notice Box
bad_notice = """            {/* Helper Notice Box */}
            <div className="bg-indigo-50 border border-indigo-100/60 rounded-2xl p-4 text-right">
              <p className="text-[11px] text-indigo-800 leading-relaxed font-medium">
                💡 بصفتك عضواً في العائلة، يمكنك إضافة اسم زوجتك في النموذج
                الجانبي الأيمن، وإضافة أبنائك وبناتك من هنا ليرتبطوا بنسبك في
                الشجرة وتحديثها فوراً.
              </p>
            </div>"""

good_notice = """            {/* Helper Notice Box */}
            <div className="bg-indigo-50 border border-indigo-100/60 rounded-2xl p-4 text-right">
              <p className="text-[11px] text-indigo-800 leading-relaxed font-medium">
                {member.gender === 'female' ? (
                  "💡 بصفتكِ إحدى إناث العائلة، يمكنكِ إضافة أسماء أبنائك وبناتكِ لكي يظهروا في ملفك الشخصي هنا، مع العلم أنهم لن يظهروا في الشجرة الرئيسية للعائلة."
                ) : (
                  "💡 بصفتك عضواً في العائلة، يمكنك إضافة اسم زوجتك في النموذج الجانبي الأيمن، وإضافة أبنائك وبناتك من هنا ليرتبطوا بنسبك في الشجرة وتحديثها فوراً."
                )}
              </p>
            </div>"""
text = text.replace(bad_notice, good_notice)

with open("src/components/MemberProfileEdit.tsx", "w") as f:
    f.write(text)
