// 性能监控和优化工具
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            memoryUsage: 0,
            loadTime: 0,
            renderTime: 0,
            networkLatency: 0
        };
        this.isMonitoring = false;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.init();
    }

    // 初始化性能监控
    init() {
        this.createMonitorPanel();
        this.startMonitoring();
        this.optimizePerformance();
    }

    // 创建监控面板
    createMonitorPanel() {
        const panel = document.createElement('div');
        panel.id = 'performance-panel';
        panel.className = 'fixed bottom-4 right-4 glass-card p-4 text-xs z-50';
        panel.style.minWidth = '200px';
        panel.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h4 class="text-cyan-400 font-semibold">性能监控</h4>
                <button id="toggle-monitor" class="text-slate-400 hover:text-white">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="space-y-1">
                <div class="flex justify-between">
                    <span class="text-slate-300">FPS:</span>
                    <span id="fps-value" class="text-green-400">--</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-300">内存:</span>
                    <span id="memory-value" class="text-yellow-400">--</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-300">加载时间:</span>
                    <span id="load-time-value" class="text-blue-400">--</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-300">渲染时间:</span>
                    <span id="render-time-value" class="text-purple-400">--</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-300">网络延迟:</span>
                    <span id="network-latency-value" class="text-cyan-400">--</span>
                </div>
            </div>
            <div class="mt-3 pt-2 border-t border-slate-600">
                <button id="run-performance-test" class="w-full px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded text-xs transition-colors">
                    运行性能测试
                </button>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // 绑定事件
        document.getElementById('toggle-monitor').addEventListener('click', () => {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
        
        document.getElementById('run-performance-test').addEventListener('click', () => {
            this.runPerformanceTest();
        });
    }

    // 开始监控
    startMonitoring() {
        this.isMonitoring = true;
        this.monitorFPS();
        this.monitorMemory();
        this.monitorLoadTime();
        this.monitorNetworkLatency();
    }

    // 监控FPS
    monitorFPS() {
        const measureFPS = () => {
            if (!this.isMonitoring) return;
            
            this.frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - this.lastTime >= 1000) {
                this.metrics.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
                this.updateDisplay('fps-value', `${this.metrics.fps} FPS`);
                
                this.frameCount = 0;
                this.lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }

    // 监控内存使用
    monitorMemory() {
        setInterval(() => {
            if (!this.isMonitoring) return;
            
            if (performance.memory) {
                const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
                const total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
                this.metrics.memoryUsage = used;
                this.updateDisplay('memory-value', `${used}/${total} MB`);
            } else {
                this.updateDisplay('memory-value', '不支持');
            }
        }, 2000);
    }

    // 监控加载时间
    monitorLoadTime() {
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            this.metrics.loadTime = loadTime;
            this.updateDisplay('load-time-value', `${loadTime}ms`);
        });
    }

    // 监控网络延迟
    monitorNetworkLatency() {
        setInterval(() => {
            if (!this.isMonitoring) return;
            
            const startTime = performance.now();
            fetch('data:text/plain,ping')
                .then(() => {
                    const latency = Math.round(performance.now() - startTime);
                    this.metrics.networkLatency = latency;
                    this.updateDisplay('network-latency-value', `${latency}ms`);
                })
                .catch(() => {
                    this.updateDisplay('network-latency-value', '错误');
                });
        }, 5000);
    }

    // 更新显示
    updateDisplay(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    // 运行性能测试
    runPerformanceTest() {
        console.log('开始性能测试...');
        
        const testResults = {
            domNodes: document.querySelectorAll('*').length,
            eventListeners: this.countEventListeners(),
            cssRules: this.countCSSRules(),
            imageCount: document.images.length,
            scriptCount: document.scripts.length,
            styleSheetCount: document.styleSheets.length
        };
        
        // 测试渲染性能
        const renderStart = performance.now();
        this.testRenderPerformance();
        const renderEnd = performance.now();
        testResults.renderTime = Math.round(renderEnd - renderStart);
        
        // 测试内存泄漏
        this.testMemoryLeaks();
        
        // 显示测试结果
        this.showTestResults(testResults);
        
        console.log('性能测试完成:', testResults);
    }

    // 计算事件监听器数量
    countEventListeners() {
        let count = 0;
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            const listeners = getEventListeners ? getEventListeners(element) : {};
            count += Object.keys(listeners).length;
        });
        return count;
    }

    // 计算CSS规则数量
    countCSSRules() {
        let count = 0;
        for (let i = 0; i < document.styleSheets.length; i++) {
            try {
                const sheet = document.styleSheets[i];
                if (sheet.cssRules) {
                    count += sheet.cssRules.length;
                }
            } catch (e) {
                // 跨域样式表无法访问
            }
        }
        return count;
    }

    // 测试渲染性能
    testRenderPerformance() {
        // 创建大量DOM元素进行渲染测试
        const testContainer = document.createElement('div');
        testContainer.style.position = 'absolute';
        testContainer.style.top = '-9999px';
        testContainer.style.left = '-9999px';
        
        for (let i = 0; i < 1000; i++) {
            const div = document.createElement('div');
            div.className = 'glass-card';
            div.textContent = `测试元素 ${i}`;
            testContainer.appendChild(div);
        }
        
        document.body.appendChild(testContainer);
        
        // 强制重排和重绘
        testContainer.offsetHeight;
        
        // 清理测试元素
        document.body.removeChild(testContainer);
    }

    // 测试内存泄漏
    testMemoryLeaks() {
        if (performance.memory) {
            const initialMemory = performance.memory.usedJSHeapSize;
            
            // 创建一些对象来测试垃圾回收
            let testObjects = [];
            for (let i = 0; i < 10000; i++) {
                testObjects.push({
                    id: i,
                    data: new Array(100).fill(Math.random()),
                    timestamp: new Date()
                });
            }
            
            // 清理引用
            testObjects = null;
            
            // 建议垃圾回收
            if (window.gc) {
                window.gc();
            }
            
            setTimeout(() => {
                const finalMemory = performance.memory.usedJSHeapSize;
                const memoryDiff = finalMemory - initialMemory;
                console.log(`内存变化: ${memoryDiff} bytes`);
            }, 1000);
        }
    }

    // 显示测试结果
    showTestResults(results) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="glass-card p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-bold text-cyan-400 mb-4">性能测试结果</h3>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-slate-300">DOM节点数:</span>
                        <span class="text-white">${results.domNodes}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-300">事件监听器:</span>
                        <span class="text-white">${results.eventListeners}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-300">CSS规则数:</span>
                        <span class="text-white">${results.cssRules}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-300">图片数量:</span>
                        <span class="text-white">${results.imageCount}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-300">脚本数量:</span>
                        <span class="text-white">${results.scriptCount}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-300">样式表数量:</span>
                        <span class="text-white">${results.styleSheetCount}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-300">渲染时间:</span>
                        <span class="text-white">${results.renderTime}ms</span>
                    </div>
                </div>
                <div class="mt-4 pt-4 border-t border-slate-600">
                    <div class="text-xs text-slate-400 mb-3">
                        ${this.getPerformanceRecommendations(results)}
                    </div>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded transition-colors">
                        关闭
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // 获取性能建议
    getPerformanceRecommendations(results) {
        const recommendations = [];
        
        if (results.domNodes > 5000) {
            recommendations.push('DOM节点过多，建议优化DOM结构');
        }
        
        if (results.renderTime > 100) {
            recommendations.push('渲染时间较长，建议优化CSS和动画');
        }
        
        if (this.metrics.fps < 30) {
            recommendations.push('帧率较低，建议减少动画效果');
        }
        
        if (this.metrics.memoryUsage > 100) {
            recommendations.push('内存使用较高，建议检查内存泄漏');
        }
        
        return recommendations.length > 0 
            ? '建议: ' + recommendations.join('; ')
            : '性能表现良好！';
    }

    // 性能优化
    optimizePerformance() {
        // 图片懒加载
        this.implementLazyLoading();
        
        // 防抖和节流
        this.implementDebounceThrottle();
        
        // 虚拟滚动（如果需要）
        this.implementVirtualScrolling();
        
        // 内存清理
        this.implementMemoryCleanup();
    }

    // 实现图片懒加载
    implementLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    // 实现防抖和节流
    implementDebounceThrottle() {
        // 为窗口大小调整事件添加防抖
        let resizeTimeout;
        const originalResize = window.onresize;
        window.onresize = function(event) {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (originalResize) originalResize.call(this, event);
            }, 250);
        };
        
        // 为滚动事件添加节流
        let scrollTimeout;
        const originalScroll = window.onscroll;
        window.onscroll = function(event) {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    if (originalScroll) originalScroll.call(this, event);
                    scrollTimeout = null;
                }, 16); // 约60fps
            }
        };
    }

    // 实现虚拟滚动
    implementVirtualScrolling() {
        // 为大列表实现虚拟滚动
        const largeContainers = document.querySelectorAll('[data-virtual-scroll]');
        largeContainers.forEach(container => {
            // 这里可以实现虚拟滚动逻辑
            console.log('为容器实现虚拟滚动:', container);
        });
    }

    // 实现内存清理
    implementMemoryCleanup() {
        // 定期清理不需要的事件监听器和对象引用
        setInterval(() => {
            // 清理过期的缓存数据
            if (window.dashboard && window.dashboard.deviceData) {
                const now = Date.now();
                window.dashboard.deviceData = window.dashboard.deviceData.filter(device => {
                    return now - device.lastUpdate.getTime() < 300000; // 5分钟
                });
            }
            
            // 清理DOM中的临时元素
            const tempElements = document.querySelectorAll('[data-temp]');
            tempElements.forEach(element => {
                const createTime = parseInt(element.dataset.createTime);
                if (now - createTime > 60000) { // 1分钟
                    element.remove();
                }
            });
        }, 60000); // 每分钟清理一次
    }

    // 停止监控
    stopMonitoring() {
        this.isMonitoring = false;
        const panel = document.getElementById('performance-panel');
        if (panel) {
            panel.remove();
        }
    }
}

// 导出性能监控器
window.PerformanceMonitor = PerformanceMonitor;

// 自动启动性能监控（仅在开发环境）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            new PerformanceMonitor();
        }, 2000);
    });
}