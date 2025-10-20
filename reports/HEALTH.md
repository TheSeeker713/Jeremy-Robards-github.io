# 🏥 Codebase Health Report

**Generated:** 10/20/2025, 7:24:58 AM

---

## 📝 Linting (ESLint)

- **Status:** ❌ ERROR
- **Errors:** Unknown
- **Warnings:** Unknown

## 📘 Type Safety (TypeScript)

- **Status:** ✅ PASS
- **Type Errors:** 0

## 💅 Code Formatting (Prettier)

- **Status:** ⚠️ WARN
- **Unformatted Files:** 53

## 🔒 Security (npm audit)

- **Status:** ❌ ERROR
- **Vulnerabilities:**
  - Critical: 0
  - High: 0
  - Moderate: 0
  - Low: 0

## 🧹 Dead Code (ts-prune)

- **Status:** ⚠️ FOUND
- **Unused Exports:** 13

## 🔄 Dependencies

### Circular Dependencies

- **Status:** ✅ NONE
- **Count:** 0

### Duplicate Dependencies

- **Status:** ✅ CHECKED

## 🔍 File Corruption

- **Status:** ❌ CORRUPT FILES
- **Corrupt Files:** 1

---

## 📋 Summary

❌ **Action Required:** Critical issues found that need fixing.

## 📁 Detailed Reports

- `reports/eslint.json` - Full ESLint report
- `reports/typescript.txt` - TypeScript errors
- `reports/security.json` - Security audit results
- `reports/deadcode.json` - Unused exports
- `reports/circular-deps.json` - Circular dependencies
- `reports/corruption.json` - Corrupt files

---

**Next Steps:**

1. Run `npm run lint:fix` to auto-fix linting issues
2. Run `npm run fmt:write` to auto-format code
3. Review and fix type errors manually
4. Run `npm audit fix` to patch security vulnerabilities
5. Review dead code and remove if unnecessary
