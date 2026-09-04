import re

with open("src/components/MemberProfileEdit.tsx", "r") as f:
    text = f.read()

# Add maritalStatus state
state_replace = """  const [avatar, setAvatar] = useState(member.avatar || "");
  const [spouseName, setSpouseName] = useState(member.spouseName || "");
  const [maritalStatus, setMaritalStatus] = useState<"أعزب" | "مرتبط" | "متزوج" | "منفصل/ أرمل">(member.maritalStatus || "أعزب");
  const [gender, setGender] = useState<"male" | "female">("""
text = text.replace('  const [avatar, setAvatar] = useState(member.avatar || "");\n  const [spouseName, setSpouseName] = useState(member.spouseName || "");\n  const [gender, setGender] = useState<"male" | "female">(', state_replace)

# Add maritalStatus to effect
effect_replace = """    setAvatar(member.avatar || "");
    setSpouseName(member.spouseName || "");
    setMaritalStatus(member.maritalStatus || "أعزب");
    setGender(member.gender || "male");"""
text = text.replace('    setAvatar(member.avatar || "");\n    setSpouseName(member.spouseName || "");\n    setGender(member.gender || "male");', effect_replace)

# Add maritalStatus to update profile
update_replace = """      bio,
      avatar: avatar || undefined,
      spouseName: maritalStatus === "متزوج" ? (spouseName || null) : null,
      maritalStatus,
      gender,"""
text = text.replace('      bio,\n      avatar: avatar || undefined,\n      spouseName: spouseName || null,\n      gender,', update_replace)

with open("src/components/MemberProfileEdit.tsx", "w") as f:
    f.write(text)
