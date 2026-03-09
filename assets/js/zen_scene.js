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
    scene.fog = new THREE.FogExp2(darkMode ? 0x111a26 : 0xdfefff, darkMode ? 0.022 : 0.027);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(7.8, 3.55, 7.1);

    const ambientLight = new THREE.HemisphereLight(
        darkMode ? 0xa7c4ff : 0xf4f8ff,
        darkMode ? 0x142032 : 0x799c66,
        darkMode ? 1.08 : 1.2
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(darkMode ? 0x90baff : 0xfffcf5, darkMode ? 1.3 : 1.24);
    sunLight.position.set(7, 10, 5.5);
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

    const path = new THREE.Mesh(
        new THREE.RingGeometry(0.66, 1.95, 72, 1, Math.PI * 0.18, Math.PI * 1.2),
        new THREE.MeshStandardMaterial({
            color: darkMode ? 0x6a5d4b : 0xcdb694,
            roughness: 1
        })
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(-0.16, -0.16, 0.42);
    path.receiveShadow = true;
    scene.add(path);

    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x704d34 : 0x8b5c36,
        roughness: 0.98
    });

    const branchMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x765236 : 0x916345,
        roughness: 0.98
    });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.38, 2.95, 20), trunkMaterial);
    trunk.position.set(0, 0.05, 0);
    trunk.rotation.z = 0.08;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const trunkTop = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.18, 0.9, 14), branchMaterial);
    trunkTop.position.set(0.12, 1.55, 0.02);
    trunkTop.rotation.z = -0.18;
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

    addBranch(1.55, 0.05, 0.12, new THREE.Vector3(-0.34, 1.02, 0.06), new THREE.Euler(0.45, 0.24, -0.9));
    addBranch(1.45, 0.05, 0.11, new THREE.Vector3(0.5, 1.16, -0.06), new THREE.Euler(-0.36, -0.34, 1.02));
    addBranch(1.08, 0.04, 0.08, new THREE.Vector3(0.06, 1.62, 0.22), new THREE.Euler(0.15, 0.42, 0.2));
    addBranch(0.88, 0.03, 0.06, new THREE.Vector3(-0.12, 1.5, -0.18), new THREE.Euler(-0.14, 0.68, -0.18));

    const canopyPalette = darkMode
        ? [0x3f6d47, 0x4f8357, 0x659d69, 0x83bb89, 0xa1d1a6]
        : [0x4f8b53, 0x62a860, 0x76bc74, 0x91cf8f, 0xb2e0ad];

    const canopyGroup = new THREE.Group();
    treeGroup.add(canopyGroup);

    function createLeafCluster(radius, detail, color, position, scale, rotation) {
        const material = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.88,
            emissive: darkMode ? 0x0c140d : 0x000000,
            emissiveIntensity: darkMode ? 0.18 : 0,
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
        createLeafCluster(1.05, 2, canopyPalette[1], new THREE.Vector3(-0.62, 2.08, 0.18), new THREE.Vector3(1.15, 1.28, 1.08), new THREE.Euler(0.14, 0.12, -0.08)),
        createLeafCluster(1.14, 2, canopyPalette[2], new THREE.Vector3(0.08, 2.34, 0.04), new THREE.Vector3(1.45, 1.52, 1.38), new THREE.Euler(0.08, -0.18, 0.04)),
        createLeafCluster(0.98, 2, canopyPalette[3], new THREE.Vector3(0.72, 2.06, -0.06), new THREE.Vector3(1.18, 1.22, 1.08), new THREE.Euler(-0.08, 0.26, 0.05)),
        createLeafCluster(0.88, 2, canopyPalette[0], new THREE.Vector3(-0.18, 2.78, -0.08), new THREE.Vector3(1.15, 0.92, 1.02), new THREE.Euler(0.16, 0.28, 0.1)),
        createLeafCluster(0.82, 1, canopyPalette[4], new THREE.Vector3(-1.02, 1.92, 0.02), new THREE.Vector3(0.96, 0.88, 0.86), new THREE.Euler(0.06, -0.22, -0.12)),
        createLeafCluster(0.76, 1, canopyPalette[4], new THREE.Vector3(1.06, 1.82, -0.18), new THREE.Vector3(0.94, 0.86, 0.9), new THREE.Euler(0.1, 0.18, 0.08)),
        createLeafCluster(0.66, 1, canopyPalette[2], new THREE.Vector3(0.44, 2.88, 0.26), new THREE.Vector3(0.82, 0.74, 0.78), new THREE.Euler(-0.14, 0.12, 0.06)),
        createLeafCluster(0.58, 1, canopyPalette[1], new THREE.Vector3(-0.58, 2.66, 0.26), new THREE.Vector3(0.78, 0.7, 0.74), new THREE.Euler(0.12, -0.16, -0.08))
    ];

    const flowerColors = darkMode ? [0xbfd0ff, 0xded6ff, 0x9ad6ff, 0xd8e6ff] : [0xffd3df, 0xe2d6ff, 0xfff0a8, 0xd9efff];
    const flowerGroup = new THREE.Group();
    scene.add(flowerGroup);
    for (let i = 0; i < 32; i++) {
        const petal = new THREE.Mesh(
            new THREE.SphereGeometry(0.032 + Math.random() * 0.02, 8, 8),
            new THREE.MeshStandardMaterial({
                color: flowerColors[i % flowerColors.length],
                emissive: darkMode ? 0x101628 : 0x000000,
                roughness: 0.9
            })
        );
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.3 + Math.random() * 1.75;
        petal.position.set(Math.cos(angle) * radius, -0.17 + Math.random() * 0.1, Math.sin(angle) * radius);
        flowerGroup.add(petal);
    }

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
        for (let i = 0; i < 78; i++) {
            const star = new THREE.Mesh(
                new THREE.SphereGeometry(0.014 + Math.random() * 0.014, 8, 8),
                new THREE.MeshBasicMaterial({ color: i % 5 === 0 ? 0xe7efff : 0xcfe0ff, transparent: true, opacity: 0.82 })
            );
            const theta = Math.random() * Math.PI * 2;
            const radius = 7.5 + Math.random() * 11;
            star.position.set(Math.cos(theta) * radius, 4.1 + Math.random() * 4.2, Math.sin(theta) * radius);
            star.userData.phase = Math.random() * Math.PI * 2;
            star.userData.speed = 0.8 + Math.random() * 0.8;
            scene.add(star);
            stars.push(star);
        }
    }

    const orbitRadius = 8.6;
    const cameraTarget = new THREE.Vector3(0, 1.35, 0);
    const clock = new THREE.Clock();

    function animate() {
        const t = clock.getElapsedTime();
        const angle = t * 0.1;

        camera.position.x = Math.cos(angle) * orbitRadius;
        camera.position.z = Math.sin(angle) * orbitRadius;
        camera.position.y = 3.2 + Math.sin(t * 0.22) * 0.12;
        camera.lookAt(cameraTarget);

        const sway = Math.sin(t * 0.7) * 0.03;
        treeGroup.rotation.z = sway * 0.22;
        treeGroup.rotation.x = Math.cos(t * 0.34) * 0.01;
        canopyGroup.rotation.y += 0.0009;

        canopyBlobs.forEach((blob, index) => {
            blob.rotation.y += 0.00055 + index * 0.00004;
            blob.rotation.z = sway * (0.42 + index * 0.04);
            blob.rotation.x = Math.cos(t * 0.38 + index) * 0.015;
            blob.position.y += Math.sin(t * 0.9 + index * 0.7) * 0.0006;
        });

        flowerGroup.children.forEach((flower, index) => {
            flower.position.y += Math.sin(t * 1.5 + index * 0.8) * 0.0003;
        });

        stars.forEach((star, index) => {
            star.material.opacity = 0.38 + (Math.sin(t * star.userData.speed + star.userData.phase + index * 0.04) + 1) * 0.22;
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
