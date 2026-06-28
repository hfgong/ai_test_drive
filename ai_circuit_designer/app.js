/**
 * AI Circuit Designer - Main Application Controller
 */

// Preset Netlists
const PRESETS = {
  butterworth: `* Butterworth Low-Pass Filter (1kHz Cutoff)
V1 1 0 AC 5.0 1000
R1 1 2 1.59k
C1 2 0 100n`,
  
  rlc: `* RLC Bandpass Resonant Circuit (1kHz resonance)
V1 1 0 AC 5.0 1000
R1 1 2 50
L1 2 3 15.9m
C1 3 0 1.59u`,

  highpass: `* High-Pass Filter (10kHz Cutoff)
V1 1 0 AC 5.0 10000
C1 1 2 1.59n
R1 2 0 10k`
};

// Simulated AI Prompt compilation results
const SIMULATED_PROMPTS = {
  "design a high-pass filter with a cutoff frequency of 5khz": `* AI Compiled: High-Pass Filter (5kHz Cutoff)
V1 1 0 AC 5.0 5000
C1 1 2 3.18n
R1 2 0 10k`,
  
  "create a low-pass filter with cutoff of 500hz and 10v ac amplitude": `* AI Compiled: Low-Pass Filter (500Hz, 10V AC)
V1 1 0 AC 10.0 500
R1 1 2 3.18k
C1 2 0 100n`,

  "build an rlc parallel resonator at 20khz": `* AI Compiled: Parallel RLC Resonator (20kHz resonance)
V1 1 0 AC 5.0 20000
R1 1 2 10k
L1 2 0 7.96m
C1 2 0 7.96n`
};

let solver;
let oscChart;
let bodeChart;

document.addEventListener('DOMContentLoaded', () => {
  solver = new CircuitSolver();
  
  // Set default preset
  loadPreset('butterworth');
  
  // Setup Chart.js
  initCharts();
  
  // Run simulation
  runSimulation();
  
  // Bind Enter key on prompt input
  document.getElementById('prompt-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      compilePrompt();
    }
  });

  // API Key restore
  const savedKey = localStorage.getItem('circuit_api_key');
  if (savedKey) {
    document.getElementById('api-key').value = savedKey;
  }
});

function loadPreset(name) {
  const code = PRESETS[name];
  document.getElementById('editor').value = code;
  
  // Update dropdown selection if needed
  const select = document.getElementById('preset-select');
  if (select) select.value = name;
  
  updateLineNumbers();
  updateComponentsTable();
}

function onPresetSelectChange(value) {
  loadPreset(value);
  runSimulation();
}

function toggleApiConfig() {
  const area = document.getElementById('api-config-area');
  if (area.style.display === 'none') {
    area.style.display = 'block';
  } else {
    area.style.display = 'none';
  }
}

function updateLineNumbers() {
  const textarea = document.getElementById('editor');
  const lineNumbers = document.getElementById('line-numbers');
  if (!textarea || !lineNumbers) return;

  const lines = textarea.value.split('\n').length;
  let html = '';
  for (let i = 1; i <= lines; i++) {
    html += `<div>${i}</div>`;
  }
  lineNumbers.innerHTML = html;
  syncScroll();
}

function syncScroll() {
  const textarea = document.getElementById('editor');
  const lineNumbers = document.getElementById('line-numbers');
  if (!textarea || !lineNumbers) return;
  lineNumbers.scrollTop = textarea.scrollTop;
}

function onEditorInput() {
  updateLineNumbers();
  updateComponentsTable();
}

function updateComponentsTable() {
  const code = document.getElementById('editor').value;
  try {
    solver.parseNetlist(code);
    const tbody = document.getElementById('components-tbody');
    tbody.innerHTML = '';
    
    solver.components.forEach(c => {
      const tr = document.createElement('tr');
      
      let valStr = '';
      if (c.type === 'V') {
        valStr = c.sourceType === 'AC' 
          ? `${c.val1}V AC @ ${solver.formatValue(c.val2, 'L')}Hz` 
          : `${c.val1}V DC`;
      } else {
        valStr = solver.formatValue(c.value, c.type);
      }
      
      tr.innerHTML = `
        <td style="font-family: var(--font-mono); color: var(--accent-cyan); font-weight: bold;">${c.name}</td>
        <td style="font-family: var(--font-mono);">${c.nodeA} ➔ ${c.nodeB}</td>
        <td style="color: var(--text-secondary);">${valStr}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    // Ignore syntax typing errors
  }
}

function runSimulation() {
  const code = document.getElementById('editor').value;
  try {
    solver.parseNetlist(code);
    
    // Find active nodes (excluding ground 0)
    const activeNodes = Array.from(solver.nodes).filter(n => n > 0).sort((a,b) => a - b);
    
    if (activeNodes.length === 0) {
      alert("No active nodes (other than 0/ground) found in circuit!");
      return;
    }

    // Solve DC Operating Point for badge details
    const dcVoltages = solver.solveAtFrequency(0);
    const acSources = solver.components.filter(c => c.type === 'V' && c.sourceType === 'AC');
    const primFreq = acSources.length > 0 ? acSources[0].val2 : 1000;
    const acVoltages = solver.solveAtFrequency(primFreq);

    // Update Node Badges
    const badgeContainer = document.getElementById('node-badges');
    badgeContainer.innerHTML = '';
    
    const colors = ['#10b981', '#06b6d4', '#ec4899', '#f59e0b', '#8b5cf6'];

    activeNodes.forEach((node, i) => {
      const color = colors[i % colors.length];
      const dcVal = dcVoltages[node] ? dcVoltages[node].re.toFixed(2) : '0.00';
      const acVal = acVoltages[node] ? acVoltages[node].magnitude().toFixed(2) : '0.00';
      
      const badge = document.createElement('div');
      badge.className = 'node-badge';
      badge.innerHTML = `
        <span class="node-dot" style="background-color: ${color}; box-shadow: 0 0 10px ${color}80;"></span>
        <span>Node ${node}:</span>
        <span class="node-value">${dcVal}V DC | ${acVal}V AC</span>
      `;
      badgeContainer.appendChild(badge);
    });

    // Compute Bode Plot data
    const startFreq = 10;
    const endFreq = 1000000; // 1MHz
    const bodeData = solver.getBodeData(activeNodes, startFreq, endFreq, 80);

    // Update Bode Chart
    bodeChart.data.labels = bodeData.frequencies;
    bodeChart.data.datasets = activeNodes.map((node, idx) => {
      return {
        label: `Node ${node} Amplitude`,
        data: bodeData.nodes[node].magnitude,
        borderColor: colors[idx % colors.length],
        backgroundColor: colors[idx % colors.length] + '10',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
        yAxisID: 'y'
      };
    });
    bodeChart.update();

    // Compute Oscilloscope wave data
    // Show 3 cycles of primary frequency
    const period = 1 / primFreq;
    const duration = period * 3;
    const transData = solver.getTransientData(activeNodes, duration, 200);

    // Update Oscilloscope Chart
    oscChart.data.labels = transData.time.map(t => (t * 1000).toFixed(2)); // ms
    oscChart.data.datasets = activeNodes.map((node, idx) => {
      return {
        label: `Node ${node}`,
        data: transData.nodes[node],
        borderColor: colors[idx % colors.length],
        backgroundColor: colors[idx % colors.length] + '10',
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.2
      };
    });
    oscChart.update();

  } catch (err) {
    alert("Simulation failed: Check your netlist formatting!");
    console.error(err);
  }
}

function initCharts() {
  const ctxOsc = document.getElementById('osc-chart').getContext('2d');
  oscChart = new Chart(ctxOsc, {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { family: 'Outfit' } } }
      },
      scales: {
        x: {
          title: { display: true, text: 'Time (ms)', color: '#94a3b8' },
          ticks: { color: '#64748b' },
          grid: { color: 'rgba(255, 255, 255, 0.03)' }
        },
        y: {
          title: { display: true, text: 'Voltage (V)', color: '#94a3b8' },
          ticks: { color: '#64748b' },
          grid: { color: 'rgba(255, 255, 255, 0.03)' }
        }
      }
    }
  });

  const ctxBode = document.getElementById('bode-chart').getContext('2d');
  bodeChart = new Chart(ctxBode, {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { family: 'Outfit' } } }
      },
      scales: {
        x: {
          type: 'logarithmic',
          title: { display: true, text: 'Frequency (Hz)', color: '#94a3b8' },
          ticks: {
            color: '#64748b',
            callback: function(val) {
              if (val >= 1e6) return (val / 1e6) + 'MHz';
              if (val >= 1e3) return (val / 1e3) + 'kHz';
              return val;
            }
          },
          grid: { color: 'rgba(255, 255, 255, 0.03)' }
        },
        y: {
          title: { display: true, text: 'Gain (dB)', color: '#94a3b8' },
          ticks: { color: '#64748b' },
          grid: { color: 'rgba(255, 255, 255, 0.03)' }
        }
      }
    }
  });
}

// AI Compiler Engine
async function compilePrompt() {
  const promptInput = document.getElementById('prompt-input');
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  const loader = document.getElementById('prompt-loader');
  loader.style.display = 'flex';

  const apiKey = document.getElementById('api-key').value.trim();
  if (apiKey) {
    localStorage.setItem('circuit_api_key', apiKey);
  }

  // Check if live API call or simulated
  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI compiler that translates natural language circuit descriptions into a standard SPICE-like netlist format.
Your output must be *only* the netlist lines, nothing else. Do not use markdown backticks \`\`\` or descriptions.
Available components:
- Resistors: R[name] [nodeA] [nodeB] [value] (e.g. R1 1 2 10k, R2 2 0 100)
- Capacitors: C[name] [nodeA] [nodeB] [value] (e.g. C1 2 0 1e-6)
- Inductors: L[name] [nodeA] [nodeB] [value] (e.g. L1 2 3 10m)
- Voltage sources: V[name] [nodeA] [nodeB] AC [amplitude] [frequency] (e.g. V1 1 0 AC 5 1000) or DC (e.g. V1 1 0 DC 5)

Rule: Always include an AC voltage source (usually V1 between node 1 and ground 0) so the AC/Bode analysis can run! Ensure nodes are contiguous integers starting from 1 (with 0 as ground).
Keep it simple. Less than 8 components.

Prompt: ${prompt}`
            }]
          }]
        })
      });

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedText) {
        animateCodeTypewriter(generatedText.trim());
      } else {
        throw new Error("Could not parse response from Gemini");
      }
    } catch (err) {
      console.error(err);
      alert("AI live compilation failed. Falling back to local simulation!");
      runSimulatedCompiler(prompt);
    } finally {
      loader.style.display = 'none';
    }
  } else {
    // Simulated Compilation Mode
    setTimeout(() => {
      runSimulatedCompiler(prompt);
      loader.style.display = 'none';
    }, 1200);
  }
}

function runSimulatedCompiler(prompt) {
  const normPrompt = prompt.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
  let compiledNetlist = SIMULATED_PROMPTS[normPrompt];

  if (!compiledNetlist) {
    // Generate a default matching filter fallback
    if (normPrompt.includes('high') || normPrompt.includes('hp')) {
      compiledNetlist = `* AI Generated Fallback: High-Pass Filter
V1 1 0 AC 5.0 8000
C1 1 2 1.99n
R1 2 0 10k`;
    } else if (normPrompt.includes('low') || normPrompt.includes('lp')) {
      compiledNetlist = `* AI Generated Fallback: Low-Pass Filter
V1 1 0 AC 5.0 2000
R1 1 2 1.5k
C1 2 0 50n`;
    } else {
      compiledNetlist = `* AI Generated Fallback: Bandpass Resonator
V1 1 0 AC 5.0 5000
R1 1 2 100
L1 2 3 5m
C1 3 0 200n`;
    }
  }

  animateCodeTypewriter(compiledNetlist);
}

function animateCodeTypewriter(codeText) {
  const editor = document.getElementById('editor');
  editor.value = '';
  let index = 0;

  function typeChar() {
    if (index < codeText.length) {
      editor.value += codeText[index++];
      editor.scrollTop = editor.scrollHeight;
      updateLineNumbers();
      setTimeout(typeChar, 8); // Fast typing animation
    } else {
      updateComponentsTable();
      runSimulation();
    }
  }

  typeChar();
}

function selectPresetPrompt(promptText) {
  const promptInput = document.getElementById('prompt-input');
  promptInput.value = promptText;
  compilePrompt();
}
