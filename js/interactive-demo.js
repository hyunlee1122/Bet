// Interactive Demo Controller
class InteractiveDemo {
    constructor() {
        this.isInitialized = false;
        this.particleSystem = null;
        this.controls = {};
        
        this.init();
    }
    
    init() {
        this.createControlPanel();
        this.createInfoPanel();
        this.addGlobalEffects();
        this.addKeyboardControls();
        this.addTouchGestures();
    }
    
    createControlPanel() {
        const controlPanel = document.createElement('div');
        controlPanel.id = 'particle-controls';
        controlPanel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            color: white;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            z-index: 1000;
            min-width: 250px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        
        controlPanel.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #00f5ff; text-align: center;">🌟 Particle Controls</h3>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px;">Particle Count: <span id="count-value">1000</span></label>
                <input type="range" id="particle-count" min="100" max="2000" value="1000" 
                       style="width: 100%; accent-color: #00f5ff;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px;">Animation Speed: <span id="speed-value">1.0x</span></label>
                <input type="range" id="animation-speed" min="0.1" max="3.0" step="0.1" value="1.0"
                       style="width: 100%; accent-color: #ff6b6b;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px;">Color Mode:</label>
                <select id="color-mode" style="width: 100%; padding: 5px; border-radius: 5px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2);">
                    <option value="rainbow">🌈 Rainbow</option>
                    <option value="fire">🔥 Fire</option>
                    <option value="ocean">🌊 Ocean</option>
                    <option value="galaxy">🌌 Galaxy</option>
                    <option value="neon">⚡ Neon</option>
                </select>
            </div>
            
            <div style="margin-bottom: 15px;">
                <button id="explosion-btn" style="width: 100%; padding: 10px; background: linear-gradient(45deg, #ff6b6b, #ffa500); border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; transition: transform 0.2s;">
                    💥 EXPLODE!
                </button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <button id="reset-btn" style="width: 100%; padding: 10px; background: linear-gradient(45deg, #4ecdc4, #00f5ff); border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; transition: transform 0.2s;">
                    🔄 Reset
                </button>
            </div>
            
            <div style="text-align: center; font-size: 12px; opacity: 0.7; margin-top: 15px;">
                <p>🖱️ Move mouse to interact<br>
                👆 Click anywhere to explode<br>
                ⌨️ Press SPACE for effects</p>
            </div>
        `;
        
        document.body.appendChild(controlPanel);
        this.bindControlEvents();
    }
    
    createInfoPanel() {
        const infoPanel = document.createElement('div');
        infoPanel.id = 'info-panel';
        infoPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            color: white;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        
        infoPanel.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #00f5ff;">✨ Interactive 3D Particle System</h3>
            <p style="margin: 0 0 10px 0; line-height: 1.4;">
                Experience a mesmerizing 3D particle universe with real-time physics, 
                dynamic colors, and interactive controls.
            </p>
            <div style="font-size: 12px; opacity: 0.8;">
                <div>FPS: <span id="fps-counter">60</span></div>
                <div>Particles: <span id="particle-counter">1000</span></div>
                <div>Mode: <span id="current-mode">Rainbow</span></div>
            </div>
        `;
        
        document.body.appendChild(infoPanel);
        this.startFPSCounter();
    }
    
    bindControlEvents() {
        // Particle count slider
        const countSlider = document.getElementById('particle-count');
        const countValue = document.getElementById('count-value');
        countSlider.addEventListener('input', (e) => {
            countValue.textContent = e.target.value;
            this.updateParticleCount(parseInt(e.target.value));
        });
        
        // Animation speed slider
        const speedSlider = document.getElementById('animation-speed');
        const speedValue = document.getElementById('speed-value');
        speedSlider.addEventListener('input', (e) => {
            speedValue.textContent = e.target.value + 'x';
            this.updateAnimationSpeed(parseFloat(e.target.value));
        });
        
        // Color mode selector
        const colorMode = document.getElementById('color-mode');
        colorMode.addEventListener('change', (e) => {
            this.updateColorMode(e.target.value);
            document.getElementById('current-mode').textContent = e.target.options[e.target.selectedIndex].text.substring(2);
        });
        
        // Explosion button
        const explosionBtn = document.getElementById('explosion-btn');
        explosionBtn.addEventListener('click', () => {
            this.triggerExplosion();
            explosionBtn.style.transform = 'scale(0.95)';
            setTimeout(() => explosionBtn.style.transform = 'scale(1)', 100);
        });
        
        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => {
            this.resetParticles();
            resetBtn.style.transform = 'scale(0.95)';
            setTimeout(() => resetBtn.style.transform = 'scale(1)', 100);
        });
    }
    
    addGlobalEffects() {
        // Add dynamic background gradient
        const gradientOverlay = document.createElement('div');
        gradientOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, 
                rgba(0, 245, 255, 0.1) 0%, 
                rgba(255, 107, 107, 0.1) 25%,
                rgba(255, 165, 0, 0.1) 50%,
                rgba(76, 205, 196, 0.1) 75%,
                rgba(155, 89, 182, 0.1) 100%);
            z-index: 0;
            pointer-events: none;
            animation: gradientShift 10s ease-in-out infinite;
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes gradientShift {
                0%, 100% { opacity: 0.1; }
                50% { opacity: 0.3; }
            }
            
            #particle-controls button:hover {
                transform: scale(1.05) !important;
            }
            
            #particle-controls input[type="range"]:hover {
                transform: scale(1.02);
            }
        `;
        document.head.appendChild(style);
        document.body.insertBefore(gradientOverlay, document.body.firstChild);
    }
    
    addKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.triggerRandomEffect();
                    break;
                case 'KeyR':
                    this.resetParticles();
                    break;
                case 'KeyE':
                    this.triggerExplosion();
                    break;
                case 'KeyC':
                    this.cycleColorMode();
                    break;
            }
        });
    }
    
    addTouchGestures() {
        let touchStartX, touchStartY;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            
            // Convert touch movement to mouse coordinates for particle interaction
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            document.dispatchEvent(mouseEvent);
        });
        
        document.addEventListener('touchend', (e) => {
            // Double tap to explode
            this.triggerExplosion();
        });
    }
    
    updateParticleCount(count) {
        document.getElementById('particle-counter').textContent = count;
        // This would need to be implemented in the particle system
    }
    
    updateAnimationSpeed(speed) {
        // This would need to be implemented in the particle system
        if (window.particleSystem) {
            window.particleSystem.animationSpeed = speed;
        }
    }
    
    updateColorMode(mode) {
        // This would need to be implemented in the particle system
        if (window.particleSystem) {
            window.particleSystem.colorMode = mode;
        }
    }
    
    triggerExplosion() {
        if (window.particleSystem) {
            window.particleSystem.explodeParticles();
        }
        
        // Add screen flash effect
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.3);
            z-index: 9999;
            pointer-events: none;
            animation: flashEffect 0.2s ease-out;
        `;
        
        const flashStyle = document.createElement('style');
        flashStyle.textContent = `
            @keyframes flashEffect {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(flashStyle);
        document.body.appendChild(flash);
        
        setTimeout(() => {
            document.body.removeChild(flash);
            document.head.removeChild(flashStyle);
        }, 200);
    }
    
    resetParticles() {
        if (window.particleSystem) {
            // Reset particle positions and velocities
            window.particleSystem.time = 0;
        }
    }
    
    triggerRandomEffect() {
        const effects = ['explosion', 'colorShift', 'speedBoost', 'gravity'];
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        
        switch(randomEffect) {
            case 'explosion':
                this.triggerExplosion();
                break;
            case 'colorShift':
                this.cycleColorMode();
                break;
            case 'speedBoost':
                this.updateAnimationSpeed(2.0);
                setTimeout(() => this.updateAnimationSpeed(1.0), 2000);
                break;
        }
    }
    
    cycleColorMode() {
        const modes = ['rainbow', 'fire', 'ocean', 'galaxy', 'neon'];
        const select = document.getElementById('color-mode');
        const currentIndex = modes.indexOf(select.value);
        const nextIndex = (currentIndex + 1) % modes.length;
        select.value = modes[nextIndex];
        select.dispatchEvent(new Event('change'));
    }
    
    startFPSCounter() {
        let lastTime = performance.now();
        let frameCount = 0;
        
        const updateFPS = () => {
            const currentTime = performance.now();
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
                document.getElementById('fps-counter').textContent = fps;
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(updateFPS);
        };
        
        requestAnimationFrame(updateFPS);
    }
}

// Initialize demo when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the particle system to initialize
    setTimeout(() => {
        new InteractiveDemo();
    }, 500);
});