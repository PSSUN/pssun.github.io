(function () {
    const mount = document.getElementById('zen-scene');
    if (!mount) return;

    if (typeof THREE === 'undefined') {
        mount.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-muted);font-size:0.95rem;">3D scene failed to load: Three.js unavailable.</div>';
        return;
    }

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (error) {
        mount.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-muted);font-size:0.95rem;">3D scene failed to initialize on this browser/device.</div>';
        return;
    }

    const width = mount.clientWidth || mount.offsetWidth || window.innerWidth;
    const height = mount.clientHeight || mount.offsetHeight || 600;
    const darkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const quoteEl = document.getElementById('zen-quote');

    const quotes = [
        'Still water does not hurry, yet it reflects the sky.',
        'Growth is often quiet enough to be mistaken for stillness.',
        'What bends with the wind learns how to remain.',
        'The tree keeps no score; it simply reaches for light.',
        'Peace is not empty — it is spacious.',
        'A gentle pace can still carry you far.',
        'Silence is sometimes the clearest answer.',
        'What is rooted deeply does not fear a passing storm.',
        'Let the mind settle, and the world becomes less sharp.',
        'You do not need to bloom loudly to be alive.',
        'Even the night is full of small lights.',
        'Rest is not the opposite of becoming; it is part of it.'
    ];

    if (quoteEl) {
        quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else if ('outputEncoding' in renderer && THREE.sRGBEncoding) {
        renderer.outputEncoding = THREE.sRGBEncoding;
    }
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(darkMode ? 0x111a26 : 0xdfefff, darkMode ? 0.018 : 0.022);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(5.8, 1.9, 5.5);

    const ambientLight = new THREE.HemisphereLight(
        darkMode ? 0xa7c4ff : 0xf4f8ff,
        darkMode ? 0x142032 : 0x799c66,
        darkMode ? 0.95 : 1.1
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(darkMode ? 0x90baff : 0xfffcf5, darkMode ? 1.2 : 1.15);
    sunLight.position.set(6, 9, 4.5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -8;
    sunLight.shadow.camera.right = 8;
    sunLight.shadow.camera.top = 8;
    sunLight.shadow.camera.bottom = -8;
    scene.add(sunLight);

    const treeGroup = new THREE.Group();
    scene.add(treeGroup);

    const groundMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x1f3322 : 0x6f9d58,
        roughness: 0.98,
        metalness: 0.02
    });

    const hill = new THREE.Mesh(new THREE.SphereGeometry(4.95, 72, 72), groundMaterial);
    hill.scale.set(1.48, 0.5, 1.48);
    hill.position.y = -2.56;
    hill.receiveShadow = true;
    scene.add(hill);

    const hillDetail = new THREE.Mesh(
        new THREE.SphereGeometry(3.2, 52, 52),
        new THREE.MeshStandardMaterial({
            color: darkMode ? 0x29452f : 0x7cab63,
            roughness: 1
        })
    );
    hillDetail.scale.set(1.2, 0.38, 1.06);
    hillDetail.position.set(1.12, -1.88, -0.55);
    hillDetail.receiveShadow = true;
    scene.add(hillDetail);

    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x704d34 : 0x8b5c36,
        roughness: 0.98
    });

    const branchMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x765236 : 0x916345,
        roughness: 0.98
    });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 3.2, 20), trunkMaterial);
    trunk.position.set(0, 0.05, 0);
    trunk.rotation.z = 0.06;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const trunkTop = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 1.0, 14), branchMaterial);
    trunkTop.position.set(0.08, 1.68, 0.02);
    trunkTop.rotation.z = -0.15;
    trunkTop.castShadow = true;
    treeGroup.add(trunkTop);

    function addBranch(length, radiusTop, radiusBottom, position, rotation) {
        const branch = new THREE.Mesh(
            new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 14),
            branchMaterial
        );
        branch.position.copy(position);
        branch.rotation.set(rotation.x, rotation.y, rotation.z);
        branch.castShadow = true;
        treeGroup.add(branch);
        return branch;
    }

    addBranch(1.65, 0.04, 0.10, new THREE.Vector3(-0.28, 1.12, 0.08), new THREE.Euler(0.42, 0.22, -0.85));
    addBranch(1.55, 0.04, 0.09, new THREE.Vector3(0.42, 1.28, -0.08), new THREE.Euler(-0.32, -0.32, 0.95));
    addBranch(1.18, 0.03, 0.07, new THREE.Vector3(0.08, 1.78, 0.18), new THREE.Euler(0.12, 0.38, 0.15));
    addBranch(0.95, 0.025, 0.05, new THREE.Vector3(-0.08, 1.65, -0.15), new THREE.Euler(-0.12, 0.62, -0.15));

    const canopyPalette = darkMode
        ? [0x3f6d47, 0x4f8357, 0x659d69, 0x83bb89, 0xa1d1a6]
        : [0x4f8b53, 0x62a860, 0x76bc74, 0x91cf8f, 0xb2e0ad];

    const canopyGroup = new THREE.Group();
    treeGroup.add(canopyGroup);

    function createLeafCluster(radius, detail, color, position, scale, rotation) {
        const material = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.92,
            emissive: darkMode ? 0x0c140d : 0x000000,
            emissiveIntensity: darkMode ? 0.15 : 0,
            flatShading: false
        });
        const geometry = new THREE.IcosahedronGeometry(radius, detail);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.scale.set(scale.x, scale.y, scale.z);
        mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        mesh.castShadow = true;
        canopyGroup.add(mesh);
        return mesh;
    }

    const canopyBlobs = [
        createLeafCluster(1.35, 2, canopyPalette[1], new THREE.Vector3(-0.45, 2.45, 0.12), new THREE.Vector3(1.25, 1.35, 1.18), new THREE.Euler(0.12, 0.10, -0.06)),
        createLeafCluster(1.42, 2, canopyPalette[2], new THREE.Vector3(0.15, 2.68, 0.08), new THREE.Vector3(1.55, 1.58, 1.45), new THREE.Euler(0.06, -0.15, 0.03)),
        createLeafCluster(1.28, 2, canopyPalette[3], new THREE.Vector3(0.82, 2.38, -0.08), new THREE.Vector3(1.28, 1.32, 1.18), new THREE.Euler(-0.06, 0.22, 0.04)),
        createLeafCluster(1.18, 2, canopyPalette[0], new THREE.Vector3(-0.12, 3.18, -0.06), new THREE.Vector3(1.25, 1.02, 1.12), new THREE.Euler(0.14, 0.24, 0.08)),
        createLeafCluster(1.05, 1, canopyPalette[4], new THREE.Vector3(-0.88, 2.28, 0.06), new THREE.Vector3(1.05, 0.95, 0.92), new THREE.Euler(0.04, -0.18, -0.10)),
        createLeafCluster(0.98, 1, canopyPalette[4], new THREE.Vector3(0.92, 2.18, -0.15), new THREE.Vector3(1.02, 0.92, 0.96), new THREE.Euler(0.08, 0.15, 0.06)),
        createLeafCluster(0.85, 1, canopyPalette[2], new THREE.Vector3(0.38, 3.28, 0.22), new THREE.Vector3(0.88, 0.80, 0.85), new THREE.Euler(-0.12, 0.10, 0.05)),
        createLeafCluster(0.75, 1, canopyPalette[1], new THREE.Vector3(-0.48, 3.05, 0.22), new THREE.Vector3(0.85, 0.75, 0.80), new THREE.Euler(0.10, -0.14, -0.06))
    ];

    const stoneMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x616b78 : 0xb7bec8,
        roughness: 1
    });

    [
        { x: -1.58, y: -1.02, z: 1.18, s: 0.2 },
        { x: 1.16, y: -1.08, z: 0.84, s: 0.15 },
        { x: 0.65, y: -1.16, z: -1.3, s: 0.13 },
        { x: -0.88, y: -1.12, z: -1.42, s: 0.12 }
    ].forEach((rock) => {
        const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(rock.s, 0), stoneMaterial);
        mesh.position.set(rock.x, rock.y, rock.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
    });

    const stars = [];
    if (darkMode) {
        for (let i = 0; i < 68; i++) {
            const star = new THREE.Mesh(
                new THREE.SphereGeometry(0.012 + Math.random() * 0.012, 8, 8),
                new THREE.MeshBasicMaterial({ color: i % 5 === 0 ? 0xe7efff : 0xcfe0ff, transparent: true, opacity: 0.78 })
            );
            const theta = Math.random() * Math.PI * 2;
            const radius = 7.5 + Math.random() * 11;
            star.position.set(Math.cos(theta) * radius, 4.1 + Math.random() * 4.2, Math.sin(theta) * radius);
            star.userData.phase = Math.random() * Math.PI * 2;
            star.userData.speed = 0.7 + Math.random() * 0.7;
            scene.add(star);
            stars.push(star);
        }
    }

    const orbitRadius = 5.8;
    const cameraTarget = new THREE.Vector3(0, 1.5, 0);
    const clock = new THREE.Clock();

    function animate() {
        const t = clock.getElapsedTime();
        const angle = t * 0.08;

        camera.position.x = Math.cos(angle) * orbitRadius;
        camera.position.z = Math.sin(angle) * orbitRadius;
        camera.position.y = 1.9 + Math.sin(t * 0.18) * 0.1;
        camera.lookAt(cameraTarget);

        const sway = Math.sin(t * 0.55) * 0.025;
        treeGroup.rotation.z = sway * 0.18;
        treeGroup.rotation.x = Math.cos(t * 0.28) * 0.008;
        canopyGroup.rotation.y += 0.0007;

        canopyBlobs.forEach((blob, index) => {
            blob.rotation.y += 0.00045 + index * 0.00003;
            blob.rotation.z = sway * (0.35 + index * 0.03);
            blob.rotation.x = Math.cos(t * 0.32 + index) * 0.012;
            blob.position.y += Math.sin(t * 0.75 + index * 0.6) * 0.0005;
        });

        stars.forEach((star, index) => {
            star.material.opacity = 0.32 + (Math.sin(t * star.userData.speed + star.userData.phase + index * 0.04) + 1) * 0.18;
        });

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    function handleResize() {
        const nextWidth = mount.clientWidth || mount.offsetWidth || window.innerWidth;
        const nextHeight = mount.clientHeight || mount.offsetHeight || 600;
        camera.aspect = nextWidth / nextHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(nextWidth, nextHeight);
    }

    window.addEventListener('resize', handleResize);
    animate();
})();
