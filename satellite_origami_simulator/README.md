# 🛰️ AI Space Deployable Origami Telemetry HUD

This application demonstrates **LLMs as universal compilers for structural aerospace engineering**. By using **Deployable Space Layout (SDL) JSON notation** as a formal bridge, the application translates conversational natural language rocket launching/payload descriptions into a valid structural design parameter set. This parameter set is simulated using high-fidelity rigid-origami mathematics and rendered in space in 3D 100% locally inside your web browser.

---

## 🛠️ How the Bridge Works

1.  **Natural Language Input:** You describe what kind of spacecraft deployable structure you want (e.g. *"Launch circular solar sail flasher fold in orbit"* or *"Deploy James Webb Space Telescope mirrors"*).
2.  **AI Compilation:** The AI acts as an aerospace structural engineer, translating the request into a precise, formal **SDL JSON object** defining the origami folding pattern, target orbital altitude, and specific telemetry parameters.
3.  **Local Geometry & Physics Engine:** A client-side JavaScript engine parses the configuration and runs custom **Rigid Origami Kinematic Folds**:
    *   **Miura-Fold:** Real-time 3D grid displacement chevrons.
    *   **Flasher-Fold:** Spiraling logarithmic radial panels expanding from a central hub.
    *   **JWST Mirror:** Hexagonal mirror segments swinging on vertical hinge lines.
    It also computes **Keplerian Orbital Velocity** ($v = \sqrt{\frac{GM}{r}}$) based on the target altitude!
4.  **Telemetry Viewport:** The structures are rendered inside a Three.js WebGL orbit scene with twinkling starfields, a rotating procedural blue-marble Earth with cloud cover, atmospheric glow, and metallic gold-kapton reflection shaders.

---

## 🎮 How to Play

### 1. Launch Mission Control
Double-click the **`index.html`** file in this folder to launch the telemetry dashboard directly in your browser. (No setup or packages to install!)

### 2. Manual Scrubber Timeline
At the bottom of the space viewport, drag the glowing scrubber slider from left to right:
*   **0% (Left):** Compactly stowed array packed in the rocket's launch fairing.
*   **100% (Right):** Fully deployed, active, solar-absorbing configuration in orbit.
Watch the telemetry metrics panel update in real-time showing stowed volumes shrinking, active surface areas expanding, and solar generation wattage rising!

### 3. Switch Folds Presets
Click the preset buttons in the left sidebar to swap between:
*   **Miura-Fold Solar Grid** (Classic rectangular grid folding).
*   **Flasher Starburst Sail** (Spiraling concentric circles).
*   **James Webb Hex Wing** (Hexagonal mirror segments folding backward on seam hinges).

### 4. Prompt the AI Commander (Simulated Mode)
Click any of the creative prompts in the sidebar (e.g., *"Deploy James Webb Space Telescope mirrors"*).
*   The simulated AI will load the configuration details and trigger a gorgeous, smooth automatic unfolding sequence in orbit over 3.5 seconds.
*   The telemetry deck will recalculate velocities and show live updates!

### 5. Enable Live AI Mode (Optional)
To test *any creative space structural payload* you can think of:
1. Obtain a free **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Paste the API key into the top sidebar panel. It is stored securely in your browser's local sandbox (`localStorage`).
3. Type a custom prompt in the textbox (e.g. *"Launch a circular solar sail flasher fold in orbit at 800km altitude"*) and click **Compile & Launch Array**.
4. The live Gemini model will output a clean SDL JSON configuration, which is simulated in space instantly!
