import re

with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

state_replace = """  const [newMemBio, setNewMemBio] = useState('');
  const [newMemSpouseName, setNewMemSpouseName] = useState('');
  const [newMemMaritalStatus, setNewMemMaritalStatus] = useState<"أعزب" | "مرتبط" | "متزوج" | "منفصل/ أرمل">("أعزب");
  const [newMemAvatar, setNewMemAvatar] = useState('');"""
text = text.replace("  const [newMemBio, setNewMemBio] = useState('');\n  const [newMemSpouseName, setNewMemSpouseName] = useState('');\n  const [newMemAvatar, setNewMemAvatar] = useState('');", state_replace)

reset_replace = """    setNewMemSpouseName('');
    setNewMemMaritalStatus('أعزب');
    setNewMemAvatar('');"""
text = text.replace("    setNewMemSpouseName('');\n    setNewMemAvatar('');", reset_replace)

submit_replace = """      bio: newMemBio,
      spouseName: newMemMaritalStatus === "متزوج" ? (newMemSpouseName || null) : null,
      maritalStatus: newMemMaritalStatus,
      avatar: newMemAvatar || undefined,"""
text = text.replace("      bio: newMemBio,\n      spouseName: newMemSpouseName || null,\n      avatar: newMemAvatar || undefined,", submit_replace)

with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(text)
