cat << 'INNEREOF' > temp_sed.txt
                        onClick={() => setMemberToDelete(selectedMember.id)}
INNEREOF
sed -i '719,724d' src/components/FamilyTreeVisualizer.tsx
sed -i '718r temp_sed.txt' src/components/FamilyTreeVisualizer.tsx
