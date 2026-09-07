#!/bin/bash
sed -i 's/await logFamilyAction(.*"تعديل بيانات فرد".*//g' src/App.tsx
sed -i 's/await logFamilyAction(.*"إعادة ترتيب الأبناء\/الأفراد في الشجرة".*//g' src/App.tsx
sed -i 's/await logFamilyAction(.*"إضافة ابن\/ابنة جديدة".*//g' src/App.tsx
sed -i 's/logFamilyAction(currentSession.name, '"'إضافة عضو مباشرة إلى الشجرة'"'.*//g' src/App.tsx
sed -i 's/await logFamilyAction(currentSession.name, '"'حذف عضو من الشجرة'"'.*//g' src/App.tsx
sed -i 's/await logFamilyAction(currentSession.name, '"'استعادة بيانات الشجرة'"'.*//g' src/App.tsx
