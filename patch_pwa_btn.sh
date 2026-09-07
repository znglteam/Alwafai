#!/bin/bash
sed -i 's/تثبيت التطبيق على الجهاز/تثبيت الموقع في سطح المكتب/g' src/components/PWAInstallButton.tsx
sed -i 's/تثبيت التطبيق على الآيفون/تثبيت الموقع في شاشتك (للايفون)/g' src/components/PWAInstallButton.tsx
sed -i 's/className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-colors w-full justify-center"/className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500\/30 hover:shadow-xl hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 w-full active:scale-95 animate-pulse"/g' src/components/PWAInstallButton.tsx
