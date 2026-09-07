#!/bin/bash
sed -i '762,767d' src/App.tsx
sed -i '761c\
      await saveMultipleMembersToCloud(changed);\
    }\
    if (currentSession.role === "member") {\
      await logFamilyAction(currentSession.name, "إضافة ابن/ابنة جديدة", `إضافة ${childInfo.name}`, childInfo.name);\
    }\
  };' src/App.tsx
