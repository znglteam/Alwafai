with open('src/components/MemberProfileEdit.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line == "    </div>\n" or line == "    </div>":
        pass
    else:
        new_lines.append(line)

with open('src/components/MemberProfileEdit.tsx', 'w') as f:
    f.writelines(new_lines)
