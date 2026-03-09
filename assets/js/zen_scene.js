(function () {
    const mount = document.getElementById('zen-scene');
    if (!mount) return;

    if (typeof THREE === 'undefined') {
        mount.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-muted);font-size:0.95rem;">3D scene failed to load: Three.js unavailable.</div>';
        return;
    }

    const SCENE_CONFIG = {
        viewport: {
            minHeight: 320,
            maxPixelRatio: 2
        },
        fog: {
            dark: { color: 0x0a111b, density: 0.019 },
            light: { color: 0xf2f8ff, density: 0.013 }
        },
        camera: {
            fov: 55,
            near: 0.1,
            far: 100,
            startPosition: { x: 0, y: 2.7, z: 5.2 },
            target: { x: 0, y: 1.98, z: 0 },
            orbitRadius: 4.4,
            orbitSpeed: 0.08,
            bobBaseY: 2.55,
            bobSpeed: 0.15,
            bobAmplitude: 0.08
        },
        lights: {
            ambient: {
                dark: { sky: 0x8fb0d9, ground: 0x142233, intensity: 0.62 },
                light: { sky: 0xf6fbff, ground: 0x8eb58e, intensity: 1.08 }
            },
            sun: {
                dark: { color: 0x5d7ca8, intensity: 0.78 },
                light: { color: 0xfff6db, intensity: 1.35 },
                position: { x: 5, y: 8, z: 3 },
                shadow: {
                    width: 1024,
                    height: 1024,
                    near: 0.5,
                    far: 30,
                    left: -8,
                    right: 8,
                    top: 8,
                    bottom: -8
                }
            }
        },
        animation: {
            treeSwaySpeed: 0.4,
            treeSwayAmount: 0.015,
            treeTiltSpeed: 0.25,
            treeTiltAmount: 0.008,
            pineSwaySpeed: 0.5,
            pinePhaseStep: 0.3,
            pineSwayAmount: 0.01,
            pineDecayPerLayer: 0.08,
            cloudZDriftScale: 0.7,
            cloudYDriftScale: 0.45
        }
    };

    const TREE_CONFIG = {
        trunk: {
            topRadius: 0.03,
            bottomRadius: 0.25,
            height: 3.5,
            radialSegments: 12,
            positionY: 1.75
        },
        foliageSegments: 8,
        branchSegments: 5,
        branchCutoffLayers: 2,
        branchOffsetMin: 0.08,
        branchOffsetScale: 0.1,
        sideBranchScale: 0.42,
        sideBranchYOffset: -0.06,
        sideBranchHeightScale: 0.62,
        frontBranchScale: 0.32,
        frontBranchYOffset: -0.1,
        frontBranchHeightScale: 0.55,
        sideBranchRotation: 0.15,
        frontBranchRotation: 0.15,
        layers: [
            { r: 1.05, y: 1.05, h: 0.58 },
            { r: 0.95, y: 1.28, h: 0.62 },
            { r: 0.84, y: 1.54, h: 0.67 },
            { r: 0.74, y: 1.82, h: 0.72 },
            { r: 0.64, y: 2.1, h: 0.76 },
            { r: 0.54, y: 2.38, h: 0.8 },
            { r: 0.45, y: 2.65, h: 0.84 },
            { r: 0.36, y: 2.9, h: 0.86 },
            { r: 0.28, y: 3.12, h: 0.82 }
        ],
        topCone: {
            radius: 0.15,
            height: 0.42,
            y: 3.42
        }
    };

    const GROUND_CONFIG = {
        ground: {
            radius: 20,
            height: 0.5,
            radialSegments: 32,
            y: -0.25
        },
        rocks: [
            { x: 2.5, z: 1.5, s: 0.25 },
            { x: -2.2, z: 1.8, s: 0.2 },
            { x: 1.8, z: -2.0, s: 0.18 },
            { x: -1.5, z: -2.2, s: 0.15 },
            { x: 3.2, z: -0.8, s: 0.12 }
        ],
        grass: {
            darkCount: 60,
            lightCount: 85,
            minRadius: 1.35,
            radiusSpread: 4.9,
            jitter: 0.22,
            minHeight: 0.09,
            heightSpread: 0.13,
            minRadiusScale: 0.018,
            radiusScaleSpread: 0.018,
            positionYOffset: -0.02
        },
        mountains: [
            { x: -15, z: -25, r: 4.5, h: 3.2 },
            { x: -8, z: -28, r: 3.8, h: 2.5 },
            { x: 2, z: -30, r: 5.2, h: 4.0 },
            { x: 10, z: -26, r: 3.5, h: 2.2 },
            { x: 16, z: -24, r: 4.0, h: 2.8 },
            { x: -20, z: -20, r: 2.8, h: 1.8 },
            { x: 22, z: -22, r: 3.2, h: 2.0 }
        ],
        mountainBaseHeight: 1.5,
        mountainBaseTopScale: 0.7,
        mountainBaseBottomScale: 0.9,
        mountainPositionY: -0.5,
        mountainBaseY: -0.25,
        mountainSegments: 7
    };

    const SKY_CONFIG = {
        stars: {
            count: 50,
            minSize: 0.01,
            sizeSpread: 0.01,
            minRadius: 8,
            radiusSpread: 8,
            minY: 5,
            ySpread: 4,
            minSpeed: 0.5,
            speedSpread: 0.5,
            twinkleBaseScale: 0.85,
            twinkleAmount: 0.35,
            materialOpacity: 0.7,
            color: 0xcfe8ff
        },
        clouds: {
            count: 7,
            minPuffs: 9,
            puffSpread: 6,
            minSpreadX: 0.9,
            spreadXRange: 0.9,
            minSpreadZ: 0.35,
            spreadZRange: 0.45,
            minCapLift: 0.1,
            capLiftRange: 0.08,
            minRing: 0.2,
            ringRange: 0.85,
            baseYOffset: -0.55,
            yRandomness: 0.14,
            minSize: 0.16,
            sizeSpread: 0.2,
            edgeSizeBoost: 0.11,
            scaleXBase: 0.95,
            scaleXRange: 0.24,
            scaleYBase: 0.62,
            scaleYRange: 0.24,
            scaleZBase: 0.9,
            scaleZRange: 0.22,
            minRadiusX: 6.2,
            radiusXRange: 5.2,
            minRadiusZ: 2.4,
            radiusZRange: 2.6,
            minBaseY: 4.45,
            baseYRange: 1.25,
            minScale: 0.9,
            scaleRange: 0.45,
            minSpeed: 0.035,
            speedRange: 0.045,
            minDriftX: 0.28,
            driftXRange: 0.34,
            minDriftZ: 0.1,
            driftZRange: 0.16,
            minDriftY: 0.012,
            driftYRange: 0.018
        }
    };

    const THEME_CONFIG = {
        dark: {
            trunk: 0x433327,
            foliage: 0x1f4632,
            foliageLight: 0x2d6043,
            ground: 0x182a1d,
            stone: 0x4a5560,
            grass: 0x205236,
            grassLight: 0x2c6844,
            mountain: 0x1a2530,
            cloudTop: 0xe9eef5,
            cloudBase: 0xcfd8e5
        },
        light: {
            trunk: 0xa88258,
            foliage: 0x5f9f6f,
            foliageLight: 0x79bf89,
            ground: 0x89be72,
            stone: 0xaeb8c2,
            grass: 0x5ea55f,
            grassLight: 0x79c277,
            mountain: 0x8a9cac,
            cloudTop: 0xffffff,
            cloudBase: 0xdfe7f2
        }
    };

    function getViewportSize() {
        const topOffset = Math.max(mount.getBoundingClientRect().top, 0);
        return {
            width: window.innerWidth,
            height: Math.max(window.innerHeight - topOffset, SCENE_CONFIG.viewport.minHeight)
        };
    }

    const darkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const themeKey = darkMode ? 'dark' : 'light';
    const theme = THEME_CONFIG[themeKey];
    const fogConfig = SCENE_CONFIG.fog[themeKey];
    const ambientConfig = SCENE_CONFIG.lights.ambient[themeKey];
    const sunConfig = SCENE_CONFIG.lights.sun[themeKey];
    let { width, height } = getViewportSize();

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (error) {
        mount.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-muted);font-size:0.95rem;">3D scene failed to initialize on this browser/device.</div>';
        return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, SCENE_CONFIG.viewport.maxPixelRatio));
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

    const disposableGeometries = [];
    const disposableMaterials = [];

    function trackGeometry(geometry) {
        disposableGeometries.push(geometry);
        return geometry;
    }

    function trackMaterial(material) {
        disposableMaterials.push(material);
        return material;
    }

    function createStandardMaterial(options) {
        return trackMaterial(new THREE.MeshStandardMaterial(options));
    }

    function createBasicMaterial(options) {
        return trackMaterial(new THREE.MeshBasicMaterial(options));
    }

    const sharedGeometries = {
        trunk: trackGeometry(new THREE.CylinderGeometry(
            TREE_CONFIG.trunk.topRadius,
            TREE_CONFIG.trunk.bottomRadius,
            TREE_CONFIG.trunk.height,
            TREE_CONFIG.trunk.radialSegments
        )),
        pineCone: trackGeometry(new THREE.ConeGeometry(1, 1, TREE_CONFIG.foliageSegments)),
        grassCone: trackGeometry(new THREE.ConeGeometry(1, 1, TREE_CONFIG.branchSegments)),
        ground: trackGeometry(new THREE.CylinderGeometry(1, 1, 1, GROUND_CONFIG.ground.radialSegments)),
        rock: trackGeometry(new THREE.DodecahedronGeometry(1, 0)),
        mountainPeak: trackGeometry(new THREE.ConeGeometry(1, 1, GROUND_CONFIG.mountainSegments)),
        mountainBase: trackGeometry(new THREE.CylinderGeometry(1, 1, 1, GROUND_CONFIG.mountainSegments)),
        star: trackGeometry(new THREE.SphereGeometry(1, 6, 6)),
        cloudPuff: trackGeometry(new THREE.SphereGeometry(1, 12, 12))
    };

    const sharedMaterials = {
        trunk: createStandardMaterial({
            color: theme.trunk,
            roughness: 0.95
        }),
        foliage: createStandardMaterial({
            color: theme.foliage,
            roughness: 0.9,
            flatShading: true
        }),
        foliageLight: createStandardMaterial({
            color: theme.foliageLight,
            roughness: 0.9,
            flatShading: true
        }),
        ground: createStandardMaterial({
            color: theme.ground,
            roughness: 1
        }),
        stone: createStandardMaterial({
            color: theme.stone,
            roughness: 0.9
        }),
        grass: createStandardMaterial({
            color: theme.grass,
            roughness: 0.95,
            flatShading: true
        }),
        grassLight: createStandardMaterial({
            color: theme.grassLight,
            roughness: 0.95,
            flatShading: true
        }),
        mountain: createStandardMaterial({
            color: theme.mountain,
            roughness: 0.9,
            flatShading: true
        }),
        star: createBasicMaterial({
            color: SKY_CONFIG.stars.color,
            transparent: true,
            opacity: SKY_CONFIG.stars.materialOpacity
        }),
        cloudTop: createStandardMaterial({
            color: theme.cloudTop,
            roughness: 1,
            transparent: true,
            opacity: 0.84,
            depthWrite: false,
            side: THREE.DoubleSide
        }),
        cloudBase: createStandardMaterial({
            color: theme.cloudBase,
            roughness: 1,
            transparent: true,
            opacity: 0.76,
            depthWrite: false,
            side: THREE.DoubleSide
        })
    };

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(fogConfig.color, fogConfig.density);

    const camera = new THREE.PerspectiveCamera(
        SCENE_CONFIG.camera.fov,
        width / height,
        SCENE_CONFIG.camera.near,
        SCENE_CONFIG.camera.far
    );
    camera.position.set(
        SCENE_CONFIG.camera.startPosition.x,
        SCENE_CONFIG.camera.startPosition.y,
        SCENE_CONFIG.camera.startPosition.z
    );
    const cameraTarget = new THREE.Vector3(
        SCENE_CONFIG.camera.target.x,
        SCENE_CONFIG.camera.target.y,
        SCENE_CONFIG.camera.target.z
    );

    const ambientLight = new THREE.HemisphereLight(
        ambientConfig.sky,
        ambientConfig.ground,
        ambientConfig.intensity
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(sunConfig.color, sunConfig.intensity);
    sunLight.position.set(
        SCENE_CONFIG.lights.sun.position.x,
        SCENE_CONFIG.lights.sun.position.y,
        SCENE_CONFIG.lights.sun.position.z
    );
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = SCENE_CONFIG.lights.sun.shadow.width;
    sunLight.shadow.mapSize.height = SCENE_CONFIG.lights.sun.shadow.height;
    sunLight.shadow.camera.near = SCENE_CONFIG.lights.sun.shadow.near;
    sunLight.shadow.camera.far = SCENE_CONFIG.lights.sun.shadow.far;
    sunLight.shadow.camera.left = SCENE_CONFIG.lights.sun.shadow.left;
    sunLight.shadow.camera.right = SCENE_CONFIG.lights.sun.shadow.right;
    sunLight.shadow.camera.top = SCENE_CONFIG.lights.sun.shadow.top;
    sunLight.shadow.camera.bottom = SCENE_CONFIG.lights.sun.shadow.bottom;
    scene.add(sunLight);

    const treeGroup = new THREE.Group();
    const groundGroup = new THREE.Group();
    const mountainGroup = new THREE.Group();
    scene.add(treeGroup);
    scene.add(groundGroup);
    scene.add(mountainGroup);

    const pineLayerMeshes = Array.from({ length: TREE_CONFIG.layers.length }, function () {
        return [];
    });

    function setCommonMeshFlags(mesh, castShadow, receiveShadow) {
        mesh.castShadow = castShadow;
        mesh.receiveShadow = receiveShadow;
        return mesh;
    }

    function chooseFoliageMaterial() {
        return Math.random() > 0.5 ? sharedMaterials.foliage : sharedMaterials.foliageLight;
    }

    function createPineLayer(radius, y, height, layerIndex, material) {
        const layer = new THREE.Mesh(sharedGeometries.pineCone, material || chooseFoliageMaterial());
        layer.scale.set(radius, height, radius);
        layer.position.set(0, y, 0);
        setCommonMeshFlags(layer, true, true);
        pineLayerMeshes[layerIndex].push(layer);
        return layer;
    }

    const trunk = new THREE.Mesh(sharedGeometries.trunk, sharedMaterials.trunk);
    trunk.position.set(0, TREE_CONFIG.trunk.positionY, 0);
    setCommonMeshFlags(trunk, true, true);
    treeGroup.add(trunk);

    TREE_CONFIG.layers.forEach(function (layer, index) {
        const cone = createPineLayer(layer.r, layer.y, layer.h, index);
        treeGroup.add(cone);

        if (index < TREE_CONFIG.layers.length - TREE_CONFIG.branchCutoffLayers) {
            const offset = Math.max(TREE_CONFIG.branchOffsetMin, layer.r * TREE_CONFIG.branchOffsetScale);
            const sideBranch1 = createPineLayer(
                layer.r * TREE_CONFIG.sideBranchScale,
                layer.y + TREE_CONFIG.sideBranchYOffset,
                layer.h * TREE_CONFIG.sideBranchHeightScale,
                index
            );
            sideBranch1.position.x = offset;
            sideBranch1.rotation.z = -TREE_CONFIG.sideBranchRotation;
            treeGroup.add(sideBranch1);

            const sideBranch2 = createPineLayer(
                layer.r * TREE_CONFIG.sideBranchScale,
                layer.y + TREE_CONFIG.sideBranchYOffset,
                layer.h * TREE_CONFIG.sideBranchHeightScale,
                index
            );
            sideBranch2.position.x = -offset;
            sideBranch2.rotation.z = TREE_CONFIG.sideBranchRotation;
            treeGroup.add(sideBranch2);

            const frontBranch1 = createPineLayer(
                layer.r * TREE_CONFIG.frontBranchScale,
                layer.y + TREE_CONFIG.frontBranchYOffset,
                layer.h * TREE_CONFIG.frontBranchHeightScale,
                index
            );
            frontBranch1.position.z = offset;
            frontBranch1.rotation.x = TREE_CONFIG.frontBranchRotation;
            treeGroup.add(frontBranch1);

            const frontBranch2 = createPineLayer(
                layer.r * TREE_CONFIG.frontBranchScale,
                layer.y + TREE_CONFIG.frontBranchYOffset,
                layer.h * TREE_CONFIG.frontBranchHeightScale,
                index
            );
            frontBranch2.position.z = -offset;
            frontBranch2.rotation.x = -TREE_CONFIG.frontBranchRotation;
            treeGroup.add(frontBranch2);
        }
    });

    const topCone = createPineLayer(
        TREE_CONFIG.topCone.radius,
        TREE_CONFIG.topCone.y,
        TREE_CONFIG.topCone.height,
        TREE_CONFIG.layers.length - 1,
        sharedMaterials.foliageLight
    );
    treeGroup.add(topCone);

    const ground = new THREE.Mesh(sharedGeometries.ground, sharedMaterials.ground);
    ground.scale.set(
        GROUND_CONFIG.ground.radius,
        GROUND_CONFIG.ground.height,
        GROUND_CONFIG.ground.radius
    );
    ground.position.set(0, GROUND_CONFIG.ground.y, 0);
    setCommonMeshFlags(ground, false, true);
    groundGroup.add(ground);

    GROUND_CONFIG.rocks.forEach(function (rock) {
        const mesh = new THREE.Mesh(sharedGeometries.rock, sharedMaterials.stone);
        mesh.scale.setScalar(rock.s);
        mesh.position.set(rock.x, rock.s * 0.4, rock.z);
        mesh.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5);
        setCommonMeshFlags(mesh, true, true);
        groundGroup.add(mesh);
    });

    const grassCount = darkMode ? GROUND_CONFIG.grass.darkCount : GROUND_CONFIG.grass.lightCount;
    for (let i = 0; i < grassCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const radius = GROUND_CONFIG.grass.minRadius + Math.random() * GROUND_CONFIG.grass.radiusSpread;
        const x = Math.cos(theta) * radius + (Math.random() - 0.5) * GROUND_CONFIG.grass.jitter;
        const z = Math.sin(theta) * radius + (Math.random() - 0.5) * GROUND_CONFIG.grass.jitter;
        const bladeHeight = GROUND_CONFIG.grass.minHeight + Math.random() * GROUND_CONFIG.grass.heightSpread;
        const bladeRadius = GROUND_CONFIG.grass.minRadiusScale + Math.random() * GROUND_CONFIG.grass.radiusScaleSpread;
        const blade = new THREE.Mesh(
            sharedGeometries.grassCone,
            Math.random() > 0.5 ? sharedMaterials.grass : sharedMaterials.grassLight
        );
        blade.scale.set(bladeRadius, bladeHeight, bladeRadius);
        blade.position.set(x, bladeHeight * 0.45 + GROUND_CONFIG.grass.positionYOffset, z);
        blade.rotation.y = Math.random() * Math.PI;
        setCommonMeshFlags(blade, false, true);
        groundGroup.add(blade);
    }

    GROUND_CONFIG.mountains.forEach(function (mountain) {
        const singleMountainGroup = new THREE.Group();

        const peak = new THREE.Mesh(sharedGeometries.mountainPeak, sharedMaterials.mountain);
        peak.scale.set(mountain.r, mountain.h, mountain.r);
        peak.position.y = mountain.h * 0.5;
        singleMountainGroup.add(peak);

        const base = new THREE.Mesh(sharedGeometries.mountainBase, sharedMaterials.mountain);
        base.scale.set(
            mountain.r * GROUND_CONFIG.mountainBaseBottomScale,
            GROUND_CONFIG.mountainBaseHeight,
            mountain.r * GROUND_CONFIG.mountainBaseTopScale
        );
        base.position.y = GROUND_CONFIG.mountainBaseY;
        singleMountainGroup.add(base);

        singleMountainGroup.position.set(mountain.x, GROUND_CONFIG.mountainPositionY, mountain.z);
        singleMountainGroup.rotation.y = Math.random() * Math.PI;
        mountainGroup.add(singleMountainGroup);
    });

    const stars = [];
    if (darkMode) {
        for (let i = 0; i < SKY_CONFIG.stars.count; i++) {
            const star = new THREE.Mesh(sharedGeometries.star, sharedMaterials.star);
            const theta = Math.random() * Math.PI * 2;
            const radius = SKY_CONFIG.stars.minRadius + Math.random() * SKY_CONFIG.stars.radiusSpread;
            const starSize = SKY_CONFIG.stars.minSize + Math.random() * SKY_CONFIG.stars.sizeSpread;
            star.scale.setScalar(starSize);
            star.position.set(
                Math.cos(theta) * radius,
                SKY_CONFIG.stars.minY + Math.random() * SKY_CONFIG.stars.ySpread,
                Math.sin(theta) * radius
            );
            star.userData.baseScale = starSize;
            star.userData.phase = Math.random() * Math.PI * 2;
            star.userData.speed = SKY_CONFIG.stars.minSpeed + Math.random() * SKY_CONFIG.stars.speedSpread;
            scene.add(star);
            stars.push(star);
        }
    }

    const clouds = [];
    if (!darkMode) {
        for (let i = 0; i < SKY_CONFIG.clouds.count; i++) {
            const cloud = new THREE.Group();
            const puffCount = SKY_CONFIG.clouds.minPuffs + Math.floor(Math.random() * SKY_CONFIG.clouds.puffSpread);
            const spreadX = SKY_CONFIG.clouds.minSpreadX + Math.random() * SKY_CONFIG.clouds.spreadXRange;
            const spreadZ = SKY_CONFIG.clouds.minSpreadZ + Math.random() * SKY_CONFIG.clouds.spreadZRange;
            const capLift = SKY_CONFIG.clouds.minCapLift + Math.random() * SKY_CONFIG.clouds.capLiftRange;

            for (let j = 0; j < puffCount; j++) {
                const angle = Math.random() * Math.PI * 2;
                const ring = SKY_CONFIG.clouds.minRing + Math.pow(Math.random(), 0.75) * SKY_CONFIG.clouds.ringRange;
                const x = Math.cos(angle) * ring * spreadX;
                const z = Math.sin(angle) * ring * spreadZ;
                const edge = Math.max(0, 1 - Math.sqrt((x * x) / (spreadX * spreadX) + (z * z) / (spreadZ * spreadZ)));
                const y = (Math.random() + SKY_CONFIG.clouds.baseYOffset) * SKY_CONFIG.clouds.yRandomness + edge * capLift;
                const size = SKY_CONFIG.clouds.minSize + Math.random() * SKY_CONFIG.clouds.sizeSpread + edge * SKY_CONFIG.clouds.edgeSizeBoost;

                const puffMesh = new THREE.Mesh(
                    sharedGeometries.cloudPuff,
                    y > 0.03 ? sharedMaterials.cloudTop : sharedMaterials.cloudBase
                );
                puffMesh.position.set(x, y, z);
                puffMesh.scale.set(
                    size * (SKY_CONFIG.clouds.scaleXBase + Math.random() * SKY_CONFIG.clouds.scaleXRange),
                    size * (SKY_CONFIG.clouds.scaleYBase + Math.random() * SKY_CONFIG.clouds.scaleYRange),
                    size * (SKY_CONFIG.clouds.scaleZBase + Math.random() * SKY_CONFIG.clouds.scaleZRange)
                );
                setCommonMeshFlags(puffMesh, false, false);
                cloud.add(puffMesh);
            }

            const theta = Math.random() * Math.PI * 2;
            const radiusX = SKY_CONFIG.clouds.minRadiusX + Math.random() * SKY_CONFIG.clouds.radiusXRange;
            const radiusZ = SKY_CONFIG.clouds.minRadiusZ + Math.random() * SKY_CONFIG.clouds.radiusZRange;
            const baseX = Math.cos(theta) * radiusX;
            const baseZ = Math.sin(theta) * radiusZ;
            const baseY = SKY_CONFIG.clouds.minBaseY + Math.random() * SKY_CONFIG.clouds.baseYRange;

            cloud.position.set(baseX, baseY, baseZ);
            cloud.rotation.y = Math.random() * Math.PI;
            cloud.scale.setScalar(SKY_CONFIG.clouds.minScale + Math.random() * SKY_CONFIG.clouds.scaleRange);
            cloud.userData.baseX = baseX;
            cloud.userData.baseY = baseY;
            cloud.userData.baseZ = baseZ;
            cloud.userData.phase = Math.random() * Math.PI * 2;
            cloud.userData.speed = SKY_CONFIG.clouds.minSpeed + Math.random() * SKY_CONFIG.clouds.speedRange;
            cloud.userData.driftX = SKY_CONFIG.clouds.minDriftX + Math.random() * SKY_CONFIG.clouds.driftXRange;
            cloud.userData.driftZ = SKY_CONFIG.clouds.minDriftZ + Math.random() * SKY_CONFIG.clouds.driftZRange;
            cloud.userData.driftY = SKY_CONFIG.clouds.minDriftY + Math.random() * SKY_CONFIG.clouds.driftYRange;

            scene.add(cloud);
            clouds.push(cloud);
        }
    }

    const clock = new THREE.Clock();
    let animationFrameId = 0;
    let resizeFrameId = 0;
    let cleanedUp = false;

    function animate() {
        if (cleanedUp || !mount.isConnected) {
            cleanup();
            return;
        }

        const t = clock.getElapsedTime();
        const angle = t * SCENE_CONFIG.camera.orbitSpeed;

        camera.position.x = Math.cos(angle) * SCENE_CONFIG.camera.orbitRadius;
        camera.position.z = Math.sin(angle) * SCENE_CONFIG.camera.orbitRadius;
        camera.position.y = SCENE_CONFIG.camera.bobBaseY + Math.sin(t * SCENE_CONFIG.camera.bobSpeed) * SCENE_CONFIG.camera.bobAmplitude;
        camera.lookAt(cameraTarget);

        treeGroup.rotation.z = Math.sin(t * SCENE_CONFIG.animation.treeSwaySpeed) * SCENE_CONFIG.animation.treeSwayAmount;
        treeGroup.rotation.x = Math.cos(t * SCENE_CONFIG.animation.treeTiltSpeed) * SCENE_CONFIG.animation.treeTiltAmount;

        pineLayerMeshes.forEach(function (meshes, index) {
            const layerSway = Math.sin(t * SCENE_CONFIG.animation.pineSwaySpeed + index * SCENE_CONFIG.animation.pinePhaseStep) *
                SCENE_CONFIG.animation.pineSwayAmount *
                (1 - index * SCENE_CONFIG.animation.pineDecayPerLayer);

            meshes.forEach(function (mesh) {
                mesh.rotation.z = layerSway;
            });
        });

        stars.forEach(function (star) {
            const twinkle = SKY_CONFIG.stars.twinkleBaseScale +
                (Math.sin(t * star.userData.speed + star.userData.phase) + 1) * 0.5 * SKY_CONFIG.stars.twinkleAmount;
            const scale = star.userData.baseScale * twinkle;
            star.scale.setScalar(scale);
        });

        clouds.forEach(function (cloud) {
            const driftX = Math.sin(t * cloud.userData.speed + cloud.userData.phase) * cloud.userData.driftX;
            const driftZ = Math.cos(t * cloud.userData.speed * SCENE_CONFIG.animation.cloudZDriftScale + cloud.userData.phase) * cloud.userData.driftZ;
            const driftY = Math.sin(t * cloud.userData.speed * SCENE_CONFIG.animation.cloudYDriftScale + cloud.userData.phase) * cloud.userData.driftY;
            cloud.position.x = cloud.userData.baseX + driftX;
            cloud.position.z = cloud.userData.baseZ + driftZ;
            cloud.position.y = cloud.userData.baseY + driftY;
        });

        renderer.render(scene, camera);
        animationFrameId = window.requestAnimationFrame(animate);
    }

    function applyResize() {
        resizeFrameId = 0;
        const nextSize = getViewportSize();
        width = nextSize.width;
        height = nextSize.height;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, SCENE_CONFIG.viewport.maxPixelRatio));
        renderer.setSize(width, height);
    }

    function handleResize() {
        if (cleanedUp || resizeFrameId) return;
        resizeFrameId = window.requestAnimationFrame(applyResize);
    }

    function cleanup() {
        if (cleanedUp) return;
        cleanedUp = true;

        if (animationFrameId) {
            window.cancelAnimationFrame(animationFrameId);
            animationFrameId = 0;
        }
        if (resizeFrameId) {
            window.cancelAnimationFrame(resizeFrameId);
            resizeFrameId = 0;
        }

        window.removeEventListener('resize', handleResize);
        window.removeEventListener('pagehide', cleanup);
        window.removeEventListener('beforeunload', cleanup);

        disposableMaterials.forEach(function (material) {
            material.dispose();
        });
        disposableGeometries.forEach(function (geometry) {
            geometry.dispose();
        });

        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode === mount) {
            mount.removeChild(renderer.domElement);
        }
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('pagehide', cleanup);
    window.addEventListener('beforeunload', cleanup);

    animate();
})();
