with open("src/components/FamilyTreeVisualizer.tsx", "r") as f:
    text = f.read()

text = text.replace(
    "const [collapsedBranches, setCollapsedBranches] = useState<Record<string, boolean>>({});",
    "const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});"
)

text = text.replace(
    "setCollapsedBranches",
    "setExpandedBranches"
)

text = text.replace(
    "const isCollapsed = collapsedBranches[node.id];",
    "const isCollapsed = !expandedBranches[node.id];"
)

with open("src/components/FamilyTreeVisualizer.tsx", "w") as f:
    f.write(text)
