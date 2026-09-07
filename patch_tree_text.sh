#!/bin/bash
sed -i '/<div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">/{N;N;d}' src/components/FamilyTreeVisualizer.tsx
