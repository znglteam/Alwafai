const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Import
const importTarget = `import ContactAdmin from './components/ContactAdmin';`;
const importNew = `import ContactAdmin from './components/ContactAdmin';
import Forum from './components/Forum';`;
code = code.replace(importTarget, importNew);

// 2. Add lucide icon
const lucideTarget = `import { Home, Network, User, Shield, LogOut, MessageSquare, Wifi, Bell, CloudUpload, CheckCircle, LogIn, UserPlus, Image, Headset } from 'lucide-react';`;
const lucideNew = `import { Home, Network, User, Shield, LogOut, MessageSquare, MessageSquareText, Wifi, Bell, CloudUpload, CheckCircle, LogIn, UserPlus, Image, Headset } from 'lucide-react';`;
code = code.replace(lucideTarget, lucideNew);

// 3. Update activeTab state type definition if needed (wait, typescript will just infer it or it's a string).
// Let's check where `useState('main')` is.
const stateTarget = `const [activeTab, setActiveTab] = useState<'main' | 'tree' | 'profile' | 'admin' | 'messages'>('main');`;
const stateNew = `const [activeTab, setActiveTab] = useState<'main' | 'tree' | 'profile' | 'admin' | 'messages' | 'forum'>('main');`;
code = code.replace(stateTarget, stateNew);

// 4. Add the button to navigation.
const navTarget = `            {/* Family Tree Tab - Visible ONLY to Approved Members & Admins */}
            {(currentSession.role === 'member' || currentSession.role === 'admin') && (
              <button
                onClick={() => setActiveTab('tree')}
                className={\`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer \${
                  activeTab === 'tree' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }\`}
              >
                <Network size={14} />
                شجرة العائلة
              </button>
            )}`;
const navNew = `            {/* Family Tree Tab - Visible ONLY to Approved Members & Admins */}
            {(currentSession.role === 'member' || currentSession.role === 'admin') && (
              <button
                onClick={() => setActiveTab('tree')}
                className={\`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer \${
                  activeTab === 'tree' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }\`}
              >
                <Network size={14} />
                شجرة العائلة
              </button>
            )}
            
            {/* Forum Tab */}
            {(currentSession.role === 'member' || currentSession.role === 'admin') && (
              <button
                onClick={() => setActiveTab('forum')}
                className={\`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer \${
                  activeTab === 'forum' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }\`}
              >
                <MessageSquareText size={14} />
                المنتدى
              </button>
            )}`;
code = code.replace(navTarget, navNew);

// 5. Add the Forum component renderer.
const renderTarget = `          {activeTab === 'tree' && (
            <FamilyTreeVisualizer`;
const renderNew = `          {activeTab === 'forum' && (
            <Forum currentSession={currentSession} />
          )}

          {activeTab === 'tree' && (
            <FamilyTreeVisualizer`;
code = code.replace(renderTarget, renderNew);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
