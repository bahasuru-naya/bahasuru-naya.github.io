import * as THREE from 'three';
    // Removed: import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
    // Removed: import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
    // Removed: import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

    const container = document.getElementById('hero-canvas-container');
    if (container) {
      let scene, camera, renderer; // Removed 'composer'
      let particleLayers = [];
      let time = 0;
      const mouse = new THREE.Vector3(0, 0, 0);
      const targetMouse = new THREE.Vector3(0, 0, 0);
      const mouseRadius = 40;
      let ripples = [];

      const layersConfig = [
        {
          count: 18000,
          size: 0.6,
          colorRange: { hue: [0.72, 0.82], sat: [0.8, 1], light: [0.55, 0.8] },
          rotationSpeed: 0.0008
        },
        {
          count: 22000,
          size: 0.45,
          colorRange: { hue: [0.48, 0.58], sat: [0.7, 1], light: [0.5, 0.75] },
          rotationSpeed: 0.0004
        }
      ];

      function createParticleSystem(config) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(config.count * 3);
        const colors = new Float32Array(config.count * 3);
        const basePositions = new Float32Array(config.count * 3);
        const baseColors = new Float32Array(config.count * 3);

        for (let i = 0; i < config.count; i++) {
          const i3 = i * 3;
          const radius = 25 + Math.random() * 30;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const x = radius * Math.sin(phi) * Math.cos(theta);
          const y = radius * Math.sin(phi) * Math.sin(theta);
          const z = radius * Math.cos(phi);

          positions[i3] = x;
          positions[i3 + 1] = y;
          positions[i3 + 2] = z;
          basePositions[i3] = x;
          basePositions[i3 + 1] = y;
          basePositions[i3 + 2] = z;

          const dist = Math.sqrt(x * x + y * y + z * z) / 55;
          const hue = THREE.MathUtils.lerp(config.colorRange.hue[0], config.colorRange.hue[1], dist);
          const sat = THREE.MathUtils.lerp(config.colorRange.sat[0], config.colorRange.sat[1], dist);
          const light = THREE.MathUtils.lerp(config.colorRange.light[0], config.colorRange.light[1], dist);
          const color = new THREE.Color().setHSL(hue, sat, light);
          colors[i3] = color.r;
          colors[i3 + 1] = color.g;
          colors[i3 + 2] = color.b;
          baseColors[i3] = color.r;
          baseColors[i3 + 1] = color.g;
          baseColors[i3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
          size: config.size,
          vertexColors: true,
          transparent: true,
          opacity: 1.0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          sizeAttenuation: true
        });

        const points = new THREE.Points(geometry, material);
        points.userData = {
          velocities: new Float32Array(config.count * 3),
          basePositions,
          baseColors,
          colorVelocities: new Float32Array(config.count * 3),
          rotationSpeed: config.rotationSpeed
        };
        return points;
      }

      function createRipple(x, y) {
        ripples.push({
          x, y,
          radius: 0,
          strength: 2.5,
          maxRadius: mouseRadius * 4,
          speed: 4,
          color: new THREE.Color(0xffffff)
        });
      }

      function init() {
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x020108, 0.008);

        const w = container.offsetWidth;
        const h = container.offsetHeight;

        camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
        camera.position.z = 100;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w, h);
        renderer.setClearColor(0x000000, 0);

        // Add CSS filter directly to the canvas for a bloom-like glow effect
        renderer.domElement.style.filter = "drop-shadow(0 0 10px rgba(120, 80, 255, 0.4)) drop-shadow(0 0 25px rgba(80, 220, 255, 0.3))";

        container.appendChild(renderer.domElement);

        // Removed: const renderScene = new RenderPass(scene, camera);
        // Removed: const bloomPass = new UnrealBloomPass(
        // Removed:   new THREE.Vector2(w, h), 1.5, 0.4, 0.85
        // Removed: );
        // Removed: bloomPass.threshold = 0;
        // Removed: bloomPass.strength = 1.2;
        // Removed: bloomPass.radius = 0.5;

        // Removed: composer = new EffectComposer(renderer);
        // Removed: composer.addPass(renderScene);
        // Removed: composer.addPass(bloomPass);

        layersConfig.forEach(config => {
          const particles = createParticleSystem(config);
          particleLayers.push(particles);
          scene.add(particles);
        });

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('click', onClick);
        window.addEventListener('resize', onWindowResize);
      }

      function updateParticles() {
        mouse.lerp(targetMouse, 0.05);
        ripples = ripples.filter(r => {
          r.radius += r.speed;
          r.strength *= 0.96;
          return r.radius < r.maxRadius;
        });

        particleLayers.forEach(layer => {
          const positions = layer.geometry.attributes.position.array;
          const colors = layer.geometry.attributes.color.array;
          const { velocities, basePositions, baseColors, colorVelocities } = layer.userData;
          const total = positions.length / 3;

          for (let i = 0; i < total; i++) {
            const i3 = i * 3;
            const px = positions[i3], py = positions[i3 + 1], pz = positions[i3 + 2];
            let fx = 0, fy = 0, fz = 0;
            let cx = 0, cy = 0, cz = 0;

            const dx = px - mouse.x, dy = py - mouse.y, dz = pz - mouse.z;
            const mouseDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (mouseDist < mouseRadius) {
              const f = (1 - mouseDist / mouseRadius) * 0.1;
              const invD = 1 / (mouseDist || 1);
              fx += dx * invD * f;
              fy += dy * invD * f;
              fz += dz * invD * f;
              const ci = (1 - mouseDist / mouseRadius) * 0.8;
              cx += ci; cy += ci; cz += ci;
            }

            for (let r = 0; r < ripples.length; r++) {
              const rp = ripples[r];
              const rdx = px - rp.x, rdy = py - rp.y;
              const rippleDist = Math.sqrt(rdx * rdx + rdy * rdy);
              const rippleWidth = 15;
              if (Math.abs(rippleDist - rp.radius) < rippleWidth) {
                const falloff = 1 - Math.abs(rippleDist - rp.radius) / rippleWidth;
                const rf = rp.strength * falloff * 0.1;
                const invRD = 1 / (Math.sqrt(rdx * rdx + rdy * rdy + dz * dz) || 1);
                fx += rdx * invRD * rf;
                fy += rdy * invRD * rf;
                fz += dz * invRD * rf;
                cx += rp.color.r * falloff * rp.strength;
                cy += rp.color.g * falloff * rp.strength;
                cz += rp.color.b * falloff * rp.strength;
              }
            }

            velocities[i3] += fx; velocities[i3 + 1] += fy; velocities[i3 + 2] += fz;
            const ret = 0.02;
            velocities[i3] += (basePositions[i3] - px) * ret;
            velocities[i3 + 1] += (basePositions[i3 + 1] - py) * ret;
            velocities[i3 + 2] += (basePositions[i3 + 2] - pz) * ret;
            const damp = 0.94;
            velocities[i3] *= damp; velocities[i3 + 1] *= damp; velocities[i3 + 2] *= damp;
            positions[i3] += velocities[i3];
            positions[i3 + 1] += velocities[i3 + 1];
            positions[i3 + 2] += velocities[i3 + 2];

            colorVelocities[i3] += cx; colorVelocities[i3 + 1] += cy; colorVelocities[i3 + 2] += cz;
            const cret = 0.05;
            colorVelocities[i3] += (baseColors[i3] - colors[i3]) * cret;
            colorVelocities[i3 + 1] += (baseColors[i3 + 1] - colors[i3 + 1]) * cret;
            colorVelocities[i3 + 2] += (baseColors[i3 + 2] - colors[i3 + 2]) * cret;
            const cdamp = 0.9;
            colorVelocities[i3] *= cdamp; colorVelocities[i3 + 1] *= cdamp; colorVelocities[i3 + 2] *= cdamp;
            colors[i3] += colorVelocities[i3];
            colors[i3 + 1] += colorVelocities[i3 + 1];
            colors[i3 + 2] += colorVelocities[i3 + 2];
          }
          layer.geometry.attributes.position.needsUpdate = true;
          layer.geometry.attributes.color.needsUpdate = true;
        });
      }

      function animate() {
        requestAnimationFrame(animate);
        time += 0.01;
        updateParticles();
        particleLayers.forEach(layer => {
          layer.rotation.y += layer.userData.rotationSpeed;
          layer.rotation.x = Math.sin(time * 0.1) * 0.05;
        });
        camera.position.x = Math.sin(time * 0.2) * 2;
        camera.position.y = Math.cos(time * 0.3) * 2;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
      }

      function onMouseMove(event) {
        const rect = container.getBoundingClientRect();
        const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        const vector = new THREE.Vector3(nx, ny, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        targetMouse.copy(camera.position.clone().add(dir.multiplyScalar(distance)));
      }

      function onClick(event) {
        const rect = container.getBoundingClientRect();
        const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        const vector = new THREE.Vector3(nx, ny, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));
        createRipple(pos.x, pos.y);
      }

      function onWindowResize() {
        const w = container.offsetWidth;
        const h = container.offsetHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }

      init();
      animate();
    }