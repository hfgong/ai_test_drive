/**
 * Aerospace Rigid Origami Mathematical Model & Simulator
 * Compiles structural fold grids into standard FOLD JSON file representations.
 * Employs a custom compact stringifier to ensure coordinate arrays are kept on
 * single lines to optimize memory footprint and browser DOM performance.
 */

class OrigamiSimulator {
  constructor() {}

  /**
   * Custom compact stringification for FOLD format to keep arrays compact
   * and avoid browser freezes during typewriter and rendering cycles.
   */
  formatFOLDJSON(foldObj) {
    const vertices = foldObj.vertices_coords.map(v => `    [${v[0]}, ${v[1]}, ${v[2]}]`).join(",\n");
    const stowed = foldObj.vertices_coords_stowed.map(v => `    [${v[0]}, ${v[1]}, ${v[2]}]`).join(",\n");
    const faces = foldObj.faces_vertices.map(f => `    [${f.join(", ")}]`).join(",\n");
    
    return `{
  "file_spec": ${foldObj.file_spec},
  "file_creator": "${foldObj.file_creator}",
  "pattern_name": "${foldObj.pattern_name}",
  "vertices_coords": [
${vertices}
  ],
  "vertices_coords_stowed": [
${stowed}
  ],
  "faces_vertices": [
${faces}
  ]
}`;
  }

  /**
   * Generates a FOLD JSON string for a Miura-Fold solar array.
   */
  getMiuraFoldJSON(rows = 5, cols = 6) {
    const deployedCoords = [];
    const stowedCoords = [];
    const faces = [];

    const a = 1.0;
    const b = 0.8;
    const alpha = (60 * Math.PI) / 180;
    const scale = 1.3;

    const cos_alpha = Math.cos(alpha);
    const sin_alpha = Math.sin(alpha);

    // Compute coordinates for deployed state (deploy = 1.0, theta = PI/2)
    const theta_dep = Math.PI / 2;
    const k_dep = Math.sqrt(1 - sin_alpha * sin_alpha * Math.cos(theta_dep) * Math.cos(theta_dep));
    const s_dep = (sin_alpha * Math.sin(theta_dep)) / k_dep;

    // Compute coordinates for stowed state (deploy = 0.02, theta = 0.05)
    const theta_stow = 0.05;
    const k_stow = Math.sqrt(1 - sin_alpha * sin_alpha * Math.cos(theta_stow) * Math.cos(theta_stow));
    const s_stow = (sin_alpha * Math.sin(theta_stow)) / k_stow;

    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        // Deployed
        const x_dep = c * a * k_dep;
        const y_dep = r * b * s_dep + (c % 2) * a * cos_alpha * Math.cos(theta_dep);
        const z_dep = ((r + c) % 2 === 0 ? 1 : -1) * a * cos_alpha * Math.sin(theta_dep) * 0.45;

        deployedCoords.push([
          parseFloat(((x_dep - (cols * a * k_dep) / 2) * scale).toFixed(3)),
          parseFloat(((y_dep - (rows * b * s_dep) / 2) * scale).toFixed(3)),
          parseFloat((z_dep * scale).toFixed(3))
        ]);

        // Stowed
        const x_stow = c * a * k_stow;
        const y_stow = r * b * s_stow + (c % 2) * a * cos_alpha * Math.cos(theta_stow);
        const z_stow = ((r + c) % 2 === 0 ? 1 : -1) * a * cos_alpha * Math.sin(theta_stow) * 0.45;

        stowedCoords.push([
          parseFloat(((x_stow - (cols * a * k_stow) / 2) * scale).toFixed(3)),
          parseFloat(((y_stow - (rows * b * s_stow) / 2) * scale).toFixed(3)),
          parseFloat((z_stow * scale).toFixed(3))
        ]);
      }
    }

    // Build faces
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v0 = r * (cols + 1) + c;
        const v1 = r * (cols + 1) + (c + 1);
        const v2 = (r + 1) * (cols + 1) + (c + 1);
        const v3 = (r + 1) * (cols + 1) + c;
        faces.push([v0, v1, v2, v3]);
      }
    }

    const foldObj = {
      file_spec: 1.1,
      file_creator: "Space-Origami-Compiler",
      pattern_name: "Miura Fold Solar Grid",
      vertices_coords: deployedCoords,
      vertices_coords_stowed: stowedCoords,
      faces_vertices: faces
    };

    return this.formatFOLDJSON(foldObj);
  }

  /**
   * Generates a FOLD JSON string for a Radial Flasher Starburst sail.
   */
  getFlasherFoldJSON(sectors = 8, rings = 3) {
    const deployedCoords = [];
    const stowedCoords = [];
    const faces = [];

    const hubRadius = 0.8;
    const ringWidth = 0.7;

    // Deployed (deploy = 1.0)
    deployedCoords.push([0, 0, 0]);
    for (let ring = 1; ring <= rings + 1; ring++) {
      const radius = hubRadius + (ring - 1) * ringWidth;
      for (let sec = 0; sec < sectors; sec++) {
        const angle = sec * (2 * Math.PI / sectors);
        deployedCoords.push([
          parseFloat((radius * Math.cos(angle)).toFixed(3)),
          parseFloat((radius * Math.sin(angle)).toFixed(3)),
          0
        ]);
      }
    }

    // Stowed (deploy = 0.02)
    stowedCoords.push([0, 0, 0]);
    const maxStowRotation = (75 * Math.PI) / 180;
    const radialContraction = 0.35 + 0.65 * 0.02;

    for (let ring = 1; ring <= rings + 1; ring++) {
      const radius = hubRadius + (ring - 1) * ringWidth;
      const currentRadius = radius * radialContraction;

      for (let sec = 0; sec < sectors; sec++) {
        const spiralAngle = sec * (2 * Math.PI / sectors) + maxStowRotation * ring;
        const heightBuckle = 1.5 * (1.0 - 0.02) * (ring / (rings + 1));
        const z = heightBuckle * (sec % 2 === 0 ? 1 : -1);

        stowedCoords.push([
          parseFloat((currentRadius * Math.cos(spiralAngle)).toFixed(3)),
          parseFloat((currentRadius * Math.sin(spiralAngle)).toFixed(3)),
          parseFloat(z.toFixed(3))
        ]);
      }
    }

    // Build faces
    // Center triangles
    for (let sec = 0; sec < sectors; sec++) {
      const v0 = 0;
      const v1 = 1 + sec;
      const v2 = 1 + ((sec + 1) % sectors);
      faces.push([v0, v1, v2]);
    }
    // Quad rings
    for (let ring = 1; ring <= rings; ring++) {
      const innerRingStart = 1 + (ring - 1) * sectors;
      const outerRingStart = 1 + ring * sectors;

      for (let sec = 0; sec < sectors; sec++) {
        const i0 = innerRingStart + sec;
        const i1 = innerRingStart + ((sec + 1) % sectors);
        const o0 = outerRingStart + sec;
        const o1 = outerRingStart + ((sec + 1) % sectors);
        faces.push([i0, i1, o1, o0]);
      }
    }

    const foldObj = {
      file_spec: 1.1,
      file_creator: "Space-Origami-Compiler",
      pattern_name: "Flasher Starburst Sail",
      vertices_coords: deployedCoords,
      vertices_coords_stowed: stowedCoords,
      faces_vertices: faces
    };

    return this.formatFOLDJSON(foldObj);
  }

  /**
   * Generates a FOLD JSON string for the James Webb hexagonal wings.
   */
  getJWSTFoldJSON() {
    const deployedCoords = [];
    const stowedCoords = [];
    const faces = [];

    const hexRadius = 0.5;
    const h = hexRadius * Math.sqrt(3);

    const segmentSpecs = [
      // Central core
      { id: 0, cx: 0, cy: h, isWing: false, side: 0 },
      { id: 1, cx: 0, cy: -h, isWing: false, side: 0 },
      { id: 2, cx: 1.5 * hexRadius, cy: h / 2, isWing: false, side: 0 },
      { id: 3, cx: -1.5 * hexRadius, cy: h / 2, isWing: false, side: 0 },
      { id: 4, cx: 1.5 * hexRadius, cy: -h / 2, isWing: false, side: 0 },
      { id: 5, cx: -1.5 * hexRadius, cy: -h / 2, isWing: false, side: 0 },
      { id: 6, cx: 0, cy: 2*h, isWing: false, side: 0 },
      { id: 7, cx: 0, cy: -2*h, isWing: false, side: 0 },
      { id: 8, cx: 1.5 * hexRadius, cy: 1.5*h, isWing: false, side: 0 },
      { id: 9, cx: -1.5 * hexRadius, cy: 1.5*h, isWing: false, side: 0 },
      { id: 10, cx: 1.5 * hexRadius, cy: -1.5*h, isWing: false, side: 0 },
      { id: 11, cx: -1.5 * hexRadius, cy: -1.5*h, isWing: false, side: 0 },

      // Left wing
      { id: 12, cx: -3.0 * hexRadius, cy: h, isWing: true, side: -1 },
      { id: 13, cx: -3.0 * hexRadius, cy: 0, isWing: true, side: -1 },
      { id: 14, cx: -3.0 * hexRadius, cy: -h, isWing: true, side: -1 },

      // Right wing
      { id: 15, cx: 3.0 * hexRadius, cy: h, isWing: true, side: 1 },
      { id: 16, cx: 3.0 * hexRadius, cy: 0, isWing: true, side: 1 },
      { id: 17, cx: 3.0 * hexRadius, cy: -h, isWing: true, side: 1 }
    ];

    let vCounter = 0;

    segmentSpecs.forEach(spec => {
      const cx = spec.cx;
      const cy = spec.cy;

      const hexVerts = [];

      for (let i = 0; i < 6; i++) {
        const angle = i * (Math.PI / 3);
        const vx = hexRadius * 0.96 * Math.cos(angle);
        const vy = hexRadius * 0.96 * Math.sin(angle);

        // Deployed state coordinates
        const x_dep = cx + vx;
        const y_dep = cy + vy;
        const z_dep = 0;
        deployedCoords.push([
          parseFloat(x_dep.toFixed(3)),
          parseFloat(y_dep.toFixed(3)),
          parseFloat(z_dep.toFixed(3))
        ]);

        // Stowed state coordinates
        let x_stow = cx + vx;
        let y_stow = cy + vy;
        let z_stow = 0;

        if (spec.isWing) {
          const hingeX = spec.side * 2.25 * hexRadius;
          const relX = x_stow - hingeX;
          const angleToApply = spec.side * Math.PI / 2; // Folded 90 degrees

          x_stow = hingeX + relX * Math.cos(angleToApply);
          z_stow = relX * Math.sin(angleToApply);
        }

        stowedCoords.push([
          parseFloat(x_stow.toFixed(3)),
          parseFloat(y_stow.toFixed(3)),
          parseFloat(z_stow.toFixed(3))
        ]);

        hexVerts.push(vCounter++);
      }

      faces.push(hexVerts);
    });

    const foldObj = {
      file_spec: 1.1,
      file_creator: "Space-Origami-Compiler",
      pattern_name: "James Webb Segmented Hex",
      vertices_coords: deployedCoords,
      vertices_coords_stowed: stowedCoords,
      faces_vertices: faces
    };

    return this.formatFOLDJSON(foldObj);
  }
}

// Export for node or browser
if (typeof module !== 'undefined') {
  module.exports = { OrigamiSimulator };
} else {
  window.OrigamiSimulator = OrigamiSimulator;
}
