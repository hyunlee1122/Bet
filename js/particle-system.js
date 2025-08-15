// Interactive 3D Particle System
class ParticleSystem {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('particle-canvas'),
            alpha: true,
            antialias: true
        });
        
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.particles = [];
        this.particleCount = 1000;
        this.time = 0;
        
        this.init();
        this.createParticles();
        this.addEventListeners();
        this.animate();
    }
    
    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 0);
        
        this.camera.position.z = 50;
        
        // Add ambient lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }
    
    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        const velocities = new Float32Array(this.particleCount * 3);
        const sizes = new Float32Array(this.particleCount);
        
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            
            // Random positions in a sphere
            const radius = Math.random() * 30 + 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Random velocities
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
            
            // Dynamic colors
            const hue = Math.random();
            const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Random sizes
            sizes[i] = Math.random() * 2 + 1;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Create particle material with custom shader
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                mouse: { value: new THREE.Vector2() },
                pointTexture: { value: this.createParticleTexture() }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 velocity;
                uniform float time;
                uniform vec2 mouse;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    
                    vec3 pos = position;
                    
                    // Wave motion
                    pos.x += sin(time * 0.001 + position.y * 0.01) * 2.0;
                    pos.y += cos(time * 0.001 + position.x * 0.01) * 2.0;
                    pos.z += sin(time * 0.001 + position.x * 0.01 + position.y * 0.01) * 1.0;
                    
                    // Mouse interaction
                    vec2 mouseInfluence = mouse * 0.1;
                    pos.x += mouseInfluence.x;
                    pos.y += mouseInfluence.y;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                
                void main() {
                    vec4 textureColor = texture2D(pointTexture, gl_PointCoord);
                    gl_FragColor = vec4(vColor, 1.0) * textureColor;
                }
            `,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true
        });
        
        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
    }
    
    createParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(0.4, 'rgba(255,255,255,0.4)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    addEventListeners() {
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Add click interaction for explosive effect
        window.addEventListener('click', () => {
            this.explodeParticles();
        });
    }
    
    explodeParticles() {
        const geometry = this.particleSystem.geometry;
        const positions = geometry.attributes.position.array;
        const velocities = geometry.attributes.velocity.array;
        
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            // Add explosive velocity
            velocities[i3] += (Math.random() - 0.5) * 0.5;
            velocities[i3 + 1] += (Math.random() - 0.5) * 0.5;
            velocities[i3 + 2] += (Math.random() - 0.5) * 0.5;
        }
        
        geometry.attributes.velocity.needsUpdate = true;
    }
    
    updateColors() {
        const geometry = this.particleSystem.geometry;
        const colors = geometry.attributes.color.array;
        
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            const hue = (this.time * 0.0001 + i * 0.001) % 1;
            const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        
        geometry.attributes.color.needsUpdate = true;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 1;
        
        // Update shader uniforms
        this.particleSystem.material.uniforms.time.value = this.time;
        this.particleSystem.material.uniforms.mouse.value = this.mouse;
        
        // Rotate the entire particle system
        this.particleSystem.rotation.x += 0.001;
        this.particleSystem.rotation.y += 0.002;
        
        // Update colors for rainbow effect
        if (this.time % 60 === 0) {
            this.updateColors();
        }
        
        // Camera movement
        this.camera.position.x = Math.sin(this.time * 0.0005) * 10;
        this.camera.position.y = Math.cos(this.time * 0.0003) * 5;
        this.camera.lookAt(this.scene.position);
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);
    
    // Initialize particle system and make it globally accessible
    window.particleSystem = new ParticleSystem();
});