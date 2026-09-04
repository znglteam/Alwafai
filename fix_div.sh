sed -i '$ d' src/components/MemberProfileEdit.tsx
sed -i '$ d' src/components/MemberProfileEdit.tsx
cat << 'INNEREOF' >> src/components/MemberProfileEdit.tsx
        </div>
      </div>
    </div>
  );
}
INNEREOF
