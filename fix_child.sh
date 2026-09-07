#!/bin/bash
sed -i '762d' src/App.tsx
sed -i '763d' src/App.tsx
sed -i '762i\
    }\
    if (currentSession.role === "member") {\
      await logFamilyAction(currentSession.name, "إضافة ابن/ابنة جديدة", `إضافة ${childInfo.name}`, childInfo.name);\
    }' src/App.tsx
