import re

with open("src/components/AdminPanel.tsx", "r") as f:
    text = f.read()

state_replace = """  const [newMemAvatar, setNewMemAvatar] = useState('');
  const [newMemSpouse, setNewMemSpouse] = useState('');
  const [newMemMaritalStatus, setNewMemMaritalStatus] = useState<"أعزب" | "مرتبط" | "متزوج" | "منفصل/ أرمل">("أعزب");"""
text = text.replace("  const [newMemAvatar, setNewMemAvatar] = useState('');\n  const [newMemSpouse, setNewMemSpouse] = useState('');", state_replace)

reset_replace = """    setNewMemAvatar('');
    setNewMemSpouse('');
    setNewMemMaritalStatus('أعزب');"""
text = text.replace("    setNewMemAvatar('');\n    setNewMemSpouse('');", reset_replace)

submit_replace = """      avatar: newMemAvatar || undefined,
      maritalStatus: newMemMaritalStatus,
      spouseName: newMemMaritalStatus === "متزوج" ? (newMemSpouse || null) : null,"""
text = text.replace("      avatar: newMemAvatar || undefined,\n      spouseName: newMemSpouse || null,", submit_replace)

with open("src/components/AdminPanel.tsx", "w") as f:
    f.write(text)
