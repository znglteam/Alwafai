#!/bin/bash
sed -i '/const \[activeTab, setActiveTab\]/a\  useEffect(() => {\n    if (activeTab === "messages") {\n      const unreadMessages = messages.filter(m => m.isReadByAdmin === false);\n      unreadMessages.forEach(msg => {\n        onUpdateMessage({ ...msg, isReadByAdmin: true });\n      });\n    }\n  }, [activeTab]);' src/components/AdminPanel.tsx
