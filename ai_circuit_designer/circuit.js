/**
 * Nodal Analysis Circuit Solver (MNA)
 * Computes voltages, currents, Bode plots, and transient waveforms client-side.
 */

class Complex {
  constructor(re, im = 0) {
    this.re = re;
    this.im = im;
  }

  add(other) {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  sub(other) {
    return new Complex(this.re - other.re, this.im - other.im);
  }

  mul(other) {
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }

  div(other) {
    const denom = other.re * other.re + other.im * other.im;
    if (denom === 0) return new Complex(Infinity, Infinity);
    return new Complex(
      (this.re * other.re + this.im * other.im) / denom,
      (this.im * other.re - this.re * other.im) / denom
    );
  }

  conj() {
    return new Complex(this.re, -this.im);
  }

  magnitude() {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  phase() {
    return Math.atan2(this.im, this.re);
  }
}

Complex.ZERO = new Complex(0, 0);
Complex.ONE = new Complex(1, 0);
Complex.I = new Complex(0, 1);

// Solve complex matrix equation Ax = b using Gaussian elimination with partial pivoting
function solveComplexSystem(A, b) {
  const n = b.length;
  // Deep copy A and b
  const M = A.map((row, i) => [...row.map(c => new Complex(c.re, c.im)), new Complex(b[i].re, b[i].im)]);

  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    let maxVal = M[i][i].magnitude();
    for (let r = i + 1; r < n; r++) {
      const mag = M[r][i].magnitude();
      if (mag > maxVal) {
        maxVal = mag;
        maxRow = r;
      }
    }

    // Swap rows
    if (maxRow !== i) {
      const temp = M[i];
      M[i] = M[maxRow];
      M[maxRow] = temp;
    }

    // Check singularity
    if (M[i][i].magnitude() < 1e-15) {
      // Singular matrix, return zeros
      return Array(n).fill(Complex.ZERO);
    }

    // Pivot elimination
    for (let r = i + 1; r < n; r++) {
      const factor = M[r][i].div(M[i][i]);
      for (let c = i; c <= n; c++) {
        M[r][c] = M[r][c].sub(factor.mul(M[i][c]));
      }
    }
  }

  // Back substitution
  const x = Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let sum = Complex.ZERO;
    for (let j = i + 1; j < n; j++) {
      sum = sum.add(M[i][j].mul(x[j]));
    }
    x[i] = M[i][n].sub(sum).div(M[i][i]);
  }
  return x;
}

class CircuitSolver {
  constructor() {
    this.components = [];
    this.nodes = new Set();
  }

  clear() {
    this.components = [];
    this.nodes.clear();
  }

  /**
   * Parse a simple netlist representation
   * Example:
   * V1 1 0 AC 10 1000   -> AC Source, 10V, 1000Hz between node 1 and 0
   * R1 1 2 1000          -> Resistor, 1k ohm between node 1 and 2
   * C1 2 0 1e-6          -> Capacitor, 1uF between node 2 and 0
   * L1 2 0 10e-3         -> Inductor, 10mH between node 2 and 0
   */
  parseNetlist(netlistStr) {
    this.clear();
    const lines = netlistStr.split('\n');

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('*') || line.startsWith('#')) continue;

      const tokens = line.split(/\s+/);
      const name = tokens[0].toUpperCase();
      const nodeA = parseInt(tokens[1]);
      const nodeB = parseInt(tokens[2]);

      this.nodes.add(nodeA);
      this.nodes.add(nodeB);

      const type = name[0];
      let value = parseFloat(tokens[3]);

      if (type === 'R' || type === 'C' || type === 'L') {
        // Parse standard suffixes (k, m, u, n, p)
        value = this.parseValueSuffix(tokens[3]);
        this.components.push({ name, type, nodeA, nodeB, value });
      } else if (type === 'V') {
        const sourceType = tokens[3]?.toUpperCase() || 'DC';
        let val1 = this.parseValueSuffix(tokens[4] || '0'); // DC offset or AC amplitude
        let val2 = this.parseValueSuffix(tokens[5] || '0'); // AC frequency

        this.components.push({
          name,
          type: 'V',
          nodeA,
          nodeB,
          sourceType, // 'DC' or 'AC'
          val1,       // Voltage (DC or AC Amplitude)
          val2        // Frequency (if AC)
        });
      }
    }
  }

  parseValueSuffix(str) {
    if (!str) return 0;
    const match = str.match(/^([0-9.-]+)([a-zA-Z]*)/);
    if (!match) return 0;
    const num = parseFloat(match[1]);
    const suffix = match[2].toLowerCase();

    switch (suffix) {
      case 'k': return num * 1e3;
      case 'meg': return num * 1e6;
      case 'm': return num * 1e-3;
      case 'u': return num * 1e-6;
      case 'n': return num * 1e-9;
      case 'p': return num * 1e-12;
      default: return num;
    }
  }

  formatValue(val, type) {
    if (val === undefined || isNaN(val)) return '0';
    if (type === 'R') {
      if (val >= 1e6) return (val / 1e6).toFixed(1) + ' MΩ';
      if (val >= 1e3) return (val / 1e3).toFixed(1) + ' kΩ';
      return val.toFixed(1) + ' Ω';
    }
    if (type === 'C') {
      if (val >= 1e-3) return (val * 1e3).toFixed(1) + ' mF';
      if (val >= 1e-6) return (val * 1e6).toFixed(1) + ' uF';
      if (val >= 1e-9) return (val * 1e9).toFixed(1) + ' nF';
      return (val * 1e12).toFixed(1) + ' pF';
    }
    if (type === 'L') {
      if (val >= 1e-3) return (val * 1e3).toFixed(1) + ' mH';
      return (val * 1e6).toFixed(1) + ' uH';
    }
    return val.toString();
  }

  /**
   * Solves the circuit at a single specific frequency.
   * Returns an array of complex voltages for each node.
   */
  solveAtFrequency(freq) {
    const omega = 2 * Math.PI * freq;
    
    // Map nodes to matrix indices. Node 0 is ground (not solved in matrix).
    const activeNodes = Array.from(this.nodes).filter(n => n > 0).sort((a, b) => a - b);
    const N = activeNodes.length;
    const nodeToIndex = {};
    activeNodes.forEach((node, idx) => {
      nodeToIndex[node] = idx;
    });

    // Count independent voltage sources
    const voltSources = this.components.filter(c => c.type === 'V');
    const M = voltSources.length;
    const size = N + M;

    if (size === 0) return {};

    // Initialize MNA matrix A and vector B with Complex zeros
    const A = Array(size).fill(0).map(() => Array(size).fill(Complex.ZERO));
    const B = Array(size).fill(Complex.ZERO);

    // 1. Stamp passive components
    for (const comp of this.components) {
      const idxA = comp.nodeA > 0 ? nodeToIndex[comp.nodeA] : -1;
      const idxB = comp.nodeB > 0 ? nodeToIndex[comp.nodeB] : -1;

      let admittance = Complex.ZERO;
      if (comp.type === 'R') {
        admittance = new Complex(1 / comp.value, 0);
      } else if (comp.type === 'C') {
        admittance = new Complex(0, omega * comp.value);
      } else if (comp.type === 'L') {
        const denom = omega * comp.value;
        admittance = denom === 0 ? new Complex(0, -1e9) : new Complex(0, -1 / denom);
      } else {
        continue; // Voltage sources stamped separately
      }

      if (idxA >= 0) A[idxA][idxA] = A[idxA][idxA].add(admittance);
      if (idxB >= 0) A[idxB][idxB] = A[idxB][idxB].add(admittance);
      if (idxA >= 0 && idxB >= 0) {
        A[idxA][idxB] = A[idxA][idxB].sub(admittance);
        A[idxB][idxA] = A[idxB][idxA].sub(admittance);
      }
    }

    // 2. Stamp independent voltage sources
    voltSources.forEach((src, sIdx) => {
      const idxA = src.nodeA > 0 ? nodeToIndex[src.nodeA] : -1;
      const idxB = src.nodeB > 0 ? nodeToIndex[src.nodeB] : -1;
      const rowIdx = N + sIdx;

      // Positive terminal
      if (idxA >= 0) {
        A[idxA][rowIdx] = A[idxA][rowIdx].add(Complex.ONE);
        A[rowIdx][idxA] = A[rowIdx][idxA].add(Complex.ONE);
      }
      // Negative terminal
      if (idxB >= 0) {
        A[idxB][rowIdx] = A[idxB][rowIdx].sub(Complex.ONE);
        A[rowIdx][idxB] = A[rowIdx][idxB].sub(Complex.ONE);
      }

      // Source value
      let val = Complex.ZERO;
      if (src.sourceType === 'DC') {
        // If we are doing AC analysis, DC source is AC ground (0V)
        val = new Complex(freq === 0 ? src.val1 : 0, 0);
      } else if (src.sourceType === 'AC') {
        // For AC sweep, if freq matches, use full amplitude, else sweep
        val = new Complex(src.val1, 0);
      }
      B[rowIdx] = val;
    });

    // 3. Solve system Ax = B
    const x = solveComplexSystem(A, B);

    // 4. Build node voltage dictionary
    const voltages = { 0: Complex.ZERO };
    activeNodes.forEach((node, idx) => {
      voltages[node] = x[idx];
    });

    return voltages;
  }

  /**
   * Computes frequency sweep (Bode Plot data) for specified nodes.
   */
  getBodeData(nodesToMeasure, startFreq = 10, endFreq = 100000, points = 80) {
    const data = {
      frequencies: [],
      nodes: {}
    };

    nodesToMeasure.forEach(node => {
      data.nodes[node] = { magnitude: [], phase: [] };
    });

    // Logarithmic frequency sweep
    const logStart = Math.log10(startFreq);
    const logEnd = Math.log10(endFreq);
    const step = (logEnd - logStart) / (points - 1);

    for (let i = 0; i < points; i++) {
      const freq = Math.pow(10, logStart + i * step);
      data.frequencies.push(freq);

      const voltages = this.solveAtFrequency(freq);

      nodesToMeasure.forEach(node => {
        const vComplex = voltages[node] || Complex.ZERO;
        const magDb = 20 * Math.log10(Math.max(vComplex.magnitude(), 1e-12));
        let phaseDeg = vComplex.phase() * (180 / Math.PI);
        data.nodes[node].magnitude.push(magDb);
        data.nodes[node].phase.push(phaseDeg);
      });
    }

    return data;
  }

  /**
   * Generates time domain waveform arrays for transient oscilloscope view.
   */
  getTransientData(nodesToMeasure, duration = 0.002, points = 200) {
    const data = {
      time: [],
      nodes: {}
    };

    nodesToMeasure.forEach(node => {
      data.nodes[node] = [];
    });

    // Find the primary frequency in the circuit to show reasonable waves
    const acSources = this.components.filter(c => c.type === 'V' && c.sourceType === 'AC');
    const primaryFreq = acSources.length > 0 ? acSources[0].val2 : 1000;
    const omega = 2 * Math.PI * primaryFreq;

    // Solve for DC voltages (0 Hz) and AC voltages (at primary frequency)
    const dcVoltages = this.solveAtFrequency(0);
    const acVoltages = this.solveAtFrequency(primaryFreq);

    const step = duration / (points - 1);

    for (let i = 0; i < points; i++) {
      const t = i * step;
      data.time.push(t);

      nodesToMeasure.forEach(node => {
        const vDC = dcVoltages[node] ? dcVoltages[node].re : 0;
        const vAC = acVoltages[node] || Complex.ZERO;
        
        // Superposition formula: v(t) = V_DC + A * sin(omega * t + phase)
        const amp = vAC.magnitude();
        const phase = vAC.phase();
        const instantVolt = vDC + amp * Math.sin(omega * t + phase);
        
        data.nodes[node].push(instantVolt);
      });
    }

    return data;
  }
}

// Export for node or browser
if (typeof module !== 'undefined') {
  module.exports = { Complex, CircuitSolver };
} else {
  window.Complex = Complex;
  window.CircuitSolver = CircuitSolver;
}
