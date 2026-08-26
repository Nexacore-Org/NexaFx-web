#!/bin/bash
echo "Running smoke tests..."

if ! grep -q "themeColor: \"#000000\"" app/layout.tsx; then
  echo "Failed: #602 viewport not found in app/layout.tsx"
  exit 1
fi

if ! grep -q "if (isLoading) return;" app/signup/page.tsx; then
  echo "Failed: #601 double-submission prevention not found"
  exit 1
fi

if grep -q "apiClient<any>" lib/api/wallet.ts; then
  echo "Failed: #600 apiClient<any> found"
  exit 1
fi

echo "All smoke tests passed!"
exit 0
