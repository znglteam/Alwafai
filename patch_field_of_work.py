import re

files_to_check = [
    "src/components/FamilyTreeVisualizer.tsx", 
    "src/components/MemberProfileEdit.tsx", 
    "src/components/MainPage.tsx",
    "src/components/AdminPanel.tsx",
    "src/components/RegistrationForm.tsx",
    "src/App.tsx",
    "src/types.ts"
]

for filename in files_to_check:
    try:
        with open(filename, "r") as f:
            text = f.read()
            
        text = text.replace("التخصص العلمي", "مجال العمل")
        text = text.replace("التخصص المهني", "مجال العمل")
        text = text.replace("التخصص/المرحلة", "مجال العمل")
        text = text.replace("التوزيع المهني والعلمي", "التوزيع حسب مجال العمل")
        
        with open(filename, "w") as f:
            f.write(text)
    except Exception as e:
        pass
