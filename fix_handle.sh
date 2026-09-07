#!/bin/bash
sed -i '/\/\/ Handle Registrations (creates pending requests)/a\  const handleNewRequest = async (newRequest: Omit<RegistrationRequest, "id" | "status" | "createdAt">) => {\n    const cleanEmail = newRequest.email.trim().toLowerCase();' src/App.tsx
