# Remove old block from 555 to 830
sed -i '555,830d' src/components/FamilyTreeVisualizer.tsx

# Insert new block at line 555
sed -i '554r temp_modal.tsx' src/components/FamilyTreeVisualizer.tsx

