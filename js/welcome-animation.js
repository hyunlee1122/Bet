// Welcome Animation Controller
class WelcomeAnimation {
    constructor() {
        this.isShown = false;
        this.init();
    }
    
    init() {
        // Wait for particle system to load
        setTimeout(() => {
            this.showWelcomeMessage();
        }, 1000);
    }
    
    showWelcomeMessage() {
        if (this.isShown) return;
        this.isShown = true;
        
        const welcomeOverlay = document.createElement('div');
        welcomeOverlay.id = 'welcome-overlay';
        welcomeOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            animation: fadeIn 1s ease-in-out forwards;
        `;
        
        const welcomeContent = document.createElement('div');
        welcomeContent.style.cssText = `
            text-align: center;
            color: white;
            font-family: 'Inter', sans-serif;
            max-width: 600px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            transform: translateY(30px);
            animation: slideUp 1s ease-out 0.5s forwards;
            opacity: 0;
        `;
        
        welcomeContent.innerHTML = `
            <h1 style="margin: 0 0 20px 0; font-size: 3em; background: linear-gradient(45deg, #00f5ff, #ff6b6b, #ffa500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                ✨ Welcome to the Future ✨
            </h1>
            <p style="font-size: 1.2em; margin-bottom: 30px; line-height: 1.6; opacity: 0.9;">
                Experience an interactive 3D particle universe powered by cutting-edge WebGL technology.
                Move your mouse, click anywhere, and use the controls to create your own cosmic masterpiece!
            </p>
            <div style="display: flex; gap: 20px; justify-content: center; margin-bottom: 30px;">
                <div style="padding: 15px; background: rgba(0, 245, 255, 0.2); border-radius: 10px; border: 1px solid rgba(0, 245, 255, 0.3);">
                    <div style="font-size: 2em; margin-bottom: 10px;">🖱️</div>
                    <div style="font-size: 0.9em;">Mouse Control</div>
                </div>
                <div style="padding: 15px; background: rgba(255, 107, 107, 0.2); border-radius: 10px; border: 1px solid rgba(255, 107, 107, 0.3);">
                    <div style="font-size: 2em; margin-bottom: 10px;">💥</div>
                    <div style="font-size: 0.9em;">Click to Explode</div>
                </div>
                <div style="padding: 15px; background: rgba(255, 165, 0, 0.2); border-radius: 10px; border: 1px solid rgba(255, 165, 0, 0.3);">
                    <div style="font-size: 2em; margin-bottom: 10px;">⌨️</div>
                    <div style="font-size: 0.9em;">Keyboard Shortcuts</div>
                </div>
            </div>
            <button id="start-experience" style="
                padding: 15px 40px;
                font-size: 1.2em;
                background: linear-gradient(45deg, #00f5ff, #4ecdc4);
                border: none;
                border-radius: 50px;
                color: white;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 10px 30px rgba(0, 245, 255, 0.3);
                text-transform: uppercase;
                letter-spacing: 1px;
            ">
                🚀 Start Experience
            </button>
        `;
        
        welcomeOverlay.appendChild(welcomeContent);
        document.body.appendChild(welcomeOverlay);
        
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { 
                    transform: translateY(30px); 
                    opacity: 0; 
                }
                to { 
                    transform: translateY(0); 
                    opacity: 1; 
                }
            }
            
            #start-experience:hover {
                transform: translateY(-3px);
                box-shadow: 0 15px 40px rgba(0, 245, 255, 0.5);
                background: linear-gradient(45deg, #4ecdc4, #00f5ff);
            }
            
            #start-experience:active {
                transform: translateY(-1px);
            }
        `;
        document.head.appendChild(style);
        
        // Add event listeners
        document.getElementById('start-experience').addEventListener('click', () => {
            this.hideWelcomeMessage();
        });
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (document.getElementById('welcome-overlay')) {
                this.hideWelcomeMessage();
            }
        }, 10000);
        
        // Hide on any key press
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('welcome-overlay')) {
                this.hideWelcomeMessage();
            }
        }, { once: true });
    }
    
    hideWelcomeMessage() {
        const overlay = document.getElementById('welcome-overlay');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.5s ease-out forwards';
            
            const fadeOutStyle = document.createElement('style');
            fadeOutStyle.textContent = `
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(fadeOutStyle);
            
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                document.head.removeChild(fadeOutStyle);
                
                // Trigger a welcome explosion
                if (window.particleSystem) {
                    window.particleSystem.explodeParticles();
                }
            }, 500);
        }
    }
}

// Initialize welcome animation
document.addEventListener('DOMContentLoaded', () => {
    new WelcomeAnimation();
});