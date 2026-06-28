/**
 * Space Origami Deployable Telemetry Simulator - Controller
 */

// Simulated AI Prompt compilation results (configured as FOLD JSON structures)
const SIMULATED_PROMPTS = {
  "deploy james webb space telescope mirrors": {
    pattern: "jwst",
    altitude: 1500000 // L2 Orbit (1.5M km)
  },
  "launch circular solar sail flasher fold in orbit": {
    pattern: "flasher",
    altitude: 800 // 800km orbit
  },
  "establish a miura-fold solar array in low-earth orbit": {
    pattern: "miura",
    altitude: 400 // ISS altitude (400km)
  }
};

let simulator;
let scene, camera, renderer;
let earthMesh, atmosphereMesh, starsGroup;
let satelliteGroup, origamiMeshObj;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

let currentDeployVal = 0.05; // starts stowed
let targetDeployVal = 0.05;
let currentAltitude = 400; // km
let parsedFoldData = null; // Cache parsed FOLD JSON structure

document.addEventListener('DOMContentLoaded', () => {
  simulator = new OrigamiSimulator();

  // Initialize WebGL Viewport
  initThreeJS();

  // Bind scrubber timeline slider
  const scrubber = document.getElementById('scrubber');
  scrubber.addEventListener('input', (e) => {
    targetDeployVal = parseFloat(e.target.value);
  });

  // Bind Enter key on prompt input
  document.getElementById('prompt-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      compileSpacePrompt();
    }
  });

  // Restore API key
  const savedKey = localStorage.getItem('space_api_key');
  if (savedKey) {
    document.getElementById('api-key').value = savedKey;
  }

  // Load default preset
  loadPreset('miura');
});

function initThreeJS() {
  const container = document.getElementById('canvas-container');
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0.5, 12);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Groups
  satelliteGroup = new THREE.Group();
  scene.add(satelliteGroup);

  // Stars Skybox
  starsGroup = new THREE.Group();
  const starsGeom = new THREE.BufferGeometry();
  const starsCount = 1500;
  const starsCoords = new Float32Array(starsCount * 3);
  for (let i = 0; i < starsCount * 3; i++) {
    starsCoords[i] = (Math.random() - 0.5) * 300;
  }
  starsGeom.setAttribute('position', new THREE.BufferAttribute(starsCoords, 3));
  const starsMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.8,
    sizeAttenuation: true
  });
  const starField = new THREE.Points(starsGeom, starsMat);
  starsGroup.add(starField);
  scene.add(starsGroup);

  // Procedural Earth texture map
  const earthRadius = 3.5;
  const earthGeom = new THREE.SphereGeometry(earthRadius, 64, 64);
  const earthTexture = createProceduralEarthTexture();
  const earthMat = new THREE.MeshStandardMaterial({
    map: earthTexture,
    roughness: 0.6,
    metalness: 0.1
  });
  earthMesh = new THREE.Mesh(earthGeom, earthMat);
  earthMesh.position.set(-6, -6, -20);
  scene.add(earthMesh);

  // Atmosphere Glow Effect
  const atmosphereGeom = new THREE.SphereGeometry(earthRadius * 1.05, 32, 32);
  const atmosphereMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide
  });
  atmosphereMesh = new THREE.Mesh(atmosphereGeom, atmosphereMat);
  atmosphereMesh.position.copy(earthMesh.position);
  scene.add(atmosphereMesh);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.75);
  sunLight.position.set(20, 20, 20);
  sunLight.castShadow = true;
  scene.add(sunLight);

  // Blue Space Earth backlight
  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.65);
  rimLight.position.set(-20, -20, -20);
  scene.add(rimLight);

  // Orbit Drag Controls (rotating camera target around satellite)
  const dom = renderer.domElement;
  dom.addEventListener('mousedown', () => { isDragging = true; });

  dom.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaMove = {
        x: e.offsetX - previousMousePosition.x,
        y: e.offsetY - previousMousePosition.y
      };

      satelliteGroup.rotation.y += deltaMove.x * 0.005;
      satelliteGroup.rotation.x += deltaMove.y * 0.005;
    }

    previousMousePosition = {
      x: e.offsetX,
      y: e.offsetY
    };
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  // Zooming
  dom.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.position.z += e.deltaY * 0.01;
    camera.position.z = Math.max(5, Math.min(25, camera.position.z));
  });

  // Window Resize
  window.addEventListener('resize', onWindowResize);

  // Main Render Loop
  function animate() {
    requestAnimationFrame(animate);

    earthMesh.rotation.y += 0.0005;
    starsGroup.rotation.y += 0.0001;

    // Linear interpolation for smooth deployment timeline transitions
    if (Math.abs(currentDeployVal - targetDeployVal) > 0.001) {
      currentDeployVal += (targetDeployVal - currentDeployVal) * 0.12;
      buildOrigamiMesh();
    }

    updateTelemetryHUD();

    renderer.render(scene, camera);
  }
  animate();
}

function createProceduralEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Fill blue oceans
  ctx.fillStyle = '#061a33';
  ctx.fillRect(0, 0, 1024, 512);

  // Draw landmasses
  ctx.fillStyle = '#2d5e38';
  for (let idx = 0; idx < 16; idx++) {
    const lx = Math.random() * 1024;
    const ly = Math.random() * 512;
    const lRadius = 80 + Math.random() * 100;
    
    ctx.beginPath();
    ctx.arc(lx, ly, lRadius, 0, 2 * Math.PI);
    ctx.fill();

    for (let is = 0; is < 6; is++) {
      ctx.fillStyle = Math.random() > 0.45 ? '#4b6f3b' : '#335022';
      ctx.beginPath();
      ctx.arc(lx + (Math.random() - 0.5) * lRadius * 1.5, ly + (Math.random() - 0.5) * lRadius * 1.5, lRadius * 0.4, 0, 2*Math.PI);
      ctx.fill();
    }
  }

  // Draw soft clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  for (let cl = 0; cl < 20; cl++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 1024, Math.random() * 512, 50 + Math.random() * 80, 0, 2 * Math.PI);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
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
  let jsonCode = "";
  if (name === 'flasher') {
    jsonCode = simulator.getFlasherFoldJSON(8, 3);
  } else if (name === 'jwst') {
    jsonCode = simulator.getJWSTFoldJSON();
  } else {
    jsonCode = simulator.getMiuraFoldJSON(5, 6);
  }

  document.getElementById('editor').value = jsonCode;

  // Update select dropdown if needed
  const select = document.getElementById('preset-select');
  if (select) select.value = name;

  updateLineNumbers();
  compileFOLDInput();
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

let lastLineCount = 0;
function updateLineNumbers() {
  const textarea = document.getElementById('editor');
  const lineNumbers = document.getElementById('line-numbers');
  if (!textarea || !lineNumbers) return;

  const lines = textarea.value.split('\n').length;
  if (lines === lastLineCount) {
    syncScroll();
    return;
  }
  lastLineCount = lines;

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

function compileFOLDInput() {
  const code = document.getElementById('editor').value;
  try {
    parsedFoldData = JSON.parse(code);
    
    // Set UI configuration summaries
    document.getElementById('lbl-deployment').innerText = parsedFoldData.pattern_name || "Custom FOLD Design";
    
    // Reset scrubber timeline
    document.getElementById('scrubber').value = 0.05;
    targetDeployVal = 0.05;
    currentDeployVal = 0.05;

    buildOrigamiMesh();
  } catch (e) {
    // Gracefully ignore syntax parsing errors while editing
  }
}

/**
 * Builds the 3D Satellite Mesh in WebGL.
 * Coordinates are linearly interpolated between stowed (0.0) and deployed (1.0).
 */
function buildOrigamiMesh() {
  if (!parsedFoldData) return;

  // Clear old meshes
  while(satelliteGroup.children.length > 0) {
    satelliteGroup.remove(satelliteGroup.children[0]);
  }

  const vertices = parsedFoldData.vertices_coords || [];
  const stowedVertices = parsedFoldData.vertices_coords_stowed || vertices;
  const faces = parsedFoldData.faces_vertices || [];

  const geometry = new THREE.BufferGeometry();
  const flatVertices = [];
  const indices = [];

  // Linearly interpolate between stowed and deployed state vertices based on scrubber deployment ratio
  for (let idx = 0; idx < vertices.length; idx++) {
    const v_dep = vertices[idx];
    const v_stow = stowedVertices[idx] || v_dep;

    const x = v_stow[0] + currentDeployVal * (v_dep[0] - v_stow[0]);
    const y = v_stow[1] + currentDeployVal * (v_dep[1] - v_stow[1]);
    const z = v_stow[2] + currentDeployVal * (v_dep[2] - v_stow[2]);

    flatVertices.push(x, y, z);
  }

  // Segment quads and polygons into triangles
  faces.forEach(face => {
    if (face.length === 3) {
      indices.push(face[0], face[1], face[2]);
    } else if (face.length === 4) {
      indices.push(face[0], face[1], face[2]);
      indices.push(face[0], face[2], face[3]);
    } else if (face.length === 6) {
      indices.push(face[0], face[1], face[2]);
      indices.push(face[0], face[2], face[3]);
      indices.push(face[0], face[3], face[4]);
      indices.push(face[0], face[4], face[5]);
    }
  });

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(flatVertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // Apply PBR Mirror/Kapton Materials
  let panelMaterial;
  const isJWST = (parsedFoldData.pattern_name || "").toLowerCase().includes("webb") || (parsedFoldData.pattern_name || "").toLowerCase().includes("jwst");
  
  if (isJWST) {
    panelMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.65,
      roughness: 0.18,
      emissive: 0xffd700,
      emissiveIntensity: 0.18,
      side: THREE.DoubleSide
    });
  } else {
    panelMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.55,
      roughness: 0.22,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.15,
      side: THREE.DoubleSide
    });
  }

  origamiMeshObj = new THREE.Mesh(geometry, panelMaterial);
  origamiMeshObj.castShadow = true;
  origamiMeshObj.receiveShadow = true;
  satelliteGroup.add(origamiMeshObj);

  // Add payload/chassis box
  const chassisGeom = new THREE.BoxGeometry(0.6, 0.6, 1.2);
  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.6,
    roughness: 0.3
  });
  const chassis = new THREE.Mesh(chassisGeom, chassisMat);
  chassis.position.set(0, 0, -0.6);
  satelliteGroup.add(chassis);

  // Adjust zoom automatically
  const boundingSphere = new THREE.Box3().setFromObject(satelliteGroup).getBoundingSphere(new THREE.Sphere());
  camera.position.z = Math.max(8, boundingSphere.radius * 2.8);
}

function updateTelemetryHUD() {
  if (!parsedFoldData) return;

  const deployPercent = (currentDeployVal * 100).toFixed(1);
  document.getElementById('hud-percent').innerText = `${deployPercent}%`;

  // Volumetric stowing estimation
  const stowedVol = (10.0 - 9.2 * currentDeployVal).toFixed(2);
  document.getElementById('val-volume').innerText = `${stowedVol} m³`;

  // Active surface area calculation
  const totalFaces = parsedFoldData.faces_vertices ? parsedFoldData.faces_vertices.length : 12;
  const activeArea = (totalFaces * 1.5 * currentDeployVal).toFixed(1);
  document.getElementById('val-area').innerText = `${activeArea} m²`;

  // Power output calculations
  const isMirror = (parsedFoldData.pattern_name || "").toLowerCase().includes("webb") || (parsedFoldData.pattern_name || "").toLowerCase().includes("jwst");
  const watts = Math.floor(totalFaces * 200 * currentDeployVal);
  document.getElementById('val-power').innerText = isMirror ? "N/A (Mirror)" : `${watts} W`;

  // Orbital velocity calculation
  const G = 6.674e-11;
  const M = 5.972e24;
  const r = (6371 + currentAltitude) * 1000;
  const velocity = Math.sqrt(G * M / r) / 1000;
  document.getElementById('val-velocity').innerText = `${velocity.toFixed(3)} km/s`;
}

// AI Compiler Engine
async function compileSpacePrompt() {
  const promptInput = document.getElementById('prompt-input');
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  const loader = document.getElementById('prompt-loader');
  loader.style.display = 'flex';

  const apiKey = document.getElementById('api-key').value.trim();
  if (apiKey) {
    localStorage.setItem('space_api_key', apiKey);
  }

  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an aerospace AI structural compiler. Translate the user's space deployment request into a valid JSON string representing the standard FOLD file format specification.
Your output must be *only* the JSON string itself, nothing else. Do not use markdown backticks \`\`\`.

Important FOLD attributes to generate:
- "file_spec": 1.1
- "pattern_name": "Name of geometry"
- "vertices_coords": Array of 3D array coordinates in deployed state [x, y, z] (e.g. [[-1, -1, 0], [1, -1, 0], ...])
- "vertices_coords_stowed": Array of 3D array coordinates in compact stowed state (usually collapsed closer to the central axis, with taller Z heights)
- "faces_vertices": Indice arrays mapping vertex connections (e.g. [[0, 1, 2, 3], ...])

Make it simple, keep total vertices under 35. Make sure the stowed state is folded tight.

Prompt: ${prompt}`
            }]
          }]
        })
      });

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedText) {
        animateFOLDTypewriter(generatedText.trim());
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
  let presetName = "miura";

  if (normPrompt.includes('webb') || normPrompt.includes('mirror') || normPrompt.includes('jwst')) {
    presetName = "jwst";
    currentAltitude = 1500000;
  } else if (normPrompt.includes('flasher') || normPrompt.includes('circular') || normPrompt.includes('sail')) {
    presetName = "flasher";
    currentAltitude = 800;
  } else {
    presetName = "miura";
    currentAltitude = 400;
  }

  let jsonCode = "";
  if (presetName === 'flasher') {
    jsonCode = simulator.getFlasherFoldJSON(8, 3);
  } else if (presetName === 'jwst') {
    jsonCode = simulator.getJWSTFoldJSON();
  } else {
    jsonCode = simulator.getMiuraFoldJSON(5, 6);
  }

  // Highlight selection dropdown
  const select = document.getElementById('preset-select');
  if (select) select.value = presetName;

  animateFOLDTypewriter(jsonCode);
}

function animateFOLDTypewriter(jsonText) {
  const editor = document.getElementById('editor');
  editor.value = '';
  let index = 0;

  function typeChar() {
    if (index < jsonText.length) {
      // Type 15 characters at a time to load fast and not freeze the UI thread
      const chunk = jsonText.substring(index, index + 15);
      editor.value += chunk;
      index += chunk.length;
      editor.scrollTop = editor.scrollHeight;
      
      // Update line numbers throttled
      if (index % 150 === 0 || index >= jsonText.length) {
        updateLineNumbers();
      }
      setTimeout(typeChar, 2);
    } else {
      updateLineNumbers(); // Final catch
      compileFOLDInput();
      triggerLaunchGlider();
    }
  }

  typeChar();
}

function triggerLaunchGlider() {
  // Reset scrubber timeline
  targetDeployVal = 0.05;
  currentDeployVal = 0.05;
  document.getElementById('scrubber').value = 0.05;

  setTimeout(() => {
    // Unfold automatically in 3.5 seconds
    let startTime = null;
    function unfoldTimeline(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / 3500;

      if (progress < 1.0) {
        const val = 0.05 + progress * 0.95;
        targetDeployVal = val;
        document.getElementById('scrubber').value = val;
        requestAnimationFrame(unfoldTimeline);
      } else {
        targetDeployVal = 1.0;
        document.getElementById('scrubber').value = 1.0;
      }
    }
    requestAnimationFrame(unfoldTimeline);
  }, 1000);
}

function selectPresetPrompt(promptText) {
  const promptInput = document.getElementById('prompt-input');
  promptInput.value = promptText;
  compileSpacePrompt();
}
