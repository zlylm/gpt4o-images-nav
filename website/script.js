// 全局变量
let particleSystem = null;
let isScrolling = false;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeParticleSystem();
    initializeScrollAnimations();
    initializeNavigation();
    initializeCounters();
    initializeProgressBars();
    initializeConnectionLines();
    initializeDataFlow();
    initializeMobileMenu();
    initializeProductShowcase();
    initializeShowcaseCanvas();
    initializeStatsCanvas();
    initBusinessDynamicBackground(); // 添加核心业务动态背景
});

// 粒子系统
function initializeParticleSystem() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let connections = [];
    
    // 设置画布尺寸
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 粒子类
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.3;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(24, 144, 255, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    // 创建粒子
    function createParticles() {
        particles = [];
        const particleCount = Math.min(100, Math.floor(canvas.width * canvas.height / 10000));
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    // 绘制连接线
    function drawConnections() {
        connections = [];
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    const opacity = (120 - distance) / 120 * 0.3;
                    
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(24, 144, 255, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }
    
    // 动画循环
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        drawConnections();
        requestAnimationFrame(animate);
    }
    
    createParticles();
    animate();
    
    particleSystem = {
        particles,
        canvas,
        ctx
    };
}

// 滚动动画
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);
    
    // 观察需要动画的元素
    const animatedElements = document.querySelectorAll(
        '.business-card, .stat-card, .feature-item, .section-header'
    );
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// 导航栏交互
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!navbar) return;
    
    // 滚动时改变导航栏样式
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 22, 40, 0.98)';
        } else {
            navbar.style.background = 'rgba(10, 22, 40, 0.95)';
        }
    });
    
    // 平滑滚动到锚点
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // 更新活跃状态
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
}

// 数字计数动画
function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number');
    let hasAnimated = false;
    
    const animateCounters = () => {
        if (hasAnimated) return;
        hasAnimated = true;
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            updateCounter();
        });
    };
    
    // 当统计区域进入视口时开始动画
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
    }
}

// 进度条动画
function initializeProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    let hasAnimated = false;
    
    const animateProgressBars = () => {
        if (hasAnimated) return;
        hasAnimated = true;
        
        progressBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            setTimeout(() => {
                bar.style.width = width + '%';
            }, 500);
        });
    };
    
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateProgressBars();
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
    }
}

// IoT网络连接线动画
function initializeConnectionLines() {
    const networkContainer = document.querySelector('.iot-network');
    const connectionSvg = document.querySelector('.connection-lines');
    
    if (!networkContainer || !connectionSvg) return;
    
    const nodes = {
        central: { x: 250, y: 250 },
        light: { x: 100, y: 75 },
        farm: { x: 400, y: 75 },
        water: { x: 250, y: 425 }
    };
    
    // 创建连接线
    const connections = [
        { from: 'central', to: 'light' },
        { from: 'central', to: 'farm' },
        { from: 'central', to: 'water' }
    ];
    
    connections.forEach((conn, index) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', nodes[conn.from].x);
        line.setAttribute('y1', nodes[conn.from].y);
        line.setAttribute('x2', nodes[conn.to].x);
        line.setAttribute('y2', nodes[conn.to].y);
        line.setAttribute('stroke', 'url(#lineGradient)');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('opacity', '0.6');
        
        // 添加动画
        line.style.strokeDasharray = '10 5';
        line.style.strokeDashoffset = '0';
        line.style.animation = `dashMove 3s linear infinite`;
        line.style.animationDelay = `${index * 0.5}s`;
        
        connectionSvg.appendChild(line);
    });
    
    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes dashMove {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -15; }
        }
    `;
    document.head.appendChild(style);
}

// 解决方案架构图数据流动画
function initializeDataFlow() {
    const dataFlowSvg = document.querySelector('.data-flow');
    if (!dataFlowSvg) return;
    
    const layers = document.querySelectorAll('.arch-layer');
    const layerPositions = [];
    
    layers.forEach((layer, index) => {
        const rect = layer.getBoundingClientRect();
        const containerRect = dataFlowSvg.getBoundingClientRect();
        layerPositions.push({
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2
        });
    });
    
    // 创建数据流线条
    for (let i = 0; i < layerPositions.length - 1; i++) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', layerPositions[i].x);
        line.setAttribute('y1', layerPositions[i].y);
        line.setAttribute('x2', layerPositions[i + 1].x);
        line.setAttribute('y2', layerPositions[i + 1].y);
        line.setAttribute('stroke', 'url(#flowGradient)');
        line.setAttribute('stroke-width', '3');
        line.setAttribute('opacity', '0.7');
        
        // 添加流动动画
        line.style.strokeDasharray = '8 4';
        line.style.animation = `dataFlow 2s linear infinite`;
        line.style.animationDelay = `${i * 0.3}s`;
        
        dataFlowSvg.appendChild(line);
    }
    
    // 添加数据流动画CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes dataFlow {
            0% { stroke-dashoffset: 0; opacity: 0.3; }
            50% { opacity: 0.8; }
            100% { stroke-dashoffset: -12; opacity: 0.3; }
        }
    `;
    document.head.appendChild(style);
}

// 移动端菜单
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!mobileToggle || !navMenu) return;
    
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');
    });
}

// 产品展示区域交互
function initializeProductShowcase() {
    const showcaseTabs = document.querySelectorAll('.showcase-tab');
    const productDetails = document.querySelectorAll('.product-detail');
    
    if (showcaseTabs.length === 0) return;
    
    showcaseTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetProduct = this.getAttribute('data-product');
            
            // 移除所有活跃状态
            showcaseTabs.forEach(t => t.classList.remove('active'));
            productDetails.forEach(d => d.classList.remove('active'));
            
            // 添加当前活跃状态
            this.classList.add('active');
            const targetDetail = document.querySelector(`[data-product="${targetProduct}"]`);
            if (targetDetail) {
                setTimeout(() => {
                    targetDetail.classList.add('active');
                }, 100);
            }
        });
    });
}

// 产品展示区域背景动效
function initializeShowcaseCanvas() {
    const canvas = document.getElementById('showcaseCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 创建几何形状动画
    const shapes = [];
    const shapeCount = 8;
    
    for (let i = 0; i < shapeCount; i++) {
        shapes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 40 + 20,
            speed: Math.random() * 0.5 + 0.2,
            angle: Math.random() * Math.PI * 2,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            opacity: Math.random() * 0.3 + 0.1,
            type: Math.floor(Math.random() * 3) // 0: 圆形, 1: 三角形, 2: 六边形
        });
    }
    
    function drawShape(shape) {
        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(shape.rotation);
        ctx.globalAlpha = shape.opacity;
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, shape.size);
        gradient.addColorStop(0, 'rgba(24, 144, 255, 0.3)');
        gradient.addColorStop(0.5, 'rgba(114, 46, 209, 0.2)');
        gradient.addColorStop(1, 'rgba(24, 144, 255, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        
        if (shape.type === 0) {
            // 圆形
            ctx.beginPath();
            ctx.arc(0, 0, shape.size, 0, Math.PI * 2);
            ctx.stroke();
        } else if (shape.type === 1) {
            // 三角形
            ctx.beginPath();
            ctx.moveTo(0, -shape.size);
            ctx.lineTo(-shape.size * 0.866, shape.size * 0.5);
            ctx.lineTo(shape.size * 0.866, shape.size * 0.5);
            ctx.closePath();
            ctx.stroke();
        } else {
            // 六边形
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const x = Math.cos(angle) * shape.size;
                const y = Math.sin(angle) * shape.size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        shapes.forEach(shape => {
            // 更新位置
            shape.x += Math.cos(shape.angle) * shape.speed;
            shape.y += Math.sin(shape.angle) * shape.speed;
            shape.rotation += shape.rotationSpeed;
            
            // 边界检测
            if (shape.x < -shape.size) shape.x = canvas.width + shape.size;
            if (shape.x > canvas.width + shape.size) shape.x = -shape.size;
            if (shape.y < -shape.size) shape.y = canvas.height + shape.size;
            if (shape.y > canvas.height + shape.size) shape.y = -shape.size;
            
            drawShape(shape);
        });
        
        animationId = requestAnimationFrame(animate);
    }
    
    animate();
}

// 技术实力区域背景动效
function initializeStatsCanvas() {
    const canvas = document.getElementById('statsCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 创建数据流动画
    const dataStreams = [];
    const streamCount = 12;
    
    for (let i = 0; i < streamCount; i++) {
        dataStreams.push({
            x: Math.random() * canvas.width,
            y: -20,
            speed: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.3,
            width: Math.random() * 3 + 1,
            length: Math.random() * 100 + 50,
            delay: Math.random() * 2000
        });
    }
    
    function drawDataStream(stream) {
        const gradient = ctx.createLinearGradient(0, stream.y - stream.length, 0, stream.y);
        gradient.addColorStop(0, 'rgba(24, 144, 255, 0)');
        gradient.addColorStop(0.5, `rgba(24, 144, 255, ${stream.opacity})`);
        gradient.addColorStop(1, 'rgba(114, 46, 209, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = stream.width;
        ctx.beginPath();
        ctx.moveTo(stream.x, stream.y - stream.length);
        ctx.lineTo(stream.x, stream.y);
        ctx.stroke();
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        dataStreams.forEach(stream => {
            if (Date.now() > stream.delay) {
                stream.y += stream.speed;
                
                if (stream.y > canvas.height + stream.length) {
                    stream.y = -stream.length;
                    stream.x = Math.random() * canvas.width;
                    stream.delay = Date.now() + Math.random() * 1000;
                }
                
                drawDataStream(stream);
            }
        });
        
        animationId = requestAnimationFrame(animate);
    }
    
    animate();
}

// 核心业务区域动态背景效果
function initBusinessDynamicBackground() {
    const businessSection = document.querySelector('.business-section');
    const businessCards = document.querySelectorAll('.business-card');
    
    if (!businessSection || !businessCards.length) return;
    
    businessCards.forEach(card => {
        const businessType = card.getAttribute('data-business');
        
        card.addEventListener('mouseenter', () => {
            // 移除所有现有的背景类
            businessSection.classList.remove('smart-light-active', 'smart-farm-active', 'smart-water-active');
            
            // 添加对应的背景类
            if (businessType === 'smart-light') {
                businessSection.classList.add('smart-light-active');
            } else if (businessType === 'smart-farm') {
                businessSection.classList.add('smart-farm-active');
            } else if (businessType === 'smart-water') {
                businessSection.classList.add('smart-water-active');
            }
        });
        
        card.addEventListener('mouseleave', () => {
            // 延迟移除背景效果，让用户有时间欣赏
            setTimeout(() => {
                businessSection.classList.remove('smart-light-active', 'smart-farm-active', 'smart-water-active');
            }, 300);
        });
    });
}

// 性能优化：节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 优化滚动事件
window.addEventListener('scroll', throttle(function() {
    const scrollTop = window.pageYOffset;
    
    // 更新导航栏状态
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}, 16));