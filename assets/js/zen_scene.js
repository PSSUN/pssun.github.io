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

    function getViewportSize() {
        const topOffset = Math.max(mount.getBoundingClientRect().top, 0);
        return {
            width: window.innerWidth,
            height: Math.max(window.innerHeight - topOffset, 320)
        };
    }

    let { width, height } = getViewportSize();
    const darkMode = document.documentElement.getAttribute('data-theme') === 'dark';

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else if ('outputEncoding' in renderer && THREE.sRGBEncoding) {
        renderer.outputEncoding = THREE.sRGBEncoding;
    }
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(darkMode ? 0x0a111b : 0xf2f8ff, darkMode ? 0.019 : 0.013);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 2.7, 5.2);

    const ambientLight = new THREE.HemisphereLight(
        darkMode ? 0x8fb0d9 : 0xf6fbff,
        darkMode ? 0x142233 : 0x8eb58e,
        darkMode ? 0.62 : 1.08
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(darkMode ? 0x5d7ca8 : 0xfff6db, darkMode ? 0.78 : 1.35);
    sunLight.position.set(5, 8, 3);
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

    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x433327 : 0xa88258,
        roughness: 0.95
    });

    const foliageMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x1f4632 : 0x5f9f6f,
        roughness: 0.9,
        flatShading: true
    });

    const foliageLightMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x2d6043 : 0x79bf89,
        roughness: 0.9,
        flatShading: true
    });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.25, 3.5, 12), trunkMaterial);
    trunk.position.set(0, 1.75, 0);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    function createPineLayer(radius, y, height, taper) {
        const geometry = new THREE.ConeGeometry(radius, height, 8);
        const material = Math.random() > 0.5 ? foliageMaterial : foliageLightMaterial;
        const layer = new THREE.Mesh(geometry, material);
        layer.position.set(0, y, 0);
        layer.castShadow = true;
        layer.receiveShadow = true;
        return layer;
    }

    const pineLayers = [
        { r: 1.05, y: 1.05, h: 0.58 },
        { r: 0.95, y: 1.28, h: 0.62 },
        { r: 0.84, y: 1.54, h: 0.67 },
        { r: 0.74, y: 1.82, h: 0.72 },
        { r: 0.64, y: 2.1, h: 0.76 },
        { r: 0.54, y: 2.38, h: 0.8 },
        { r: 0.45, y: 2.65, h: 0.84 },
        { r: 0.36, y: 2.9, h: 0.86 },
        { r: 0.28, y: 3.12, h: 0.82 }
    ];

    pineLayers.forEach((layer, index) => {
        const cone = createPineLayer(layer.r, layer.y, layer.h);
        treeGroup.add(cone);

        if (index < pineLayers.length - 2) {
            const offset = Math.max(0.08, layer.r * 0.1);
            const smallCone1 = createPineLayer(layer.r * 0.42, layer.y - 0.06, layer.h * 0.62);
            smallCone1.position.x = offset;
            smallCone1.rotation.z = -0.15;
            treeGroup.add(smallCone1);

            const smallCone2 = createPineLayer(layer.r * 0.42, layer.y - 0.06, layer.h * 0.62);
            smallCone2.position.x = -offset;
            smallCone2.rotation.z = 0.15;
            treeGroup.add(smallCone2);

            const smallCone3 = createPineLayer(layer.r * 0.32, layer.y - 0.1, layer.h * 0.55);
            smallCone3.position.z = offset;
            smallCone3.rotation.x = 0.15;
            treeGroup.add(smallCone3);

            const smallCone4 = createPineLayer(layer.r * 0.32, layer.y - 0.1, layer.h * 0.55);
            smallCone4.position.z = -offset;
            smallCone4.rotation.x = -0.15;
            treeGroup.add(smallCone4);
        }
    });

    const topCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.42, 8),
        foliageLightMaterial
    );
    topCone.position.set(0, 3.42, 0);
    topCone.castShadow = true;
    treeGroup.add(topCone);

    const groundGroup = new THREE.Group();
    scene.add(groundGroup);

    const groundMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x182a1d : 0x89be72,
        roughness: 1
    });

    const ground = new THREE.Mesh(
        new THREE.CylinderGeometry(20, 20, 0.5, 32),
        groundMaterial
    );
    ground.position.set(0, -0.25, 0);
    ground.receiveShadow = true;
    groundGroup.add(ground);

    const stoneMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x4a5560 : 0xaeb8c2,
        roughness: 0.9
    });

    [
        { x: 2.5, z: 1.5, s: 0.25 },
        { x: -2.2, z: 1.8, s: 0.2 },
        { x: 1.8, z: -2.0, s: 0.18 },
        { x: -1.5, z: -2.2, s: 0.15 },
        { x: 3.2, z: -0.8, s: 0.12 }
    ].forEach((rock) => {
        const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(rock.s, 0), stoneMaterial);
        mesh.position.set(rock.x, rock.s * 0.4, rock.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5);
        groundGroup.add(mesh);
    });

    const grassMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x205236 : 0x5ea55f,
        roughness: 0.95,
        flatShading: true
    });
    const grassLightMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x2c6844 : 0x79c277,
        roughness: 0.95,
        flatShading: true
    });

    const grassCount = darkMode ? 60 : 85;
    for (let i = 0; i < grassCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const radius = 1.35 + Math.random() * 4.9;
        const x = Math.cos(theta) * radius + (Math.random() - 0.5) * 0.22;
        const z = Math.sin(theta) * radius + (Math.random() - 0.5) * 0.22;
        const bladeHeight = 0.09 + Math.random() * 0.13;
        const bladeRadius = 0.018 + Math.random() * 0.018;
        const blade = new THREE.Mesh(
            new THREE.ConeGeometry(bladeRadius, bladeHeight, 5),
            Math.random() > 0.5 ? grassMaterial : grassLightMaterial
        );
        blade.position.set(x, bladeHeight * 0.45 - 0.02, z);
        blade.rotation.y = Math.random() * Math.PI;
        blade.castShadow = false;
        blade.receiveShadow = true;
        groundGroup.add(blade);
    }

    const stars = [];
    if (darkMode) {
        for (let i = 0; i < 50; i++) {
            const star = new THREE.Mesh(
                new THREE.SphereGeometry(0.01 + Math.random() * 0.01, 6, 6),
                new THREE.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.7 })
            );
            const theta = Math.random() * Math.PI * 2;
            const radius = 8 + Math.random() * 8;
            star.position.set(Math.cos(theta) * radius, 5 + Math.random() * 4, Math.sin(theta) * radius);
            star.userData.phase = Math.random() * Math.PI * 2;
            star.userData.speed = 0.5 + Math.random() * 0.5;
            scene.add(star);
            stars.push(star);
        }
    }

    const clouds = [];
    if (!darkMode) {
        const cloudTopMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 1,
            transparent: true,
            opacity: 0.84
        });
        const cloudBaseMaterial = new THREE.MeshStandardMaterial({
            color: 0xdfe7f2,
            roughness: 1,
            transparent: true,
            opacity: 0.76
        });
        const puffGeometry = new THREE.SphereGeometry(1, 12, 12);

        for (let i = 0; i < 7; i++) {
            const cloud = new THREE.Group();
            const puffCount = 9 + Math.floor(Math.random() * 6);
            const spreadX = 0.9 + Math.random() * 0.9;
            const spreadZ = 0.35 + Math.random() * 0.45;
            const capLift = 0.1 + Math.random() * 0.08;

            for (let j = 0; j < puffCount; j++) {
                const angle = Math.random() * Math.PI * 2;
                const ring = 0.2 + Math.pow(Math.random(), 0.75) * 0.85;
                const x = Math.cos(angle) * ring * spreadX;
                const z = Math.sin(angle) * ring * spreadZ;
                const edge = Math.max(0, 1 - Math.sqrt((x * x) / (spreadX * spreadX) + (z * z) / (spreadZ * spreadZ)));
                const y = (Math.random() - 0.55) * 0.14 + edge * capLift;
                const size = 0.16 + Math.random() * 0.2 + edge * 0.11;

                const puffMesh = new THREE.Mesh(puffGeometry, y > 0.03 ? cloudTopMaterial : cloudBaseMaterial);
                puffMesh.position.set(x, y, z);
                puffMesh.scale.set(
                    size * (0.95 + Math.random() * 0.24),
                    size * (0.62 + Math.random() * 0.24),
                    size * (0.9 + Math.random() * 0.22)
                );
                puffMesh.castShadow = false;
                puffMesh.receiveShadow = false;
                cloud.add(puffMesh);
            }

            const theta = Math.random() * Math.PI * 2;
            const radiusX = 6.2 + Math.random() * 5.2;
            const radiusZ = 2.4 + Math.random() * 2.6;
            const baseX = Math.cos(theta) * radiusX;
            const baseZ = Math.sin(theta) * radiusZ;
            const baseY = 4.45 + Math.random() * 1.25;

            cloud.position.set(baseX, baseY, baseZ);
            cloud.rotation.y = Math.random() * Math.PI;
            cloud.scale.setScalar(0.9 + Math.random() * 0.45);
            cloud.userData.baseX = baseX;
            cloud.userData.baseY = baseY;
            cloud.userData.baseZ = baseZ;
            cloud.userData.phase = Math.random() * Math.PI * 2;
            cloud.userData.speed = 0.035 + Math.random() * 0.045;
            cloud.userData.driftX = 0.28 + Math.random() * 0.34;
            cloud.userData.driftZ = 0.1 + Math.random() * 0.16;
            cloud.userData.driftY = 0.012 + Math.random() * 0.018;

            scene.add(cloud);
            clouds.push(cloud);
        }
    }

    const orbitRadius = 4.4;
    const cameraTarget = new THREE.Vector3(0, 1.98, 0);
    const clock = new THREE.Clock();

    function animate() {
        const t = clock.getElapsedTime();
        const angle = t * 0.08;

        camera.position.x = Math.cos(angle) * orbitRadius;
        camera.position.z = Math.sin(angle) * orbitRadius;
        camera.position.y = 2.55 + Math.sin(t * 0.15) * 0.08;
        camera.lookAt(cameraTarget);

        const sway = Math.sin(t * 0.4) * 0.015;
        treeGroup.rotation.z = sway;
        treeGroup.rotation.x = Math.cos(t * 0.25) * 0.008;

        pineLayers.forEach((layer, index) => {
            const layerSway = Math.sin(t * 0.5 + index * 0.3) * 0.01 * (1 - index * 0.08);
            treeGroup.children.forEach((child, childIndex) => {
                if (childIndex > 1 && child.geometry && child.geometry.type === 'ConeGeometry') {
                    const childY = child.position.y;
                    if (Math.abs(childY - layer.y) < 0.1) {
                        child.rotation.z = layerSway;
                    }
                }
            });
        });

        stars.forEach((star, index) => {
            star.material.opacity = 0.3 + (Math.sin(t * star.userData.speed + star.userData.phase) + 1) * 0.2;
        });

        clouds.forEach((cloud) => {
            const driftX = Math.sin(t * cloud.userData.speed + cloud.userData.phase) * cloud.userData.driftX;
            const driftZ = Math.cos(t * cloud.userData.speed * 0.7 + cloud.userData.phase) * cloud.userData.driftZ;
            const driftY = Math.sin(t * cloud.userData.speed * 0.45 + cloud.userData.phase) * cloud.userData.driftY;
            cloud.position.x = cloud.userData.baseX + driftX;
            cloud.position.z = cloud.userData.baseZ + driftZ;
            cloud.position.y = cloud.userData.baseY + driftY;
        });

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    function handleResize() {
        const nextSize = getViewportSize();
        const nextWidth = nextSize.width;
        const nextHeight = nextSize.height;
        camera.aspect = nextWidth / nextHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(nextWidth, nextHeight);
    }

    window.addEventListener('resize', handleResize);
    animate();
})();
