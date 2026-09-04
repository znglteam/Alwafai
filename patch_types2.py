with open("src/types.ts", "r") as f:
    text = f.read()

text = text.replace("  gender?: 'male' | 'female';\n}", "  gender?: 'male' | 'female';\n  maritalStatus?: 'أعزب' | 'مرتبط' | 'متزوج' | 'منفصل/ أرمل';\n}")

with open("src/types.ts", "w") as f:
    f.write(text)
