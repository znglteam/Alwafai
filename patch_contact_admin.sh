#!/bin/bash
sed -i '/const \[msgError, setMsgError\]/a\  useEffect(() => {\n    const unreadMessages = messages.filter(m => (m.senderEmail === currentSession.email || m.senderId === currentSession.userId) && m.isReadByMember === false);\n    unreadMessages.forEach(msg => {\n      onUpdateMessage({ ...msg, isReadByMember: true });\n    });\n  }, []);' src/components/ContactAdmin.tsx
