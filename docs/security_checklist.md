# Security Checklist: What NOT to Commit to GitHub

To keep your application secure, ensure the following files and directories are **always** ignored by Git and never pushed to a public or shared repository.

## 🚫 Critical Secrets (Must Ignore)
- [ ] **Environment Files**:
    - `.env`
    - `.env.local`
    - `.env.development.local`
    - `.env.test.local`
    - `.env.production.local`
    - `import.env` (or any custom env dump)
- [ ] **Private Keys**:
    - `*.pem` (SSH/SSL keys)
    - `*.key`
    - `id_rsa` or similar SSH identity files

## 🛠️ Build & Dependency Artifacts (Should Ignore)
- [ ] **Node Modules**: `node_modules/` (Heavy and reproducible via `package.json`)
- [ ] **Next.js Build**: `.next/`
- [ ] **Vercel Build**: `.vercel/`
- [ ] **Debug Logs**: 
    - `npm-debug.log*`
    - `yarn-debug.log*`
    - `pnpm-debug.log*`

## 📝 Configuration (Context Dependent)
- [ ] **Editor Settings**: `.vscode/`, `.idea/` (Often contain local paths or personal settings)
- [ ] **OS Files**: `.DS_Store` (Mac), `Thumbs.db` (Windows)

## How to Verify
Run this command in your terminal. If it returns **nothing**, you are safe. If it lists any file, that file is currently being tracked by Git.

```bash
git ls-files .env* import.env *.pem
```

## How to Fix (If you accidentally committed a secret)
1.  **Add to .gitignore**: Add the filename to your `.gitignore` file.
2.  **Remove from Git**: Run `git rm --cached <filename>`.
3.  **Commit**: Commit the removal `git commit -m "stop tracking secret"`.
