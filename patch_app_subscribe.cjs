const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `    const unsubMessages = subscribeToMessages((cloudMessages) => {
      setMessages(cloudMessages || []);
    });`;

const newStr = `    const unsubMessages = subscribeToMessages((cloudMessages) => {
      setMessages(cloudMessages || []);
    });

    const unsubPresence = subscribeToPresence((presences) => {
      setOnlineUsers(presences || []);
    });`;

code = code.replace(targetStr, newStr);

const targetReturnStr = `return () => {
      unsubMembers();
      unsubInfo();
      unsubNews();
      unsubPhotos();
      unsubRequests();
      unsubMessages();
      unsubLogs();
    };`;

const newReturnStr = `return () => {
      unsubMembers();
      unsubInfo();
      unsubNews();
      unsubPhotos();
      unsubRequests();
      unsubMessages();
      unsubPresence();
      unsubLogs();
    };`;

code = code.replace(targetReturnStr, newReturnStr);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched subscribe");
