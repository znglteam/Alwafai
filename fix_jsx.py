import re

with open('src/components/MemberProfileEdit.tsx', 'r') as f:
    text = f.read()

# Let's count open <div and close </div
open_divs = len(re.findall(r'<div', text))
close_divs = len(re.findall(r'</div', text))
print(f"open: {open_divs}, close: {close_divs}")
