#!/bin/bash
sed -i '/<p className="text-\[11px\] text-slate-500">/i\                <div className="pt-4 border-t border-emerald-200\/60 mt-4">\n                  <PWAInstallButton />\n                <\/div>' src/components/AuthModal.tsx
