#!/bin/bash
sed -i '/<span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200\/80 px-2.5 py-0.5 rounded-full text-\[11px\] font-bold shadow-2xs">/,/<\/span>/d' src/components/FamilyTreeVisualizer.tsx
