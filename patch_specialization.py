import re

constants_append = """const SPECIALIZATIONS = [
  "طب وصحة", "هندسة وبرمجة", "تصميم وميديا", "علوم وأبحاث",
  "تجارة وريادة أعمال", "تعليم وتدريب", "مهن حرفية", "فنون وأعمال يدوية",
  "أمومة", "طالب جامعي", "متقاعد", "آخر"
];
"""

def patch_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()
    
    # Append to constants
    content = content.replace("];\n\ninterface", "];\n\n" + constants_append + "\ninterface")
    
    with open(filepath, "w") as f:
        f.write(content)

patch_file("src/components/FamilyTreeVisualizer.tsx")
patch_file("src/components/MemberProfileEdit.tsx")
