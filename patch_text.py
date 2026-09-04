import re

with open("src/components/MemberProfileEdit.tsx", "r") as f:
    text = f.read()

bad_text = "الأبناء والبنات المتصلين بنسبك مباركاً."
good_text = "{member.gender === 'female' ? 'الأبناء والبنات المسجلين في ملفك الشخصي.' : 'الأبناء والبنات المتصلين بنسبك مباركاً.'}"

text = text.replace(bad_text, good_text)

with open("src/components/MemberProfileEdit.tsx", "w") as f:
    f.write(text)
