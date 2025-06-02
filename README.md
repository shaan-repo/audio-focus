# Focus Flow

**Focus Flow** is a minimalist, productivity-first Pomodoro timer that blends task tracking with ambient audio to promote deep work. Built with React, Vite, TypeScript, TailwindCSS, and PWA support, it’s designed for users who want both structure and flow without clutter.

### 🔗 Live App

👉 [https://shaan-repo.github.io/audio-focus/](https://shaan-repo.github.io/audio-focus/)

---

## 🧠 Features

### 🎯 Pomodoro Timer
- Standard 25-minute focus / 5-minute rest cycles
- Simple interface for start, reset, and session tracking
- Session counter shows how many Pomodoros you've completed

### ✅ Task List
- Add, view, and manage focus tasks for each session
- Tasks persist across sessions (via local storage or state)
- Encourages goal-oriented time blocks

### 🔊 Audio Control
- Toggle binaural beats to help you lock in focus
- 3-second test button to preview sound

### 📦 Planned Additions
- **Sound Expansion**: toggle white noise, brown noise, pink noise, rain, and more
- **Custom Timer Settings**: adjustable session and break durations
- **Task Completion History**: track focus performance over time

### 📱 PWA Support
- Installable like a native app on desktop and mobile
- Works offline after initial load

---

## 🚀 Tech Stack

- [React](https://reactjs.org/) (UI)
- [Vite](https://vitejs.dev/) (build tool)
- [TypeScript](https://www.typescriptlang.org/) (type safety)
- [TailwindCSS](https://tailwindcss.com/) (styling)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (progressive web app support)

---

## 🛠️ Running Locally

```bash
pnpm install
pnpm run dev
