// ================================================
// VTuber Studio - Particles & Visual Effects
// ================================================

'use strict';

class ParticleSystem {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas not found:', canvasId);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.mouse = { x: null, y: null, radius: 100 };
        
        // Default options
        this.options = {
            particleCount: 100,
            particleSize: 2,
            particleColor: '#6C63FF',
            particleSpeed: 0.5,
            connectDistance: 150,
            enableMouseInteraction: true,
            enableConnections: true,
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.createParticles();
        this.setupEventListeners();
        this.animate();
        
        console.log('✨ Particle system initialized');
    }
    
    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    
    createParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.options.particleCount; i++) {
            this.particles.push(new Particle(this));
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createParticles();
        });
        
        if (this.options.enableMouseInteraction) {
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            });
            
            this.canvas.addEventListener('mouseleave', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections
        if (this.options.enableConnections) {
            this.drawConnections();
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.options.connectDistance) {
                    const opacity = 1 - (distance / this.options.connectDistance);
                    this.ctx.strokeStyle = this.hexToRgba(this.options.particleColor, opacity * 0.3);
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.particles = [];
    }
}

class Particle {
    constructor(system) {
        this.system = system;
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * this.system.canvas.width;
        this.y = Math.random() * this.system.canvas.height;
        this.vx = (Math.random() - 0.5) * this.system.options.particleSpeed;
        this.vy = (Math.random() - 0.5) * this.system.options.particleSpeed;
        this.size = Math.random() * this.system.options.particleSize + 1;
    }
    
    update() {
        // Move particle
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges
        if (this.x < 0 || this.x > this.system.canvas.width) {
            this.vx *= -1;
        }
        if (this.y < 0 || this.y > this.system.canvas.height) {
            this.vy *= -1;
        }
        
        // Mouse interaction
        if (this.system.mouse.x !== null && this.system.mouse.y !== null) {
            const dx = this.system.mouse.x - this.x;
            const dy = this.system.mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.system.mouse.radius) {
                const force = (this.system.mouse.radius - distance) / this.system.mouse.radius;
                const angle = Math.atan2(dy, dx);
                this.vx -= Math.cos(angle) * force * 0.5;
                this.vy -= Math.sin(angle) * force * 0.5;
            }
        }
        
        // Apply friction
        this.vx *= 0.99;
        this.vy *= 0.99;
        
        // Keep minimum speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed < 0.1) {
            this.vx = (Math.random() - 0.5) * this.system.options.particleSpeed;
            this.vy = (Math.random() - 0.5) * this.system.options.particleSpeed;
        }
    }
    
    draw() {
        this.system.ctx.fillStyle = this.system.options.particleColor;
        this.system.ctx.beginPath();
        this.system.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.system.ctx.fill();
    }
}

// ================================================
// Floating Particles (Simpler version)
// ================================================

class FloatingParticles {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.options = {
            count: 50,
            colors: ['#6C63FF', '#FF6B9D', '#FFC947'],
            minSize: 2,
            maxSize: 6,
            speed: 20, // seconds
            ...options
        };
        
        this.init();
    }
    
    init() {
        for (let i = 0; i < this.options.count; i++) {
            this.createParticle();
        }
        
        console.log('✨ Floating particles initialized');
    }
    
    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * (this.options.maxSize - this.options.minSize) + this.options.minSize;
        const color = this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * this.options.speed;
        const duration = this.options.speed + Math.random() * 10;
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${left}%;
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
        `;
        
        this.container.appendChild(particle);
    }
}

// ================================================
// Star Field Effect
// ================================================

class StarField {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        
        this.options = {
            starCount: 200,
            speed: 0.5,
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.createStars();
        this.animate();
        
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createStars();
        });
        
        console.log('⭐ Star field initialized');
    }
    
    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    
    createStars() {
        this.stars = [];
        
        for (let i = 0; i < this.options.starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2,
                speed: Math.random() * this.options.speed + 0.1,
                opacity: Math.random()
            });
        }
    }
    
    animate() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.stars.forEach(star => {
            // Twinkle
            star.opacity += (Math.random() - 0.5) * 0.1;
            star.opacity = Math.max(0, Math.min(1, star.opacity));
            
            // Draw star
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
            
            // Move star
            star.y += star.speed;
            
            // Reset if out of bounds
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// ================================================
// Confetti Effect
// ================================================

class ConfettiEffect {
    constructor(containerId) {
        this.container = document.getElementById(containerId) || document.body;
        this.confetti = [];
    }
    
    burst(count = 50) {
        const colors = ['#6C63FF', '#FF6B9D', '#FFC947', '#4ECDC4', '#95E1D3'];
        
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                animation-duration: ${Math.random() * 2 + 1}s;
                animation-delay: ${Math.random() * 0.5}s;
            `;
            
            this.container.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }
        
        console.log('🎉 Confetti burst!');
    }
}

// ================================================
// Auto-initialize
// ================================================

let particleSystem = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize main particle system if canvas exists
    const particlesCanvas = document.getElementById('particles-canvas');
    if (particlesCanvas) {
        particleSystem = new ParticleSystem('particles-canvas', {
            particleCount: 80,
            particleColor: '#6C63FF',
            particleSpeed: 0.5,
            connectDistance: 120,
            enableMouseInteraction: true,
            enableConnections: true
        });
    }
    
    // Initialize floating particles
    const floatingContainer = document.querySelector('.floating-particles');
    if (floatingContainer && !floatingContainer.hasChildNodes()) {
        new FloatingParticles('floating-particles', {
            count: 30,
            colors: ['#6C63FF', '#FF6B9D', '#FFC947']
        });
    }
});

// ================================================
// Export
// ================================================

window.ParticleSystem = ParticleSystem;
window.FloatingParticles = FloatingParticles;
window.StarField = StarField;
window.ConfettiEffect = ConfettiEffect;

console.log('✅ Particles module loaded (Full Version)');
