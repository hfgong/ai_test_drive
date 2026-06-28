# 🔌 AI Analog Circuit Compiler & Laboratory

This application demonstrates the power of **LLMs as universal compilers for physical domains**. By using **SPICE netlist notation** as a formal bridge, the application translates conversational natural language circuit specifications into concrete mathematical models that are simulated 100% locally inside your web browser.

---

## 🛠️ How the Bridge Works

1.  **Natural Language Input:** You describe what kind of filter or circuit you want (e.g. *"Design a high-pass filter with a cutoff frequency of 5kHz"*).
2.  **AI Compilation:** The AI acts as a compiler, outputting a precise, formal **SPICE netlist** representing the component topology and parameters.
3.  **Local Nodal Solver:** A lightweight JavaScript engine parses the netlist, stamps the components into a complex admittance matrix, and solves the matrix equations $\mathbf{Y}\mathbf{V} = \mathbf{I}$ using Gaussian Elimination.
4.  **Telemetry Visualization:** The calculated node voltages are rendered as real-time **Oscilloscope Waveforms** and **Bode frequency sweep graphs**.

---

## 🎮 How to Play

### 1. Open the Laboratory
Double-click the **`index.html`** file in this folder to launch the interface directly in your browser. (No command-line installation or server setup required!)

### 2. Run Presets
Click any of the preset buttons in the left sidebar:
*   **Butterworth LPF:** Low-pass filter designed to attenuate high-frequency noise.
*   **RLC Resonator:** Bandpass filter designed to resonate at 1kHz.
*   **High-Pass Filter:** Blocks DC offsets and lets high frequencies pass.
Watch the oscilloscope redraw the sinusoids and the Bode plot display the cutoffs in real-time.

### 3. Prompt the AI Compiler (Simulated Mode)
Click one of the creative prompt examples in the sidebar (e.g., *"Design a parallel RLC resonator at 20kHz"*).
*   The simulated AI will run a beautiful typewriter animation typing out the compiled SPICE netlist.
*   The local solver will parse it instantly and update the charts!

### 4. Enable Live AI Mode (Optional)
To test *any arbitrary circuit concept* you can think of:
1. Obtain a free **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Paste the API key into the top sidebar panel. It is stored securely in your browser's local sandbox (`localStorage`) and never sent elsewhere.
3. Type a custom prompt in the textbox (e.g. *"Create a low-pass filter with 200Hz cutoff using a 47k resistor"*) and click **Compile**.
4. The live Gemini model will output a clean netlist, which is simulated instantly!
