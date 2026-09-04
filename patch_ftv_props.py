import re

with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

props_inject = """interface FamilyTreeVisualizerProps {
  members: FamilyMember[];
  initialSelectedMemberId?: string | null;
  onClearInitialSelection?: () => void;
  onSelectMember?: (member: FamilyMember) => void;"""
text = text.replace("interface FamilyTreeVisualizerProps {\n  members: FamilyMember[];\n  onSelectMember?: (member: FamilyMember) => void;", props_inject)

comp_inject = """export default function FamilyTreeVisualizer({ 
  members,
  initialSelectedMemberId,
  onClearInitialSelection,
  isApprovedMember, """
text = text.replace("export default function FamilyTreeVisualizer({ \n  members, \n  isApprovedMember,", comp_inject)

effect_inject = """  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialSelectedMemberId) {
      const member = members.find(m => m.id === initialSelectedMemberId);
      if (member) {
        setSelectedMember(member);
        
        // Expand path to the member
        let current = member;
        const newExpanded = { ...expandedBranches };
        while (current.fatherId) {
          newExpanded[current.fatherId] = true;
          const father = members.find(m => m.id === current.fatherId);
          if (father) {
            current = father;
          } else {
            break;
          }
        }
        setExpandedBranches(newExpanded);
      }
      if (onClearInitialSelection) {
        onClearInitialSelection();
      }
    }
  }, [initialSelectedMemberId, members, onClearInitialSelection]);"""
text = text.replace("  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});", effect_inject)

with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(text)
