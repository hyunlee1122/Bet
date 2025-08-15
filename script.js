class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0, pressed: false };
        
        // Physics properties
        this.config = {
            particleCount: 100,
            particleSize: 3,
            particleSpeed: 2,
            gravity: 0.1,
            friction: 0.99,
            attraction: 0.5,
            trails: 0.1,
            colorMode: true,
            connections: false
        };
        
        // Performance tracking
        this.fps = 60;
        this.lastTime = 0;
        this.frameCount = 0;
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        this.resizeCanvas();
        this.createParticles();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push(new Particle(this.canvas.width, this.canvas.height, this.config));
        }
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mousedown', () => {
            this.mouse.pressed = true;
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.mouse.pressed = false;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.pressed = false;
        });
        
        // Control event listeners
        this.setupControls();
    }
    
    setupControls() {
        const controls = {
            particleCount: document.getElementById('particleCount'),
            particleSize: document.getElementById('particleSize'),
            particleSpeed: document.getElementById('particleSpeed'),
            gravity: document.getElementById('gravity'),
            friction: document.getElementById('friction'),
            attraction: document.getElementById('attraction'),
            trails: document.getElementById('trails'),
            colorMode: document.getElementById('colorMode'),
            connections: document.getElementById('connections')
        };
        
        // Range inputs
        Object.keys(controls).forEach(key => {
            if (controls[key] && controls[key].type !== 'checkbox') {
                controls[key].addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    this.config[key] = value;
                    document.getElementById(key + 'Value').textContent = value;
                    
                    if (key === 'particleCount') {
                        this.createParticles();
                    }
                });
            }
        });
        
        // Checkboxes
        if (controls.colorMode) {
            controls.colorMode.addEventListener('change', (e) => {
                this.config.colorMode = e.target.checked;
            });
        }
        
        if (controls.connections) {
            controls.connections.addEventListener('change', (e) => {
                this.config.connections = e.target.checked;
            });
        }
        
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyPreset(btn.dataset.preset);
            });
        });
    }
    
    applyPreset(presetName) {
        const presets = {
            galaxy: {
                particleCount: 200,
                particleSize: 2,
                particleSpeed: 1.5,
                gravity: 0.05,
                friction: 0.995,
                attraction: 1.2,
                trails: 0.05,
                colorMode: true,
                connections: false
            },
            fireworks: {
                particleCount: 150,
                particleSize: 4,
                particleSpeed: 4,
                gravity: 0.3,
                friction: 0.96,
                attraction: 0.1,
                trails: 0.2,
                colorMode: true,
                connections: false
            },
            plasma: {
                particleCount: 300,
                particleSize: 1,
                particleSpeed: 3,
                gravity: 0,
                friction: 0.99,
                attraction: 0.8,
                trails: 0.02,
                colorMode: true,
                connections: true
            },
            snow: {
                particleCount: 100,
                particleSize: 5,
                particleSpeed: 0.5,
                gravity: 0.2,
                friction: 0.999,
                attraction: 0,
                trails: 0.1,
                colorMode: false,
                connections: false
            }
        };
        
        const preset = presets[presetName];
        if (preset) {
            Object.assign(this.config, preset);
            this.updateControlsFromConfig();
            this.createParticles();
        }
    }
    
    updateControlsFromConfig() {
        Object.keys(this.config).forEach(key => {
            const control = document.getElementById(key);
            const valueDisplay = document.getElementById(key + 'Value');
            
            if (control) {
                if (control.type === 'checkbox') {
                    control.checked = this.config[key];
                } else {
                    control.value = this.config[key];
                    if (valueDisplay) {
                        valueDisplay.textContent = this.config[key];
                    }
                }
            }
        });
    }
    
    animate(currentTime = 0) {
        // FPS calculation
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            document.getElementById('fps').textContent = this.fps;
        }
        this.frameCount++;
        
        // Clear canvas with trail effect
        if (this.config.trails > 0) {
            this.ctx.fillStyle = `rgba(12, 12, 12, ${this.config.trails})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Update and draw particles
        this.particles.forEach((particle, index) => {
            particle.update(this.mouse, this.config, this.canvas.width, this.canvas.height);
            particle.draw(this.ctx, this.config);
            
            // Draw connections
            if (this.config.connections) {
                this.drawConnections(particle, index);
            }
        });
        
        // Update stats
        document.getElementById('activeParticles').textContent = this.particles.length;
        
        requestAnimationFrame((time) => this.animate(time));
    }
    
    drawConnections(particle, index) {
        this.particles.slice(index + 1).forEach(otherParticle => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const opacity = (100 - distance) / 100 * 0.3;
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                this.ctx.lineWidth = 0.5;
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(otherParticle.x, otherParticle.y);
                this.ctx.stroke();
            }
        });
    }
}

class Particle {
    constructor(canvasWidth, canvasHeight, config) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.vx = (Math.random() - 0.5) * config.particleSpeed;
        this.vy = (Math.random() - 0.5) * config.particleSpeed;
        this.size = Math.random() * config.particleSize + 1;
        this.hue = Math.random() * 360;
        this.life = 1;
        this.decay = Math.random() * 0.01 + 0.005;
        
        // Physics properties
        this.mass = this.size * 0.1;
        this.bounce = 0.8;
    }
    
    update(mouse, config, canvasWidth, canvasHeight) {
        // Mouse interaction
        if (mouse.x && mouse.y) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                const force = (150 - distance) / 150;
                const angle = Math.atan2(dy, dx);
                const attraction = mouse.pressed ? config.attraction * 2 : config.attraction;
                
                this.vx += Math.cos(angle) * force * attraction * 0.1;
                this.vy += Math.sin(angle) * force * attraction * 0.1;
            }
        }
        
        // Apply gravity
        this.vy += config.gravity;
        
        // Apply friction
        this.vx *= config.friction;
        this.vy *= config.friction;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Boundary collision with bounce
        if (this.x <= this.size || this.x >= canvasWidth - this.size) {
            this.vx *= -this.bounce;
            this.x = Math.max(this.size, Math.min(canvasWidth - this.size, this.x));
        }
        
        if (this.y <= this.size || this.y >= canvasHeight - this.size) {
            this.vy *= -this.bounce;
            this.y = Math.max(this.size, Math.min(canvasHeight - this.size, this.y));
        }
        
        // Update color
        this.hue += 0.5;
        if (this.hue > 360) this.hue = 0;
        
        // Life cycle
        this.life -= this.decay;
        if (this.life <= 0) {
            this.life = 1;
            this.x = Math.random() * canvasWidth;
            this.y = Math.random() * canvasHeight;
            this.vx = (Math.random() - 0.5) * config.particleSpeed;
            this.vy = (Math.random() - 0.5) * config.particleSpeed;
        }
    }
    
    draw(ctx, config) {
        ctx.save();
        
        // Create gradient for particle
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        
        if (config.colorMode) {
            const alpha = this.life * 0.8;
            gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, ${alpha})`);
            gradient.addColorStop(0.5, `hsla(${this.hue}, 70%, 50%, ${alpha * 0.5})`);
            gradient.addColorStop(1, `hsla(${this.hue}, 70%, 40%, 0)`);
        } else {
            const alpha = this.life * 0.6;
            gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(200, 200, 200, ${alpha * 0.5})`);
            gradient.addColorStop(1, `rgba(150, 150, 150, 0)`);
        }
        
        // Draw particle
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = config.colorMode ? `hsl(${this.hue}, 70%, 60%)` : 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Initialize the particle system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const particleSystem = new ParticleSystem(canvas);
    
    // Add some visual feedback for loading
    canvas.classList.add('loading');
    setTimeout(() => {
        canvas.classList.remove('loading');
    }, 1000);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case ' ':
                e.preventDefault();
                // Space to reset particles
                particleSystem.createParticles();
                break;
            case 'r':
            case 'R':
                // R to reset to defaults
                particleSystem.config = {
                    particleCount: 100,
                    particleSize: 3,
                    particleSpeed: 2,
                    gravity: 0.1,
                    friction: 0.99,
                    attraction: 0.5,
                    trails: 0.1,
                    colorMode: true,
                    connections: false
                };
                particleSystem.updateControlsFromConfig();
                particleSystem.createParticles();
                break;
        }
    });
    
    // Add touch support for mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        particleSystem.mouse.x = touch.clientX - rect.left;
        particleSystem.mouse.y = touch.clientY - rect.top;
        particleSystem.mouse.pressed = true;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        particleSystem.mouse.x = touch.clientX - rect.left;
        particleSystem.mouse.y = touch.clientY - rect.top;
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        particleSystem.mouse.pressed = false;
    });
});