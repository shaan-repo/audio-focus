
# Focus Flow Modular Upgrade Plan

## ✅ Feasibility Overview

We’re upgrading Focus Flow to support multiple timer configurations and audio types. The app is already functional and structured, so extending it modularly is entirely feasible.

### 1. Timer Preset Selector (25/5, 50/10, etc.)
- **Difficulty**: Low–Moderate
- Add a dropdown or toggle buttons
- Hook dropdown to a stateful timer config like `{ focus: 25, break: 5 }`

### 2. Audio Type Selector (Binaural, White Noise, etc.)
- **Difficulty**: Moderate–High
- Convert button to a dropdown with audio source options
- Use locally stored files for now (inside `public/sounds`)
- Play test audio for 3 seconds when requested

### 3. Refactoring App.tsx
- **Difficulty**: Moderate
- Break down `App.tsx` into modular components:
  - `TimerDisplay`
  - `TimerDropdown`
  - `AudioControls`
- Lift shared state to a parent component

---

## 🧠 Optimized Prompts for Cursor

### 🔧 Step 1: Refactor the App
```
Refactor the current App.tsx file into smaller components:
- TimerDisplay: Shows the big numbers
- TimerDropdown: Dropdown to select timer presets (e.g. 25/5, 50/10)
- AudioControls: Contains audio type dropdown and Test 3s button

Make sure state that affects multiple components (like timer config or audio source) is lifted up to a parent component. Keep styles and functionality intact.
```

### ⏱️ Step 2: Add Timer Preset Dropdown
```
Inside the new TimerDropdown component, implement a dropdown using Tailwind that lets users choose from timer presets like:
- 25/5
- 50/10
- 90/20

Each option should update the `focusDuration` and `breakDuration` state in the parent component, and reset the timer to the new focus duration.
```

### 🎵 Step 3: Add Audio Type Dropdown
```
In the AudioControls component, convert the existing "Binaural" button into a dropdown with the following options:
- Binaural
- White Noise
- Pink Noise
- Rain Sounds

Each option should set a different audio file as the source. Store the files locally for now inside the `public/sounds` folder, and update the audio object in the state accordingly.
```

### 🔊 Step 4: Maintain and Upgrade 'Test 3s'
```
Keep the "Test 3s" button in AudioControls. When clicked, it should:
- Play the selected audio source from the beginning.
- Stop playback after 3 seconds.

Make sure it reflects the current audio selected in the dropdown.
```

### 🌐 (Optional) Add YouTube Link Support
```
Enable users to paste a YouTube link into an input field and stream the audio from that link using an iframe or external library, if possible. This should be treated as a custom audio option in the dropdown. Only allow one custom link at a time.
```

---

## 📦 Suggested Folder & Component Scaffold

```
src/
├── components/
│   ├── TimerDisplay.tsx       # Shows countdown numbers
│   ├── TimerDropdown.tsx      # Dropdown to choose timer format
│   ├── AudioControls.tsx      # Audio type dropdown + Test 3s
├── App.tsx                    # Parent component managing shared state
├── main.tsx
├── index.css
public/
└── sounds/
    ├── binaural.mp3
    ├── white-noise.mp3
    ├── pink-noise.mp3
    └── rain.mp3
```

## 🧠 Shared State Object in App.tsx
```tsx
const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
const [timerPreset, setTimerPreset] = useState({ focus: 25, break: 5 });
const [audioType, setAudioType] = useState<'binaural' | 'white' | 'pink' | 'rain'>('binaural');
```

This allows us to pass down `timerPreset` and `audioType` as props to respective components.
