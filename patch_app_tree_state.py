import re

with open("src/App.tsx", "r") as f:
    text = f.read()

state_inject = """  const [activeTab, setActiveTab] = useState<'home' | 'tree' | 'profile' | 'admin'>('home');
  const [treeSelectedMemberId, setTreeSelectedMemberId] = useState<string | null>(null);"""
text = text.replace("  const [activeTab, setActiveTab] = useState<'home' | 'tree' | 'profile' | 'admin'>('home');", state_inject)

goto_inject = """              onGoToTree={(memberId?: string) => {
                if (memberId) setTreeSelectedMemberId(memberId);
                setActiveTab('tree');
              }}"""
text = text.replace("              onGoToTree={() => setActiveTab('tree')}", goto_inject)

tree_inject = """            <FamilyTreeVisualizer
              members={members}
              initialSelectedMemberId={treeSelectedMemberId}
              onClearInitialSelection={() => setTreeSelectedMemberId(null)}"""
text = text.replace("            <FamilyTreeVisualizer\n              members={members}", tree_inject)

with open("src/App.tsx", "w") as f:
    f.write(text)
