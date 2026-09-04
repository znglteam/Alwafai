with open("src/components/MemberProfileEdit.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.strip() == "</div>":
        pass # wait
