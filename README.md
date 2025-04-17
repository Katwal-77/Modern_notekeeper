# Keeper App

A modern, feature-rich note-taking app with cloud sync, password protection, checklist support, and a beautiful UI.

---

## Table of Contents
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Component & Function Overview](#component--function-overview)
- [How to Download & Run](#how-to-download--run)
- [Usage Guide](#usage-guide)
- [Use Cases](#use-cases)

---

## Features
- **Modern UI:** Centered bold header, clean toolbar, and responsive design.
- **Notes & Checklists:** Create, edit, pin, archive, and delete notes. Add checklists to any note.
- **Password Protection:** Set/unlock/change password for privacy.
- **Theme Toggle:** Switch between light and dark mode.
- **Cloud Sync:** Sync notes with Dropbox (import/export backup).
- **Badges:** Earn badges for milestones (e.g., first note, 10 notes).
- **Reminders:** Add reminders to notes and get notified.
- **Bulk Actions:** Archive, unarchive, or delete selected notes.
- **Import/Export:** Backup and restore your notes as JSON.

---

## Folder Structure
```
keeper-part-3-completed/
├── src/
│   ├── components/
│   │   ├── App.jsx           # Main app logic
│   │   ├── Header.jsx        # Centered Keeper title
│   │   ├── Footer.jsx        # Sticky copyright/footer
│   │   ├── FeaturePanel.jsx  # Toolbar for all features
│   │   ├── Note.jsx          # Individual note card
│   │   ├── CreateArea.jsx    # New note input
│   │   ├── DropboxSync.js    # Dropbox integration
│   │   ├── ThemeToggle.jsx   # Light/dark mode
│   │   └── ...               # Other components
│   ├── keeper.css            # All app styling
│   └── ...
├── package.json
└── README.md
```

---

## Component & Function Overview

### App.jsx (Main Logic)
- **State Management:** Handles notes, search, tags, selection, reminders, badges, password, etc.
- **Key Functions:**
  - `addNote`, `deleteNote`, `editNote`, `archiveNote`, `unarchiveNote`, `togglePin` — CRUD and organization for notes.
  - `toggleSelectNote` — Only one note can be selected at a time. Clicking the checkbox on a note will select it exclusively; clicking again will deselect.
  - `handleExportNotes`, `handleImportNotes` — Backup/restore notes as JSON. Export saves all notes, tags, badges, and metadata; import restores or merges them.
  - `handleLock`, `handleUnlock`, `handleSetPassword`, `handleChangePw` — Password flow for locking/unlocking the app, setting or changing the password, and error handling.
  - `bulkArchive`, `bulkUnarchive`, `bulkDelete` — Archive, unarchive, or delete the currently selected note (since only one can be selected at a time).
  - `unlockBadge` — Award badges for milestones (e.g., first note, 10 notes, first checklist, first pin, first archive).
  - `refreshQuote` — Rotates the motivational quote in the footer.
  - `filterNotes` — Filters notes by tags, pinned, archived, reminders, or search.

### Note.jsx
- **Displays each note card:**
  - **Header:** Title, pin icon, tags, and a selection checkbox (one note can be selected at a time).
  - **Content:** Main note text, checklist (if present), and reminder (with overdue highlight if needed).
  - **Actions:** Edit, delete (enabled only if selected), archive/unarchive, copy, export as TXT/PDF.
  - **Checklist:** Shows checklist items with their checked state (view only; editing is done in edit mode).
  - **Visual Feedback:** Selected note is highlighted; delete only works if selected.

### FeaturePanel.jsx
- **Toolbar for all features:**
  - **Theme Toggle:** Switch between light and dark mode.
  - **Dropbox Sync:** Upload/download notes to Dropbox using your access token.
  - **Export/Import:** Export all notes as a JSON backup or import from a file.
  - **Password Controls:** Lock the app, set or change password.
  - **Badges:** Shows earned badges for milestones.
  - **Responsive Layout:** Toolbar adapts for mobile and desktop.

### DropboxSync.js
- **Handles Dropbox integration:**
  - **Upload:** Save your notes backup to Dropbox.
  - **Download:** Restore notes from Dropbox backup.
  - **Access Token:** Securely manage Dropbox access.

### CreateArea.jsx
- **Note input area:**
  - Add a new note with title, content, tags, checklist, and optional reminder.
  - Checklist items can be added, removed, and reordered in edit mode.

### Header.jsx & Footer.jsx
- **Header:** Centered, bold "KEEPER" title. No controls for a clean look.
- **Footer:** Always sticks to the bottom, shows a motivational quote and copyright.

### ThemeToggle.jsx
- **Switch between light and dark mode.**

### TagSelector.jsx
- **Tag management:** Add, select, and filter notes by tags.

---

## How to Download & Run

### 1. Clone or Download
```
git clone <this-repo-url>
cd keeper-part-3-completed
```
Or download the ZIP and extract.

### 2. Install Dependencies
```
npm install
```

### 3. Start the App
```
npm start
```

- The app will run at `http://localhost:3000` by default.

---

## Usage Guide

1. **Create a Note:** Use the input area to add a new note or checklist.
2. **Pin/Archive:** Use the pin/box icons to organize notes.
3. **Select & Delete:** Click the checkbox on a note to select it. Only one can be selected. Click the trash icon to delete (enabled only for the selected note).
4. **Password:** Set a password for privacy. Unlock/change as needed.
5. **Theme:** Use the toggle to switch between light/dark mode.
6. **Dropbox:** Enter your Dropbox token to sync notes to the cloud.
7. **Export/Import:** Backup notes to JSON or restore from backup.
8. **Badges:** Earn badges for milestones.
9. **Reminders:** Set reminders for notes; get notified when due.
10. **Footer:** Motivational quote and copyright, always visible.

---

## Use Cases
- **Personal Notes:** Keep daily thoughts, todos, and reminders.
- **Work:** Organize tasks, meeting notes, and projects.
- **Cloud Backup:** Never lose your notes—sync with Dropbox.
- **Privacy:** Lock your notes with a password.
- **Motivation:** Stay inspired with rotating quotes.

---

## Troubleshooting
- **Dropbox:** Make sure your access token is valid.
- **Password:** If you forget your password, you’ll need to reset (notes are encrypted).
- **UI Issues:** Refresh the page. For persistent issues, clear browser cache.

---

## Credits
- Inspired by Google Keep, built with React.
- Iconography via Emoji and custom CSS.

---

Enjoy using Keeper! For feedback or issues, please open an issue or contact the maintainer.
# Modern_notekeeper
# Modern_notekeeper
# Modern_notekeeper
