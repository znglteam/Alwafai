const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `  useEffect(() => {
    localStorage.setItem('family_session_v6', JSON.stringify(currentSession));
    if (currentSession.role === 'guest' || currentSession.role === 'pending') {
      if (activeTab === 'profile' || activeTab === 'admin') {
        setActiveTab('main');
      }
    } else if (currentSession.role === 'member') {
      if (activeTab === 'admin') setActiveTab('profile');
    }
  }, [currentSession]);`;

const newStr = `  useEffect(() => {
    localStorage.setItem('family_session_v6', JSON.stringify(currentSession));
    if (currentSession.role === 'guest' || currentSession.role === 'pending') {
      if (activeTab === 'profile' || activeTab === 'admin') {
        setActiveTab('main');
      }
    } else if (currentSession.role === 'member') {
      if (activeTab === 'admin') setActiveTab('profile');
    }

    // Update presence
    let interval;
    const updatePresence = () => {
      if (currentSession.role === 'admin' || currentSession.role === 'member') {
        const presenceId = currentSession.userId || currentSession.email;
        if(presenceId) {
            updateUserPresence({
              id: presenceId,
              name: currentSession.name,
              role: currentSession.role,
              lastActive: new Date().toISOString()
            });
        }
      }
    };
    
    updatePresence();
    interval = setInterval(updatePresence, 30000); // every 30s

    return () => clearInterval(interval);
  }, [currentSession, activeTab]);`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched presence update");
