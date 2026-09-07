#!/bin/bash
sed -i '/if (value !== null && typeof value === '\''object'\'' && !Array.isArray(value) && !(value instanceof Date)) {/{
  N
  N
  N
  c\
      if (value !== null && typeof value === '\''object'\'' && !Array.isArray(value) && !(value instanceof Date)) {\
        cleaned[key] = cleanForFirestore(value);\
      } else if (Array.isArray(value)) {\
        cleaned[key] = value.map(v => (v !== null && typeof v === '\''object'\'' && !Array.isArray(v) && !(v instanceof Date)) ? cleanForFirestore(v) : v).filter(v => v !== undefined);\
      } else {\
        cleaned[key] = value;\
      }
}' src/utils/firebaseService.ts
