// 地图监控组件
class MapController {
    constructor() {
        this.map = null;
        this.markers = [];
        this.deviceData = [];
        this.init();
    }

    // 初始化地图
    init() {
        this.initSimulatedMap();
        this.bindMapControls();
    }

    // 初始化模拟地图（不依赖腾讯地图API）
    initSimulatedMap() {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;

        // 创建模拟地图界面
        mapContainer.innerHTML = `
            <div class="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
                <!-- 网格背景 -->
                <div class="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#06b6d4" stroke-width="0.5"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
                
                <!-- 地图内容区域 -->
                <div id="map-content" class="relative w-full h-full">
                    <!-- 模拟街道 -->
                    <svg class="absolute inset-0 w-full h-full" viewBox="0 0 800 600">
                        <!-- 主要道路 -->
                        <path d="M 0 200 L 800 200" stroke="#374151" stroke-width="8" opacity="0.8"/>
                        <path d="M 0 400 L 800 400" stroke="#374151" stroke-width="8" opacity="0.8"/>
                        <path d="M 200 0 L 200 600" stroke="#374151" stroke-width="6" opacity="0.8"/>
                        <path d="M 400 0 L 400 600" stroke="#374151" stroke-width="6" opacity="0.8"/>
                        <path d="M 600 0 L 600 600" stroke="#374151" stroke-width="6" opacity="0.8"/>
                        
                        <!-- 次要道路 -->
                        <path d="M 0 100 L 800 100" stroke="#4b5563" stroke-width="4" opacity="0.6"/>
                        <path d="M 0 300 L 800 300" stroke="#4b5563" stroke-width="4" opacity="0.6"/>
                        <path d="M 0 500 L 800 500" stroke="#4b5563" stroke-width="4" opacity="0.6"/>
                        <path d="M 100 0 L 100 600" stroke="#4b5563" stroke-width="3" opacity="0.6"/>
                        <path d="M 300 0 L 300 600" stroke="#4b5563" stroke-width="3" opacity="0.6"/>
                        <path d="M 500 0 L 500 600" stroke="#4b5563" stroke-width="3" opacity="0.6"/>
                        <path d="M 700 0 L 700 600" stroke="#4b5563" stroke-width="3" opacity="0.6"/>
                    </svg>
                    
                    <!-- 设备标记容器 -->
                    <div id="device-markers" class="absolute inset-0"></div>
                    
                    <!-- 区域标签 -->
                    <div class="absolute top-4 left-4 space-y-2">
                        <div class="glass-card px-3 py-1 text-sm">
                            <span class="text-cyan-400">●</span>
                            <span class="text-white ml-2">市中心区</span>
                        </div>
                    </div>
                    
                    <div class="absolute top-4 right-20 space-y-2">
                        <div class="glass-card px-3 py-1 text-sm">
                            <span class="text-green-400">●</span>
                            <span class="text-white ml-2">开发区</span>
                        </div>
                    </div>
                    
                    <div class="absolute bottom-4 left-4 space-y-2">
                        <div class="glass-card px-3 py-1 text-sm">
                            <span class="text-yellow-400">●</span>
                            <span class="text-white ml-2">工业园区</span>
                        </div>
                    </div>
                    
                    <div class="absolute bottom-4 right-20 space-y-2">
                        <div class="glass-card px-3 py-1 text-sm">
                            <span class="text-purple-400">●</span>
                            <span class="text-white ml-2">住宅区</span>
                        </div>
                    </div>
                </div>
                
                <!-- 地图缩放控制 -->
                <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div class="glass-card flex items-center space-x-2 px-4 py-2">
                        <button id="zoom-out" class="text-slate-400 hover:text-white transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                            </svg>
                        </button>
                        <span id="zoom-level" class="text-cyan-400 font-mono text-sm">100%</span>
                        <button id="zoom-in" class="text-slate-400 hover:text-white transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 生成设备标记
        this.generateDeviceMarkers();
        
        // 绑定缩放控制
        this.bindZoomControls();
    }

    // 生成设备标记
    generateDeviceMarkers() {
        const markersContainer = document.getElementById('device-markers');
        if (!markersContainer) return;

        // 清空现有标记
        markersContainer.innerHTML = '';

        // 生成模拟设备位置
        const devices = this.generateDevicePositions();
        
        devices.forEach((device, index) => {
            const marker = this.createDeviceMarker(device, index);
            markersContainer.appendChild(marker);
        });

        this.deviceData = devices;
    }

    // 生成设备位置数据
    generateDevicePositions() {
        const devices = [];
        const areas = [
            { name: '市中心区', color: '#06b6d4', bounds: { x: [50, 350], y: [50, 250] } },
            { name: '开发区', color: '#10b981', bounds: { x: [450, 750], y: [50, 250] } },
            { name: '工业园区', color: '#f59e0b', bounds: { x: [50, 350], y: [350, 550] } },
            { name: '住宅区', color: '#8b5cf6', bounds: { x: [450, 750], y: [350, 550] } }
        ];

        areas.forEach((area, areaIndex) => {
            const deviceCount = Math.floor(Math.random() * 20) + 15; // 每个区域15-35个设备
            
            for (let i = 0; i < deviceCount; i++) {
                const x = Math.random() * (area.bounds.x[1] - area.bounds.x[0]) + area.bounds.x[0];
                const y = Math.random() * (area.bounds.y[1] - area.bounds.y[0]) + area.bounds.y[0];
                
                const device = {
                    id: `SL-${String(areaIndex * 100 + i + 1).padStart(3, '0')}`,
                    area: area.name,
                    areaColor: area.color,
                    x: x,
                    y: y,
                    status: this.getRandomStatus(),
                    brightness: Math.floor(Math.random() * 100),
                    power: Math.floor(Math.random() * 50) + 10,
                    voltage: 220 + Math.floor(Math.random() * 20) - 10,
                    current: (Math.random() * 2 + 0.5).toFixed(2),
                    temperature: Math.floor(Math.random() * 30) + 20,
                    lastUpdate: new Date()
                };
                
                devices.push(device);
            }
        });

        return devices;
    }

    // 获取随机设备状态
    getRandomStatus() {
        const rand = Math.random();
        if (rand < 0.92) return 'online';
        if (rand < 0.97) return 'offline';
        return 'maintenance';
    }

    // 创建设备标记
    createDeviceMarker(device, index) {
        const marker = document.createElement('div');
        marker.className = 'absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer';
        marker.style.left = `${(device.x / 800) * 100}%`;
        marker.style.top = `${(device.y / 600) * 100}%`;
        
        const statusColors = {
            'online': '#10b981',
            'offline': '#ef4444',
            'maintenance': '#f59e0b'
        };
        
        const color = statusColors[device.status];
        const isBlinking = device.status === 'offline';
        
        marker.innerHTML = `
            <div class="relative">
                <div class="w-3 h-3 rounded-full ${isBlinking ? 'animate-pulse' : ''}" 
                     style="background-color: ${color}; box-shadow: 0 0 10px ${color};">
                </div>
                <div class="absolute inset-0 w-3 h-3 rounded-full animate-ping" 
                     style="background-color: ${color}; opacity: 0.3;">
                </div>
            </div>
        `;
        
        // 添加点击事件
        marker.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDeviceTooltip(device, e.currentTarget);
        });
        
        // 添加悬停效果
        marker.addEventListener('mouseenter', (e) => {
            this.showQuickInfo(device, e.currentTarget);
        });
        
        marker.addEventListener('mouseleave', () => {
            this.hideQuickInfo();
        });
        
        return marker;
    }

    // 显示设备快速信息
    showQuickInfo(device, element) {
        // 移除现有的快速信息
        this.hideQuickInfo();
        
        const tooltip = document.createElement('div');
        tooltip.id = 'quick-info-tooltip';
        tooltip.className = 'absolute z-50 glass-card p-3 text-sm whitespace-nowrap';
        tooltip.style.left = '20px';
        tooltip.style.top = '-10px';
        
        const statusText = {
            'online': '在线',
            'offline': '离线',
            'maintenance': '维护中'
        };
        
        const statusColor = {
            'online': 'text-green-400',
            'offline': 'text-red-400',
            'maintenance': 'text-yellow-400'
        };
        
        tooltip.innerHTML = `
            <div class="space-y-1">
                <div class="font-semibold text-cyan-400">${device.id}</div>
                <div class="text-slate-300">${device.area}</div>
                <div class="${statusColor[device.status]}">${statusText[device.status]}</div>
                <div class="text-slate-400 text-xs">点击查看详情</div>
            </div>
        `;
        
        element.appendChild(tooltip);
    }

    // 隐藏快速信息
    hideQuickInfo() {
        const tooltip = document.getElementById('quick-info-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // 显示设备详情提示
    showDeviceTooltip(device, element) {
        // 如果存在设备详情弹窗，则显示
        if (window.deviceModal) {
            window.deviceModal.show(device);
        } else {
            // 否则显示简单的提示信息
            alert(`设备信息：\n设备编号：${device.id}\n所属区域：${device.area}\n设备状态：${device.status}\n亮度：${device.brightness}%\n功率：${device.power}W`);
        }
    }

    // 绑定地图控制按钮
    bindMapControls() {
        const filterButtons = document.querySelectorAll('.glass-card button');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const buttonText = e.target.textContent.trim();
                this.filterDevices(buttonText);
                
                // 更新按钮状态
                filterButtons.forEach(btn => btn.classList.remove('bg-cyan-500/40'));
                e.target.classList.add('bg-cyan-500/40');
            });
        });
    }

    // 绑定缩放控制
    bindZoomControls() {
        const zoomIn = document.getElementById('zoom-in');
        const zoomOut = document.getElementById('zoom-out');
        const zoomLevel = document.getElementById('zoom-level');
        const mapContent = document.getElementById('map-content');
        
        let currentZoom = 1;
        
        if (zoomIn) {
            zoomIn.addEventListener('click', () => {
                currentZoom = Math.min(currentZoom + 0.2, 2);
                this.updateZoom(mapContent, zoomLevel, currentZoom);
            });
        }
        
        if (zoomOut) {
            zoomOut.addEventListener('click', () => {
                currentZoom = Math.max(currentZoom - 0.2, 0.5);
                this.updateZoom(mapContent, zoomLevel, currentZoom);
            });
        }
    }

    // 更新缩放
    updateZoom(mapContent, zoomLevel, zoom) {
        if (mapContent) {
            mapContent.style.transform = `scale(${zoom})`;
            mapContent.style.transformOrigin = 'center center';
        }
        
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
        }
    }

    // 过滤设备显示
    filterDevices(filterType) {
        const markers = document.querySelectorAll('#device-markers > div');
        
        markers.forEach((marker, index) => {
            const device = this.deviceData[index];
            if (!device) return;
            
            let shouldShow = true;
            
            switch (filterType) {
                case '正常设备':
                    shouldShow = device.status === 'online';
                    break;
                case '故障设备':
                    shouldShow = device.status === 'offline';
                    break;
                case '维护中':
                    shouldShow = device.status === 'maintenance';
                    break;
                case '全部设备':
                default:
                    shouldShow = true;
                    break;
            }
            
            marker.style.display = shouldShow ? 'block' : 'none';
        });
    }

    // 更新设备状态
    updateDeviceStatus() {
        this.deviceData.forEach((device, index) => {
            // 小概率改变设备状态
            if (Math.random() < 0.02) {
                device.status = this.getRandomStatus();
                device.lastUpdate = new Date();
                
                // 更新对应的标记
                const markers = document.querySelectorAll('#device-markers > div');
                if (markers[index]) {
                    const marker = markers[index];
                    const statusColors = {
                        'online': '#10b981',
                        'offline': '#ef4444',
                        'maintenance': '#f59e0b'
                    };
                    
                    const color = statusColors[device.status];
                    const isBlinking = device.status === 'offline';
                    const dot = marker.querySelector('div > div:first-child');
                    const ping = marker.querySelector('div > div:last-child');
                    
                    if (dot) {
                        dot.style.backgroundColor = color;
                        dot.style.boxShadow = `0 0 10px ${color}`;
                        dot.className = `w-3 h-3 rounded-full ${isBlinking ? 'animate-pulse' : ''}`;
                    }
                    
                    if (ping) {
                        ping.style.backgroundColor = color;
                    }
                }
            }
        });
    }

    // 获取设备统计数据
    getDeviceStats() {
        const total = this.deviceData.length;
        const online = this.deviceData.filter(d => d.status === 'online').length;
        const offline = this.deviceData.filter(d => d.status === 'offline').length;
        const maintenance = this.deviceData.filter(d => d.status === 'maintenance').length;
        const onlineRate = total > 0 ? ((online / total) * 100).toFixed(1) : '0.0';
        
        return { total, online, offline, maintenance, onlineRate };
    }
}

// 导出地图控制器
window.MapController = MapController;