# GitHub Branch Manager (Prototype)

A **Next.js** prototype for exploring GitHub branches from a local JSON file.  
The app supports searching and filtering branches by **name**, **author**, and **date range**, and lets you quickly open the branch build in a new tab.

Authentication is currently **prototype-only** — any username/password will log you in.

---

## Features

- **Branch listing** from local JSON (`src/data/branches.json`)
- **Search filters**: by branch name, commit author, status, date range, or combination
- **Open build**: opens the branch’s build URL in a new tab
- **Badge**: showing the build statuses
- **Refresh** button to re-fetch data from the API
- **Prototype login**: any credentials accepted

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

---

### 2. Running the application

```bash
npm run dev
```
