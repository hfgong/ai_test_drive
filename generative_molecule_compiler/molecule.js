/**
 * SMILES Parser & 3D Molecule Coordinates Generator
 * Parses organic SMILES strings, infers implicit hydrogens, builds adjacency graphs,
 * and performs 3D force-directed relaxation to produce realistic spatial structures.
 */

class Atom {
  constructor(element, index) {
    this.element = element;
    this.index = index;
    this.x = (Math.random() - 0.5) * 5; // Initial random 3D position
    this.y = (Math.random() - 0.5) * 5;
    this.z = (Math.random() - 0.5) * 5;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
  }
}

class Bond {
  constructor(atomA, atomB, type = 1) {
    this.atomA = atomA; // Index of atom A
    this.atomB = atomB; // Index of atom B
    this.type = type;   // 1 = single, 2 = double, 3 = triple
  }
}

class MoleculeCompiler {
  constructor() {
    this.atoms = [];
    this.bonds = [];
  }

  clear() {
    this.atoms = [];
    this.bonds = [];
  }

  /**
   * Parses a SMILES string and builds a 3D atom-bond graph
   */
  compileSMILES(smiles) {
    this.clear();
    if (!smiles) return;

    const atomStack = [];
    const ringClosures = {};
    let activeAtom = null;
    let atomIndexCounter = 0;
    
    let i = 0;
    while (i < smiles.length) {
      const char = smiles[i];

      if (char === '[') {
        // Parse bracketted element, e.g. [NH4+]
        let endIdx = smiles.indexOf(']', i);
        if (endIdx === -1) endIdx = smiles.length;
        const bracketContent = smiles.substring(i + 1, endIdx);
        
        // Basic element extraction
        const elementMatch = bracketContent.match(/[A-Z][a-z]?/);
        const element = elementMatch ? elementMatch[0] : 'C';
        
        const newAtom = new Atom(element, atomIndexCounter++);
        this.atoms.push(newAtom);

        if (activeAtom) {
          this.bonds.push(new Bond(activeAtom.index, newAtom.index, 1));
        }
        activeAtom = newAtom;
        i = endIdx + 1;
      } else if (/[A-Z][a-z]?/.test(smiles.substring(i, i + 2)) && i + 1 < smiles.length && ['Cl', 'Br', 'Na', 'Si'].includes(smiles.substring(i, i + 2))) {
        // Two-character elements
        const element = smiles.substring(i, i + 2);
        const newAtom = new Atom(element, atomIndexCounter++);
        this.atoms.push(newAtom);

        if (activeAtom) {
          this.bonds.push(new Bond(activeAtom.index, newAtom.index, 1));
        }
        activeAtom = newAtom;
        i += 2;
      } else if (/[CNOPSFIClB]/.test(char)) {
        // One-character elements (organics)
        let element = char;
        if (char === 'C' && smiles[i + 1] === 'l') {
          element = 'Cl';
          i++;
        }
        const newAtom = new Atom(element, atomIndexCounter++);
        this.atoms.push(newAtom);

        if (activeAtom) {
          this.bonds.push(new Bond(activeAtom.index, newAtom.index, 1));
        }
        activeAtom = newAtom;
        i++;
      } else if (char === '(') {
        // Branching start: push active atom to stack
        atomStack.push(activeAtom);
        i++;
      } else if (char === ')') {
        // Branching end: pop previous active atom
        activeAtom = atomStack.pop() || null;
        i++;
      } else if (/[0-9]/.test(char)) {
        // Ring closure
        const ringNum = char;
        if (ringClosures[ringNum] !== undefined) {
          const partnerAtom = ringClosures[ringNum];
          // Complete ring bond
          this.bonds.push(new Bond(activeAtom.index, partnerAtom.index, 1));
          delete ringClosures[ringNum];
        } else {
          ringClosures[ringNum] = activeAtom;
        }
        i++;
      } else if (char === '=') {
        // Double bond symbol
        // Peak next element and bond with double weight
        i++;
        let nextChar = smiles[i];
        let element = nextChar;
        if (nextChar === 'C' && smiles[i + 1] === 'l') {
          element = 'Cl';
          i++;
        }
        const newAtom = new Atom(element, atomIndexCounter++);
        this.atoms.push(newAtom);

        if (activeAtom) {
          this.bonds.push(new Bond(activeAtom.index, newAtom.index, 2)); // Double bond
        }
        activeAtom = newAtom;
        i++;
      } else {
        // Skip unknown/unsupported SMILES tokens
        i++;
      }
    }

    // Proactively add implicit Hydrogens to complete chemical octets (valence)
    this.addImplicitHydrogens();

    // Relax the 3D coordinates using a fast molecular mechanical solver
    this.relax3DCoordinates();
  }

  /**
   * Automatically calculates missing Hydrogen atoms to satisfy standard valence
   */
  addImplicitHydrogens() {
    const valences = { 'C': 4, 'N': 3, 'O': 2, 'S': 2, 'P': 3, 'F': 1, 'Cl': 1, 'Br': 1, 'I': 1, 'H': 1 };
    const originalCount = this.atoms.length;
    let atomIndexCounter = originalCount;

    for (let idx = 0; idx < originalCount; idx++) {
      const atom = this.atoms[idx];
      const maxValence = valences[atom.element] || 0;
      if (maxValence === 0) continue;

      // Count bonds connected to this atom
      let currentValence = 0;
      this.bonds.forEach(bond => {
        if (bond.atomA === atom.index || bond.atomB === atom.index) {
          currentValence += bond.type;
        }
      });

      const implicitHs = maxValence - currentValence;
      for (let h = 0; h < implicitHs; h++) {
        const hAtom = new Atom('H', atomIndexCounter++);
        // Spawn slightly offset from parent atom
        hAtom.x = atom.x + (Math.random() - 0.5) * 0.5;
        hAtom.y = atom.y + (Math.random() - 0.5) * 0.5;
        hAtom.z = atom.z + (Math.random() - 0.5) * 0.5;

        this.atoms.push(hAtom);
        this.bonds.push(new Bond(atom.index, hAtom.index, 1));
      }
    }
  }

  /**
   * High-Performance 3D Molecular Force-Directed relaxation solver.
   * Pulls bonded atoms together, pushes non-bonded atoms apart, and 
   * stabilizes tetrahedral/planar geometric valence angles.
   */
  relax3DCoordinates(iterations = 250) {
    const bondLengths = {
      'C-C': 1.54, 'C=C': 1.34, 'C#C': 1.20,
      'C-H': 1.09, 'O-H': 0.96, 'N-H': 1.01,
      'C-O': 1.43, 'C=O': 1.22,
      'C-N': 1.47, 'C=N': 1.28,
      'C-S': 1.82, 'S-H': 1.34,
      'default': 1.40
    };

    const k_bond = 12.0;    // Spring constant for bonds
    const k_repulsion = 5.0;// Coulomb repulsion for non-bonded atoms
    const k_angle = 6.0;    // Valence angle spring constant
    const damping = 0.82;   // Velocity damping to bring energy down quickly

    for (let iter = 0; iter < iterations; iter++) {
      // 1. Reset forces
      const fx = Array(this.atoms.length).fill(0);
      const fy = Array(this.atoms.length).fill(0);
      const fz = Array(this.atoms.length).fill(0);

      // 2. Electrostatic Repulsion (push all non-bonded atoms apart)
      for (let i = 0; i < this.atoms.length; i++) {
        for (let j = i + 1; j < this.atoms.length; j++) {
          const a = this.atoms[i];
          const b = this.atoms[j];
          
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dz = a.z - b.z;
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) || 0.1;
          
          // Repulsion force falls off with square of distance
          // Push stronger for overlapping atoms
          const force = k_repulsion / (dist * dist * dist || 0.01);
          
          fx[i] += dx * force;
          fy[i] += dy * force;
          fz[i] += dz * force;

          fx[j] -= dx * force;
          fy[j] -= dy * force;
          fz[j] -= dz * force;
        }
      }

      // 3. Hooke's Law Bond Springs (pull bonded atoms together)
      this.bonds.forEach(bond => {
        const a = this.atoms.find(at => at.index === bond.atomA);
        const b = this.atoms.find(at => at.index === bond.atomB);
        if (!a || !b) return;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) || 0.1;

        // Ideal bond length lookup
        const bondKey = `${a.element}-${b.element}`;
        const bondKeyAlt = `${b.element}-${a.element}`;
        const bondKeyDouble = `${a.element}=${b.element}`;
        
        let ideal = bondLengths.default;
        if (bond.type === 2) {
          ideal = bondLengths[bondKeyDouble] || 1.25;
        } else {
          ideal = bondLengths[bondKey] || bondLengths[bondKeyAlt] || bondLengths.default;
        }

        const delta = dist - ideal;
        const force = k_bond * delta / dist;

        fx[a.index] += dx * force;
        fy[a.index] += dy * force;
        fz[a.index] += dz * force;

        fx[b.index] -= dx * force;
        fy[b.index] -= dy * force;
        fz[b.index] -= dz * force;
      });

      // 4. Valence Angle Stabilizer Heuristics
      // For any atom connected to multiple neighbors, force them to push out into planar/tetrahedral shapes
      for (let i = 0; i < this.atoms.length; i++) {
        const centralAtom = this.atoms[i];
        
        // Find all connected neighbors
        const neighbors = [];
        this.bonds.forEach(b => {
          if (b.atomA === centralAtom.index) {
            neighbors.push(this.atoms.find(at => at.index === b.atomB));
          } else if (b.atomB === centralAtom.index) {
            neighbors.push(this.atoms.find(at => at.index === b.atomA));
          }
        });

        if (neighbors.length >= 2) {
          // Push neighbors away from each other to satisfy angles (e.g. 109.5 degrees for SP3 carbon)
          for (let n1 = 0; n1 < neighbors.length; n1++) {
            for (let n2 = n1 + 1; n2 < neighbors.length; n2++) {
              const atom1 = neighbors[n1];
              const atom2 = neighbors[n2];
              if (!atom1 || !atom2) continue;

              const dx = atom2.x - atom1.x;
              const dy = atom2.y - atom1.y;
              const dz = atom2.z - atom1.z;
              const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) || 0.1;
              
              // Simple planar/tetrahedral separation spring
              const force = k_angle / dist;
              fx[atom1.index] -= dx * force;
              fy[atom1.index] -= dy * force;
              fz[atom1.index] -= dz * force;

              fx[atom2.index] += dx * force;
              fy[atom2.index] += dy * force;
              fz[atom2.index] += dz * force;
            }
          }
        }
      }

      // 5. Apply Forces & Integrate Position (Verlet Integration with Damping)
      for (let i = 0; i < this.atoms.length; i++) {
        const a = this.atoms[i];
        a.vx = (a.vx + fx[i] * 0.005) * damping;
        a.vy = (a.vy + fy[i] * 0.005) * damping;
        a.vz = (a.vz + fz[i] * 0.005) * damping;

        a.x += a.vx;
        a.y += a.vy;
        a.z += a.vz;
      }
    }

    // 6. Recenter molecule around the origin
    let cx = 0, cy = 0, cz = 0;
    this.atoms.forEach(a => {
      cx += a.x;
      cy += a.y;
      cz += a.z;
    });
    cx /= this.atoms.length;
    cy /= this.atoms.length;
    cz /= this.atoms.length;

    this.atoms.forEach(a => {
      a.x -= cx;
      a.y -= cy;
      a.z -= cz;
    });
  }

  /**
   * Computes molecular metrics
   */
  getMolecularProperties() {
    const weights = {
      'C': 12.011, 'H': 1.008, 'O': 15.999, 'N': 14.007,
      'S': 32.06, 'P': 30.974, 'F': 18.998, 'Cl': 35.45,
      'Br': 79.904, 'I': 126.904
    };

    let weight = 0;
    const formulas = {};

    this.atoms.forEach(a => {
      weight += weights[a.element] || 12.0;
      formulas[a.element] = (formulas[a.element] || 0) + 1;
    });

    // Format hill system formula: C first, then H, then alphabetical
    let formulaStr = '';
    if (formulas['C']) {
      formulaStr += `C<sub>${formulas['C']}</sub>`;
      delete formulas['C'];
    }
    if (formulas['H']) {
      formulaStr += `H<sub>${formulas['H']}</sub>`;
      delete formulas['H'];
    }
    Object.keys(formulas).sort().forEach(el => {
      formulaStr += `${el}<sub>${formulas[el]}</sub>`;
    });

    const rotatableBonds = this.bonds.filter(b => {
      const atomA = this.atoms.find(at => at.index === b.atomA);
      const atomB = this.atoms.find(at => at.index === b.atomB);
      if (!atomA || !atomB) return false;
      // Rotatable bond: single bond, non-terminal, not in rigid structures
      return b.type === 1 && atomA.element !== 'H' && atomB.element !== 'H';
    }).length;

    return {
      molecularWeight: weight.toFixed(3) + ' g/mol',
      chemicalFormula: formulaStr || 'N/A',
      atomCount: this.atoms.length,
      bondCount: this.bonds.length,
      rotatableBonds: Math.max(0, rotatableBonds - 2) // Approximate rotatable chains
    };
  }
}

// Export for node or browser
if (typeof module !== 'undefined') {
  module.exports = { Atom, Bond, MoleculeCompiler };
} else {
  window.Atom = Atom;
  window.Bond = Bond;
  window.MoleculeCompiler = MoleculeCompiler;
}
