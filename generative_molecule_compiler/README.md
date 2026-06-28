# 🧬 AI Generative Molecule Compiler & Terminal

This application demonstrates **LLMs as universal compilers for biochemistry**. By using **SMILES (Simplified Molecular-Input Line-Entry System) notation** as a formal bridge, the application translates conversational natural language molecule descriptions into a valid structural code that is parsed, chemically relaxed, and rendered in 3D 100% locally inside your web browser.

---

## 🔬 How the Bridge Works

1.  **Natural Language Input:** You describe what molecule you want (e.g. *"synthesize paracetamol molecule"* or *"build benzene ring"*).
2.  **AI Compilation:** The AI translates this description into a valid **SMILES string** representing the molecular connectivity.
3.  **Local Chemical Parser:** A client-side JavaScript engine parses the SMILES string, infers implicit Hydrogens to satisfy standard valence, and runs a **3D Molecular Force-Field Relaxation** simulation (Hooke's spring forces for bonds, Coulomb's electrostatic repulsion for non-bonded atoms, and valence angle constraints).
4.  **WebGL Rendering:** The resulting relaxed coordinates are rendered as an interactive, specular **3D Ball-and-Stick model** using **Three.js** with metallic shadows and realistic element sizing.

---

## 🎮 How to Play

### 1. Open the Terminal
Double-click the **`index.html`** file in this folder to launch the interface directly in your browser. (No installation or command-line compilation needed!)

### 2. Rotate & Zoom
Use your mouse or trackpad to interact with the 3D viewport:
*   **Rotate:** Click and drag the molecule in any direction.
*   **Zoom:** Use your scroll wheel to zoom in and out.
The viewport uses high-fidelity PBR (Physically Based Rendering) materials to give atoms a beautiful semi-gloss appearance.

### 3. Select Presets
Click any of the compound preset buttons in the left sidebar:
*   **Caffeine:** A double-ringed purine derivative.
*   **Aspirin:** Shows a benzene ring with acetyl and carboxyl groups.
*   **Paracetamol:** Acetaminophen showing the amide connector and phenolic OH.
*   **Ethanol:** Simple carbon chain.

### 4. Prompt the AI Compiler (Simulated Mode)
Click one of the prompt examples in the sidebar (e.g., *"Compile Benzene ring"*).
*   **Simulated AI:** Run a typewriter animation typing out the compiled SMILES code.
*   **Render:** The local parser will parse it instantly, run 250 iterations of 3D relaxation, trigger a dramatic entrance spin, and show the molecule in WebGL!

### 5. Enable Live AI Mode (Optional)
To test *any organic compound* you can think of:
1. Obtain a free **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Paste the API key into the top sidebar panel. It is stored securely in your browser's local sandbox (`localStorage`).
3. Type a custom prompt in the textbox (e.g. *"Generate ibuprofen smiles"* or *"Build a molecule of glucose"*) and click **Compile & Synthesize**.
4. The live Gemini model will output a clean SMILES string, which is relaxed and rendered in 3D instantly!
