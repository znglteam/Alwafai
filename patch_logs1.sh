#!/bin/bash
sed -i '705c\
    if (currentSession.role !== "admin") {\
      await logFamilyAction(currentSession.name, "تعديل بيانات فرد", diffDetails, updated.name);\
    }' src/App.tsx

sed -i '716c\
    if (currentSession.role !== "admin") {\
      await logFamilyAction(currentSession.name, "إعادة ترتيب الأبناء/الأفراد في الشجرة", "تحديث تراتيب العائلة");\
    }' src/App.tsx
