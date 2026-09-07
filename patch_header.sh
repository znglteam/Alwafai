#!/bin/bash
# Make Syria/Homs on the same line
sed -i 's/flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 text-center sm:text-right/flex flex-row items-center justify-center gap-2.5 text-right/g' src/App.tsx
# Wrap the center and left columns in a flex row wrapper for mobile
sed -i '/{\/\* Center Column: Nav Tabs \*\/}/i\          <div className="flex flex-row flex-wrap items-center justify-center gap-3 w-full md:w-auto">' src/App.tsx
sed -i '/<\/nav>/i\          <\/div>' src/App.tsx
