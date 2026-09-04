with open("src/types.ts", "r") as f:
    text = f.read()

text = text.replace("  spouseName?: string | null;", "  spouseName?: string | null;\n  maritalStatus?: 'أعزب' | 'مرتبط' | 'متزوج' | 'منفصل/ أرمل';")

with open("src/types.ts", "w") as f:
    f.write(text)
