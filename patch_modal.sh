cat << 'INNEREOF' > temp_modal.tsx
      {selectedRelativeForEdit && (
        <EditRelativeModal 
          relative={selectedRelativeForEdit} 
          onClose={() => setSelectedRelativeForEdit(null)} 
          onSave={(updated) => {
            onUpdateMember(updated);
            setSelectedRelativeForEdit(null);
          }} 
        />
      )}
INNEREOF

sed -i '/^    <\/div>$/r temp_modal.tsx' src/components/MemberProfileEdit.tsx
