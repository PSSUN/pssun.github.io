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
    scene.fog = new THREE.FogExp2(darkMode ? 0x111a26 : 0xdfefff, darkMode ? 0.024 : 0.028);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(7.6, 3.4, 6.8);

    const ambientLight = new THREE.HemisphereLight(
        darkMode ? 0x9db8ff : 0xf1f7ff,
        darkMode ? 0x142032 : 0x7ea16a,
        darkMode ? 1.05 : 1.18
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(darkMode ? 0x8db8ff : 0xfffcf2, darkMode ? 1.25 : 1.2);
    sunLight.position.set(7, 9, 5);
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

    const hill = new THREE.Mesh(new THREE.SphereGeometry(4.9, 72, 72), groundMaterial);
    hill.scale.set(1.45, 0.5, 1.45);
    hill.position.y = -2.55;
    hill.receiveShadow = true;
    scene.add(hill);

    const hillDetail = new THREE.Mesh(
        new THREE.SphereGeometry(3.1, 52, 52),
        new THREE.MeshStandardMaterial({
            color: darkMode ? 0x29452f : 0x7cab63,
            roughness: 1
        })
    );
    hillDetail.scale.set(1.18, 0.38, 1.05);
    hillDetail.position.set(1.1, -1.86, -0.5);
    hillDetail.receiveShadow = true;
    scene.add(hillDetail);

    const path = new THREE.Mesh(
        new THREE.RingGeometry(0.6, 1.9, 72, 1, Math.PI * 0.22, Math.PI * 1.15),
        new THREE.MeshStandardMaterial({
            color: darkMode ? 0x6c5f4c : 0xcbb694,
            roughness: 1
        })
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(-0.18, -0.16, 0.38);
    path.receiveShadow = true;
    scene.add(path);

    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x765338 : 0x8d5d37,
        roughness: 0.98
    });

    const branchMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x7b5b3e : 0x916446,
        roughness: 0.98
    });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.34, 2.7, 20), trunkMaterial);
    trunk.position.set(0, 0.02, 0);
    trunk.rotation.z = 0.08;
    trunk.castShadow = true;
    treeGroup.add(trunk);

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

    addBranch(1.45, 0.05, 0.11, new THREE.Vector3(-0.33, 0.95, 0.06), new THREE.Euler(0.42, 0.2, -0.82));
    addBranch(1.3, 0.045, 0.1, new THREE.Vector3(0.42, 1.05, -0.1), new THREE.Euler(-0.28, -0.36, 0.96));
    addBranch(1.0, 0.04, 0.08, new THREE.Vector3(0.08, 1.42, 0.18), new THREE.Euler(0.18, 0.46, 0.18));

    const canopyPalette = darkMode
        ? [0x4a7a52, 0x5b935f, 0x6aa66d, 0x86b98b]
        : [0x5e9f63, 0x73b86e, 0x86c881, 0xa4d6a0];

    const canopyGroup = new THREE.Group();
    treeGroup.add(canopyGroup);

    function createCanopyBlob(radius, detail, color, position, scale) {
        const blob = new THREE.Mesh(
            new THREE.IcosahedronGeometry(radius, detail),
            new THREE.MeshStandardMaterial({
                color,
                roughness: 0.92,
                flatShading: false
            })
        );
        blob.position.copy(position);
        blob.scale.set(scale.x, scale.y, scale.z);
        blob.castShadow = true;
        canopyGroup.add(blob);
        return blob;
    }

    const canopyBlobs = [
        createCanopyBlob(0.92, 2, canopyPalette[1], new THREE.Vector3(-0.28, 1.9, 0.24), new THREE.Vector3(1.45, 1.12, 1.3)),
        createCanopyBlob(1.0, 2, canopyPalette[2], new THREE.Vector3(0.45, 1.98, -0.15), new THREE.Vector3(1.42, 1.18, 1.35)),
        createCanopyBlob(0.88, 2, canopyPalette[0], new THREE.Vector3(0.02, 2.38, 0.1), new THREE.Vector3(1.22, 1.0, 1.18)),
        createCanopyBlob(0.7, 1, canopyPalette[3], new THREE.Vector3(-0.95, 1.78, 0.05), new THREE.Vector3(1.0, 0.95, 0.95)),
        createCanopyBlob(0.65, 1, canopyPalette[3], new THREE.Vector3(1.0, 1.7, -0.22), new THREE.Vector3(1.0, 0.9, 0.9)),
        createCanopyBlob(0.58, 1, canopyPalette[2], new THREE.Vector3(-0.35, 2.62, -0.22), new THREE.Vector3(0.95, 0.84, 0.9)),
        createCanopyBlob(0.52, 1, canopyPalette[1], new THREE.Vector3(0.58, 2.58, 0.3), new THREE.Vector3(0.9, 0.82, 0.88))
    ];

    const flowerColors = darkMode ? [0xb8c8ff, 0xe4d7ff, 0x9ad0ff] : [0xffd0dc, 0xded2ff, 0xfff1a8];
    const flowerGroup = new THREE.Group();
    scene.add(flowerGroup);
    for (let i = 0; i < 26; i++) {
        const petal = new THREE.Mesh(
            new THREE.SphereGeometry(0.035 + Math.random() * 0.02, 8, 8),
            new THREE.MeshStandardMaterial({
                color: flowerColors[i % flowerColors.length],
                emissive: darkMode ? 0x0f1220 : 0x000000,
                roughness: 0.9
            })
        );
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.4 + Math.random() * 1.6;
        petal.position.set(Math.cos(angle) * radius, -0.17 + Math.random() * 0.09, Math.sin(angle) * radius);
        flowerGroup.add(petal);
    }

    const stoneMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x5e6672 : 0xb7bec8,
        roughness: 1
    });

    [
        { x: -1.55, y: -1.02, z: 1.15, s: 0.19 },
        { x: 1.18, y: -1.08, z: 0.82, s: 0.14 },
        { x: 0.62, y: -1.16, z: -1.28, s: 0.13 },
        { x: -0.85, y: -1.12, z: -1.38, s: 0.11 }
    ].forEach((rock) => {
        const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(rock.s, 0), stoneMaterial);
        mesh.position.set(rock.x, rock.y, rock.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
    });

    const stars = [];
    if (darkMode) {
        for (let i = 0; i < 42; i++) {
            const star = new THREE.Mesh(
                new THREE.SphereGeometry(0.018, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.82 })
            );
            const theta = Math.random() * Math.PI * 2;
            const radius = 8 + Math.random() * 10;
            star.position.set(Math.cos(theta) * radius, 4.2 + Math.random() * 3.8, Math.sin(theta) * radius);
            star.userData.phase = Math.random() * Math.PI * 2;
            scene.add(star);
            stars.push(star);
        }
    }

    const orbitRadius = 8.4;
    const cameraTarget = new THREE.Vector3(0, 1.1, 0);
    const clock = new THREE.Clock();

    function animate() {
        const t = clock.getElapsedTime();
        const angle = t * 0.1;

        camera.position.x = Math.cos(angle) * orbitRadius;
        camera.position.z = Math.sin(angle) * orbitRadius;
        camera.position.y = 3.15 + Math.sin(t * 0.22) * 0.1;
        camera.lookAt(cameraTarget);

        const sway = Math.sin(t * 0.72) * 0.032;
        treeGroup.rotation.z = sway * 0.25;
        treeGroup.rotation.x = Math.cos(t * 0.35) * 0.01;
        canopyGroup.rotation.y += 0.0012;

        canopyBlobs.forEach((blob, index) => {
            blob.rotation.y += 0.0008 + index * 0.00004;
            blob.rotation.z = sway * (0.65 + index * 0.05);
            blob.position.y += Math.sin(t * 0.95 + index * 0.7) * 0.0007;
        });

        flowerGroup.children.forEach((flower, index) => {
            flower.position.y += Math.sin(t * 1.6 + index) * 0.00035;
        });

        stars.forEach((star, index) => {
            star.material.opacity = 0.42 + (Math.sin(t * 1.15 + star.userData.phase + index * 0.15) + 1) * 0.18;
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
