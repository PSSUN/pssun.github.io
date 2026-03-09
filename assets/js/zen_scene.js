(function () {
    const mount = document.getElementById('zen-scene');
    if (!mount || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xdfefff, 0.028);

    const darkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    if (darkMode) {
        scene.fog.color.set(0x111a26);
    }

    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(6.5, 3.2, 6.5);

    const ambientLight = new THREE.HemisphereLight(
        darkMode ? 0x9bbcff : 0xeaf4ff,
        darkMode ? 0x142032 : 0x7ca36f,
        darkMode ? 1.0 : 1.15
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(darkMode ? 0x8db8ff : 0xffffff, darkMode ? 1.3 : 1.1);
    sunLight.position.set(6, 8, 4);
    scene.add(sunLight);

    const groundMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x203524 : 0x6f9d58,
        roughness: 0.95,
        metalness: 0.02
    });

    const hill = new THREE.Mesh(new THREE.SphereGeometry(4.5, 64, 64), groundMaterial);
    hill.scale.set(1.35, 0.45, 1.35);
    hill.position.y = -2.45;
    scene.add(hill);

    const hillDetail = new THREE.Mesh(
        new THREE.SphereGeometry(2.8, 48, 48),
        new THREE.MeshStandardMaterial({
            color: darkMode ? 0x29452f : 0x7eab63,
            roughness: 1
        })
    );
    hillDetail.scale.set(1.1, 0.35, 1.0);
    hillDetail.position.set(0.9, -1.72, -0.4);
    scene.add(hillDetail);

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.24, 2.5, 18),
        new THREE.MeshStandardMaterial({
            color: darkMode ? 0x7a5a3d : 0x8e643f,
            roughness: 0.96
        })
    );
    trunk.position.y = -0.1;
    trunk.rotation.z = 0.08;
    scene.add(trunk);

    const canopyMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x4d8758 : 0x69b36f,
        roughness: 0.9
    });

    const canopyCore = new THREE.Mesh(new THREE.IcosahedronGeometry(1.12, 2), canopyMaterial);
    canopyCore.position.set(0, 1.6, 0);
    canopyCore.scale.set(1.45, 1.15, 1.4);
    scene.add(canopyCore);

    const canopyPuff1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 1), canopyMaterial);
    canopyPuff1.position.set(-0.92, 1.55, 0.18);
    scene.add(canopyPuff1);

    const canopyPuff2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.68, 1), canopyMaterial);
    canopyPuff2.position.set(0.88, 1.45, -0.08);
    scene.add(canopyPuff2);

    const canopyPuff3 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 1), canopyMaterial);
    canopyPuff3.position.set(0.1, 2.28, 0.22);
    scene.add(canopyPuff3);

    const stoneMaterial = new THREE.MeshStandardMaterial({
        color: darkMode ? 0x5f6977 : 0xb7bec8,
        roughness: 1
    });

    [
        { x: -1.35, y: -1.02, z: 1.1, s: 0.18 },
        { x: 1.1, y: -1.08, z: 0.75, s: 0.14 },
        { x: 0.55, y: -1.18, z: -1.2, s: 0.12 }
    ].forEach((rock) => {
        const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(rock.s, 0), stoneMaterial);
        mesh.position.set(rock.x, rock.y, rock.z);
        scene.add(mesh);
    });

    const stars = [];
    if (darkMode) {
        const starMaterial = new THREE.MeshBasicMaterial({ color: 0xc9dcff, transparent: true, opacity: 0.85 });
        for (let i = 0; i < 36; i++) {
            const star = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), starMaterial.clone());
            const theta = Math.random() * Math.PI * 2;
            const radius = 7 + Math.random() * 10;
            star.position.set(Math.cos(theta) * radius, 4 + Math.random() * 3.5, Math.sin(theta) * radius);
            star.userData.phase = Math.random() * Math.PI * 2;
            scene.add(star);
            stars.push(star);
        }
    }

    const orbitRadius = 7.8;
    const cameraTarget = new THREE.Vector3(0, 0.95, 0);
    const clock = new THREE.Clock();

    function animate() {
        const t = clock.getElapsedTime();
        const angle = t * 0.12;

        camera.position.x = Math.cos(angle) * orbitRadius;
        camera.position.z = Math.sin(angle) * orbitRadius;
        camera.position.y = 2.85 + Math.sin(t * 0.24) * 0.12;
        camera.lookAt(cameraTarget);

        canopyCore.rotation.y += 0.0014;
        canopyPuff1.rotation.y -= 0.001;
        canopyPuff2.rotation.y += 0.0012;
        canopyPuff3.rotation.y -= 0.0009;

        const sway = Math.sin(t * 0.7) * 0.035;
        trunk.rotation.z = 0.08 + sway * 0.35;
        canopyCore.rotation.z = sway;
        canopyPuff1.rotation.z = sway * 1.05;
        canopyPuff2.rotation.z = sway * 0.85;
        canopyPuff3.rotation.z = sway * 1.1;

        stars.forEach((star, index) => {
            star.material.opacity = 0.45 + (Math.sin(t * 1.2 + star.userData.phase + index) + 1) * 0.2;
        });

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    function handleResize() {
        const width = mount.clientWidth;
        const height = mount.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    window.addEventListener('resize', handleResize);
    animate();
})();
