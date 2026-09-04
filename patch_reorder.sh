# Add framer-motion Reorder import
sed -i '3a\import { Reorder } from "motion/react";' src/components/MemberProfileEdit.tsx

# Add GripVertical to lucide-react
sed -i 's/ChevronDown/ChevronDown, GripVertical/g' src/components/MemberProfileEdit.tsx

