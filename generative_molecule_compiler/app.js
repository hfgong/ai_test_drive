/**
 * Generative Molecule Compiler - Main Application Controller
 */

// Presets
const PRESETS = {
  caffeine: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
  aspirin: "CC(=O)OC1=CC=CC=C1C(=O)O",
  paracetamol: "CC(=O)NC1=CC=C(O)C=C1",
  ethanol: "CCO"
};

// Simulated AI Prompt compilation results
const SIMULATED_PROMPTS = {
  "build a molecule of caffeine": "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
  "compile aspirin chemical structure": "CC(=O)OC1=CC=CC=C1C(=O)O",
  "synthesize paracetamol molecule": "CC(=O)NC1=CC=C(O)C=C1",
  "make water molecule": "O",
  "generate ibuprofen smiles": "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O",
  "build benzene ring": "C1=CC=CC=C1"
};

const ATOM_COLORS = {
  'C': 0x475569, // slate grey
  'H': 0xffffff, // white
  'O': 0xef4444, // red
  'N': 0x3b82f6, // blue
  'S': 0xeab308, // yellow
  'P': 0xf97316, // orange
  'F': 0x06b6d4, // cyan
  'Cl': 0x22c55e, // green
  'Br': 0x9a3412, // dark orange-brown
  'I': 0x8b5cf6, // violet
  'default': 0xec4899 // pink
};

const ATOM_RADII = {
  'C': 0.45,
  'H': 0.22,
  'O': 0.38,
  'N': 0.40,
  'S': 0.52,
  'P': 0.54,
  'F': 0.35,
  'Cl': 0.48,
  'Br': 0.58,
  'I': 0.65,
  'default': 0.40
};

let compiler;
let scene, camera, renderer, moleculeGroup;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let autoRotateSpeed = 0.003;

document.addEventListener('DOMContentLoaded', () => {
  compiler = new MoleculeCompiler();

  // Initialize WebGL Viewport
  initThreeJS();

  // Set default preset
  loadPreset('caffeine');

  // Bind Enter key on prompt input
  document.getElementById('prompt-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      compileAIPrompt();
    }
  });

  // Restore API key
  const savedKey = localStorage.getItem('molecule_api_key');
  if (savedKey) {
    document.getElementById('api-key').value = savedKey;
  }
});

function initThreeJS() {
  const container = document.getElementById('canvas-container');
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.z = 12;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Molecule group container
  moleculeGroup = new THREE.Group();
  scene.add(moleculeGroup);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight1.position.set(5, 10, 7);
  dirLight1.castShadow = true;
  dirLight1.shadow.mapSize.width = 1024;
  dirLight1.shadow.mapSize.height = 1024;
  dirLight1.shadow.camera.near = 0.5;
  dirLight1.shadow.camera.far = 25;
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x00f2fe, 0.35); // Cyan secondary fill light
  dirLight2.position.set(-5, -5, -5);
  scene.add(dirLight2);

  // Drag Controls for rotating molecule
  const dom = renderer.domElement;
  
  dom.addEventListener('mousedown', (e) => {
    isDragging = true;
    autoRotateSpeed = 0;
  });

  dom.addEventListener('mousemove', (e) => {
    const deltaMove = {
      x: e.offsetX - previousMousePosition.x,
      y: e.offsetY - previousMousePosition.y
    };

    if (isDragging) {
      const deltaRotationQuaternion = new THREE.Quaternion()
        .setFromEuler(new THREE.Euler(
          toRadians(deltaMove.y * 0.5),
          toRadians(deltaMove.x * 0.5),
          0,
          'XYZ'
        ));
      
      moleculeGroup.quaternion.multiplyQuaternions(deltaRotationQuaternion, moleculeGroup.quaternion);
    }

    previousMousePosition = {
      x: e.offsetX,
      y: e.offsetY
    };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    // Resume slow auto-rotation after 3 seconds of inactivity
    clearTimeout(window.rotateTimeout);
    window.rotateTimeout = setTimeout(() => {
      autoRotateSpeed = 0.003;
    }, 2000);
  });

  // Touch support
  dom.addEventListener('touchstart', (e) => {
    isDragging = true;
    autoRotateSpeed = 0;
    const touch = e.touches[0];
    previousMousePosition = {
      x: touch.clientX,
      y: touch.clientY
    };
  });

  dom.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaMove = {
      x: touch.clientX - previousMousePosition.x,
      y: touch.clientY - previousMousePosition.y
    };

    const deltaRotationQuaternion = new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(
        toRadians(deltaMove.y * 0.5),
        toRadians(touch.clientX - previousMousePosition.x), // keep it smooth
        0,
        'XYZ'
      ));
    
    moleculeGroup.quaternion.multiplyQuaternions(deltaRotationQuaternion, moleculeGroup.quaternion);

    previousMousePosition = {
      x: touch.clientX,
      y: touch.clientY
    };
  });

  dom.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Zooming
  dom.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.position.z += e.deltaY * 0.01;
    camera.position.z = Math.max(3, Math.min(25, camera.position.z));
  });

  // Window Resize
  window.addEventListener('resize', onWindowResize);

  // Render Loop
  function animate() {
    requestAnimationFrame(animate);
    
    if (autoRotateSpeed > 0) {
      moleculeGroup.rotation.y += autoRotateSpeed;
      moleculeGroup.rotation.x += autoRotateSpeed * 0.3;
    }
    
    renderer.render(scene, camera);
  }
  animate();
}

function toRadians(angle) {
  return angle * (Math.PI / 180);
}

function onWindowResize() {
  const container = document.getElementById('canvas-container');
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

function loadPreset(name) {
  const smiles = PRESETS[name];
  document.getElementById('editor').value = smiles;

  // Update dropdown selection if needed
  const select = document.getElementById('preset-select');
  if (select) select.value = name;

  updateLineNumbers();
  buildMolecule(smiles);
}

function onPresetSelectChange(value) {
  loadPreset(value);
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
}

function compileSMILESInput() {
  const smiles = document.getElementById('editor').value.trim();
  if (smiles) {
    buildMolecule(smiles);
  }
}

function buildMolecule(smiles) {
  // Clear old geometries
  while(moleculeGroup.children.length > 0){ 
    moleculeGroup.remove(moleculeGroup.children[0]); 
  }

  // Parse and build
  compiler.compileSMILES(smiles);

  // Update properties dashboard
  const props = compiler.getMolecularProperties();
  document.getElementById('formula').innerHTML = props.chemicalFormula;
  document.getElementById('weight').innerText = props.molecularWeight;
  document.getElementById('atoms-count').innerText = props.atomCount;
  document.getElementById('bonds-count').innerText = props.bondCount;
  document.getElementById('rotatable-bonds').innerText = props.rotatableBonds;

  // Render Spheres for Atoms
  const sphereGeomCache = {};
  const atomMaterials = {};

  compiler.atoms.forEach(atom => {
    const element = atom.element;
    const r = ATOM_RADII[element] || ATOM_RADII.default;
    const color = ATOM_COLORS[element] || ATOM_COLORS.default;

    // Use cached geometry for performance
    if (!sphereGeomCache[element]) {
      sphereGeomCache[element] = new THREE.SphereGeometry(r, 32, 32);
    }
    
    if (!atomMaterials[element]) {
      // Premium plastic-metallic surface shading
      atomMaterials[element] = new THREE.MeshStandardMaterial({
        color: color,
        roughness: element === 'H' ? 0.9 : 0.22,
        metalness: element === 'H' ? 0.0 : 0.15,
        bumpScale: 0.05
      });
    }

    const mesh = new THREE.Mesh(sphereGeomCache[element], atomMaterials[element]);
    mesh.position.set(atom.x, atom.y, atom.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Attach index and element data
    mesh.userData = { index: atom.index, element };
    moleculeGroup.add(mesh);
  });

  // Render Cylinders for Bonds
  const cylinderMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // silver/grey bonds
    roughness: 0.4,
    metalness: 0.2
  });

  compiler.bonds.forEach(bond => {
    const a = compiler.atoms.find(at => at.index === bond.atomA);
    const b = compiler.atoms.find(at => at.index === bond.atomB);
    if (!a || !b) return;

    const pA = new THREE.Vector3(a.x, a.y, a.z);
    const pB = new THREE.Vector3(b.x, b.y, b.z);
    const dir = new THREE.Vector3().subVectors(pB, pA);
    const length = dir.length();
    dir.normalize();

    // Hinge orientation matrices for cylinder rotation
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, dir);

    // Multi-bond offset rendering for double/triple bonds!
    const bondRadius = 0.08;
    const renders = [];

    if (bond.type === 1) {
      renders.push({ offset: new THREE.Vector3(0, 0, 0), radius: bondRadius });
    } else if (bond.type === 2) {
      // Double bond: two parallel tubes
      const offsetAmt = 0.12;
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion).normalize().multiplyScalar(offsetAmt);
      renders.push({ offset: right.clone(), radius: bondRadius * 0.85 });
      renders.push({ offset: right.clone().negate(), radius: bondRadius * 0.85 });
    } else if (bond.type === 3) {
      // Triple bond: three parallel tubes in a triangle
      const offsetAmt = 0.13;
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion).normalize().multiplyScalar(offsetAmt);
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion).normalize().multiplyScalar(offsetAmt);
      
      renders.push({ offset: right.clone(), radius: bondRadius * 0.75 });
      renders.push({ offset: right.clone().negate().add(forward.clone().multiplyScalar(0.5)), radius: bondRadius * 0.75 });
      renders.push({ offset: right.clone().negate().sub(forward.clone().multiplyScalar(0.5)), radius: bondRadius * 0.75 });
    }

    renders.forEach(spec => {
      const geom = new THREE.CylinderGeometry(spec.radius, spec.radius, length, 12);
      const mesh = new THREE.Mesh(geom, cylinderMat);
      
      // Position midpoint + apply rotation
      const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5).add(spec.offset);
      mesh.position.copy(mid);
      mesh.quaternion.copy(quaternion);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      moleculeGroup.add(mesh);
    });
  });

  // Dynamic zoom adjustments
  const boundingSphere = new THREE.Box3().setFromObject(moleculeGroup).getBoundingSphere(new THREE.Sphere());
  camera.position.z = Math.max(8, boundingSphere.radius * 2.8);
}

// AI Compiler Engine
async function compileAIPrompt() {
  const promptInput = document.getElementById('prompt-input');
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  const loader = document.getElementById('prompt-loader');
  loader.style.display = 'flex';

  const apiKey = document.getElementById('api-key').value.trim();
  if (apiKey) {
    localStorage.setItem('molecule_api_key', apiKey);
  }

  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an organic chemistry AI compiler. Translate the user's natural language request into a valid single-line SMILES chemical string.
Your output must be *only* the SMILES string itself, nothing else. Do not use markdown backticks \`\`\` or descriptions.
SMILES examples:
- Caffeine: CN1C=NC2=C1C(=O)N(C(=O)N2C)C
- Aspirin: CC(=O)OC1=CC=CC=C1C(=O)O
- Ethanol: CCO
- Ibuprofen: CC(C)CC1=CC=C(C=C1)C(C)C(=O)O

Prompt: ${prompt}`
            }]
          }]
        })
      });

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedText) {
        animateSMILesTypewriter(generatedText.trim());
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
    // Simulated compilation
    setTimeout(() => {
      runSimulatedCompiler(prompt);
      loader.style.display = 'none';
    }, 1200);
  }
}

function runSimulatedCompiler(prompt) {
  const normPrompt = prompt.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
  let compiledSMILES = SIMULATED_PROMPTS[normPrompt];

  if (!compiledSMILES) {
    // Generate a default matching structure fallback
    if (normPrompt.includes('water')) {
      compiledSMILES = 'O';
    } else if (normPrompt.includes('benzene')) {
      compiledSMILES = 'C1=CC=CC=C1';
    } else if (normPrompt.includes('ibuprofen')) {
      compiledSMILES = 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O';
    } else {
      // Default to Ethanol structure
      compiledSMILES = 'CCO';
    }
  }

  animateSMILesTypewriter(compiledSMILES);
}

function animateSMILesTypewriter(smilesText) {
  const editor = document.getElementById('editor');
  editor.value = '';
  let index = 0;

  autoRotateSpeed = 0;

  function typeChar() {
    if (index < smilesText.length) {
      editor.value += smilesText[index++];
      updateLineNumbers();
      setTimeout(typeChar, 15);
    } else {
      buildMolecule(smilesText);
      // Trigger a dramatic 3D spin on compile finish!
      moleculeGroup.rotation.set(0, 0, 0);
      let spinCount = 0;
      function dramaticSpin() {
        if (spinCount < 60) {
          moleculeGroup.rotation.y += 0.15;
          moleculeGroup.rotation.x += 0.05;
          spinCount++;
          requestAnimationFrame(dramaticSpin);
        } else {
          autoRotateSpeed = 0.003;
        }
      }
      dramaticSpin();
    }
  }

  typeChar();
}

function selectPresetPrompt(promptText) {
  const promptInput = document.getElementById('prompt-input');
  promptInput.value = promptText;
  compileAIPrompt();
}
