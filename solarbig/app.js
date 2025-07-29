// 物联网路灯可视化大屏主应用
class StreetLightDashboard {
    constructor() {
        this.charts = {};
        this.deviceData = [];
        this.mapController = null;
        this.websocket = null;
        this.init();
    }

    // 初始化应用
    // 初始化应用
    init() {
        this.updateTime();
        this.initCharts();
        this.initMap();
        this.initWebSocket();
        this.loadDeviceData();
        this.startRealTimeUpdates();
        
        // 每秒更新时间
        setInterval(() => this.updateTime(), 1000);
        
        // 每5秒更新数据
        setInterval(() => this.updateRealTimeData(), 5000);
    }

    // 更新当前时间
    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    // 初始化图表
    initCharts() {
        this.initEnergyChart();
        this.initEnergyTrendChart();
        this.initFaultChart();
    }

    // 初始化地图
    // 初始化地图
    initMap() {
        // 初始化地图控制器
        this.mapController = new MapController();
    }

    // 初始化WebSocket连接
    initWebSocket() {
        this.websocket = new WebSocketSimulator();
        
        // 监听连接成功事件
        this.websocket.on('connected', (data) => {
            console.log('WebSocket连接成功:', data);
            this.updateConnectionStatus('connected');
        });
        
        // 监听断开连接事件
        this.websocket.on('disconnected', (data) => {
            console.log('WebSocket连接断开:', data);
            this.updateConnectionStatus('disconnected');
        });
        
        // 监听消息事件
        this.websocket.on('message', (data) => {
            this.handleWebSocketMessage(data);
        });
        
        // 监听重连失败事件
        this.websocket.on('reconnectFailed', (data) => {
            console.error('WebSocket重连失败:', data);
            this.updateConnectionStatus('error');
        });
        
        // 启动心跳检测
        this.websocket.startHeartbeat();
    }

    // 处理WebSocket消息
    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'init':
                this.handleInitData(message.data);
                break;
            case 'realtime_update':
                this.handleRealtimeUpdate(message.data);
                break;
            case 'device_status_change':
                this.handleDeviceStatusChange(message.data);
                break;
            case 'alert_update':
                this.handleAlertUpdate(message.data);
                break;
            case 'energy_update':
                this.handleEnergyUpdate(message.data);
                break;
            case 'heartbeat':
                console.log('收到心跳包:', message.timestamp);
                break;
            case 'response':
                console.log('服务器响应:', message.data);
                break;
            default:
                console.log('未知消息类型:', message);
        }
    }

    // 处理初始化数据
    handleInitData(data) {
        console.log('收到初始化数据:', data);
        this.updateElement('online-devices', data.onlineDevices);
        this.updateElement('offline-devices', data.offlineDevices);
        
        const onlineRate = ((data.onlineDevices / data.totalDevices) * 100).toFixed(1);
        this.updateElement('online-rate', `${onlineRate}%`);
    }

    // 处理实时数据更新
    handleRealtimeUpdate(data) {
        console.log('收到实时数据更新:', data);
        
        // 更新设备统计
        this.animateNumber('online-devices', data.onlineDevices);
        this.animateNumber('offline-devices', data.offlineDevices);
        
        // 更新能耗显示
        const energyElements = document.querySelectorAll('.text-yellow-400');
        energyElements.forEach(element => {
            if (element.textContent && !isNaN(parseInt(element.textContent))) {
                this.animateNumber(element.id || 'energy-' + Math.random(), data.currentPower);
                element.textContent = data.currentPower.toLocaleString();
            }
        });
        
        // 更新在线率
        const total = data.onlineDevices + data.offlineDevices;
        const onlineRate = ((data.onlineDevices / total) * 100).toFixed(1);
        this.updateElement('online-rate', `${onlineRate}%`);
    }

    // 处理设备状态变化
    handleDeviceStatusChange(data) {
        console.log('设备状态变化:', data);
        
        // 添加到状态滚动条
        this.addStatusMessage({
            time: data.timestamp,
            deviceId: data.deviceId,
            status: data.newStatus,
            message: `设备 ${data.deviceId} 状态变更为${this.getStatusText(data.newStatus)} - ${data.reason}`
        });
        
        // 如果地图控制器存在，更新地图上的设备状态
        if (this.mapController) {
            this.mapController.updateSpecificDevice(data.deviceId, data.newStatus);
        }
    }

    // 处理告警更新
    handleAlertUpdate(data) {
        console.log('收到告警信息:', data);
        
        // 添加告警消息到状态滚动条
        this.addStatusMessage({
            time: data.timestamp,
            deviceId: data.deviceId,
            status: 'alert',
            message: `告警: ${data.deviceId} ${data.alertType} (${data.alertLevel}级)`
        });
        
        // 可以在这里添加弹窗提醒或声音提醒
        if (data.alertLevel === '紧急') {
            this.showUrgentAlert(data);
        }
    }

    // 处理能耗更新
    handleEnergyUpdate(data) {
        console.log('收到能耗统计更新:', data);
        
        // 更新能耗图表
        if (this.charts.energyTrend) {
            const currentData = this.charts.energyTrend.getOption().series[0].data;
            currentData.shift(); // 移除第一个数据点
            currentData.push(data.totalConsumption); // 添加新数据点
            
            this.charts.energyTrend.setOption({
                series: [{
                    data: currentData
                }]
            });
        }
    }

    // 更新连接状态
    updateConnectionStatus(status) {
        const statusIndicator = document.querySelector('.animate-pulse');
        if (statusIndicator) {
            switch (status) {
                case 'connected':
                    statusIndicator.className = 'w-3 h-3 bg-green-400 rounded-full animate-pulse';
                    break;
                case 'disconnected':
                    statusIndicator.className = 'w-3 h-3 bg-yellow-400 rounded-full animate-pulse';
                    break;
                case 'error':
                    statusIndicator.className = 'w-3 h-3 bg-red-400 rounded-full animate-pulse';
                    break;
            }
        }
    }

    // 添加状态消息
    addStatusMessage(messageData) {
        const timeStr = new Date(messageData.time).toTimeString().slice(0, 8);
        const statusColors = {
            'online': 'text-green-400',
            'offline': 'text-red-400',
            'maintenance': 'text-yellow-400',
            'alert': 'text-red-400'
        };
        
        const color = statusColors[messageData.status] || 'text-cyan-400';
        const newMessage = `<span class="${color}">[${timeStr}]</span> ${messageData.message}`;
        
        // 更新滚动消息
        const ticker = document.getElementById('status-ticker');
        if (ticker) {
            const marquee = ticker.querySelector('.animate-marquee');
            if (marquee) {
                const currentContent = marquee.innerHTML;
                marquee.innerHTML = newMessage + '<span class="mx-8"></span>' + currentContent;
            }
        }
    }

    // 显示紧急告警
    showUrgentAlert(alertData) {
        // 创建紧急告警弹窗
        const alertModal = document.createElement('div');
        alertModal.className = 'fixed inset-0 bg-red-900/50 backdrop-blur-sm z-50 flex items-center justify-center';
        alertModal.innerHTML = `
            <div class="glass-card p-6 max-w-md border-red-500/50">
                <div class="text-center">
                    <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-red-400 mb-2">紧急告警</h3>
                    <p class="text-white mb-2">设备: ${alertData.deviceId}</p>
                    <p class="text-white mb-2">类型: ${alertData.alertType}</p>
                    <p class="text-slate-300 mb-4">${alertData.description}</p>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                        确认
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(alertModal);
        
        // 3秒后自动关闭
        setTimeout(() => {
            if (alertModal.parentElement) {
                alertModal.remove();
            }
        }, 10000);
    }

    // 获取状态文本
    getStatusText(status) {
        const statusMap = {
            'online': '在线',
            'offline': '离线',
            'maintenance': '维护中'
        };
        return statusMap[status] || '未知';
    }

    // 初始化能耗图表
    initEnergyChart() {
        const chartDom = document.getElementById('energy-chart');
        if (!chartDom) return;

        const chart = echarts.init(chartDom);
        const option = {
            backgroundColor: 'transparent',
            grid: {
                left: '10%',
                right: '10%',
                top: '10%',
                bottom: '10%'
            },
            xAxis: {
                type: 'category',
                data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: '#64748b',
                    fontSize: 10
                }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { show: false },
                splitLine: { show: false }
            },
            series: [{
                data: [120, 200, 150, 80, 70, 110],
                type: 'line',
                smooth: true,
                lineStyle: {
                    color: '#06b6d4',
                    width: 2
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(6, 182, 212, 0.3)' },
                            { offset: 1, color: 'rgba(6, 182, 212, 0.05)' }
                        ]
                    }
                },
                symbol: 'circle',
                symbolSize: 4,
                itemStyle: {
                    color: '#06b6d4'
                }
            }]
        };

        chart.setOption(option);
        this.charts.energy = chart;
    }

    // 初始化能耗趋势图表
    initEnergyTrendChart() {
        const chartDom = document.getElementById('energy-trend-chart');
        if (!chartDom) return;

        const chart = echarts.init(chartDom);
        const option = {
            backgroundColor: 'transparent',
            grid: {
                left: '15%',
                right: '10%',
                top: '15%',
                bottom: '15%'
            },
            xAxis: {
                type: 'category',
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                axisLine: {
                    lineStyle: { color: '#374151' }
                },
                axisTick: { show: false },
                axisLabel: {
                    color: '#9ca3af',
                    fontSize: 11
                }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: '#9ca3af',
                    fontSize: 10
                },
                splitLine: {
                    lineStyle: {
                        color: '#374151',
                        type: 'dashed'
                    }
                }
            },
            series: [{
                data: [2800, 2900, 2750, 3100, 2950, 2600, 2847],
                type: 'bar',
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: '#fbbf24' },
                            { offset: 1, color: '#f59e0b' }
                        ]
                    }
                },
                barWidth: '60%'
            }]
        };

        chart.setOption(option);
        this.charts.energyTrend = chart;
    }

    // 初始化故障统计图表
    initFaultChart() {
        const chartDom = document.getElementById('fault-chart');
        if (!chartDom) return;

        const chart = echarts.init(chartDom);
        const option = {
            backgroundColor: 'transparent',
            legend: {
                orient: 'vertical',
                left: 'left',
                textStyle: {
                    color: '#9ca3af',
                    fontSize: 10
                }
            },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['65%', '50%'],
                data: [
                    { value: 5, name: '通信故障', itemStyle: { color: '#ef4444' } },
                    { value: 3, name: '灯具损坏', itemStyle: { color: '#f97316' } },
                    { value: 2, name: '电源异常', itemStyle: { color: '#eab308' } },
                    { value: 2, name: '其他故障', itemStyle: { color: '#6b7280' } }
                ],
                label: {
                    show: false
                },
                labelLine: {
                    show: false
                }
            }]
        };

        chart.setOption(option);
        this.charts.fault = chart;
    }

    // 加载设备数据
    loadDeviceData() {
        // 模拟设备数据
        this.deviceData = this.generateMockDeviceData();
        this.updateDeviceStats();
    }

    // 生成模拟设备数据
    generateMockDeviceData() {
        const devices = [];
        const areas = ['市中心区', '开发区', '工业园区', '住宅区'];
        
        for (let i = 1; i <= 1260; i++) {
            const device = {
                id: `SL-${String(i).padStart(3, '0')}`,
                area: areas[Math.floor(Math.random() * areas.length)],
                status: this.getRandomStatus(),
                lat: 39.9042 + (Math.random() - 0.5) * 0.1,
                lng: 116.4074 + (Math.random() - 0.5) * 0.1,
                brightness: Math.floor(Math.random() * 100),
                power: Math.floor(Math.random() * 50) + 10,
                voltage: 220 + Math.floor(Math.random() * 20) - 10,
                current: (Math.random() * 2 + 0.5).toFixed(2),
                temperature: Math.floor(Math.random() * 30) + 20,
                lastUpdate: new Date()
            };
            devices.push(device);
        }
        
        return devices;
    }

    // 获取随机状态（大部分设备正常）
    getRandomStatus() {
        const rand = Math.random();
        if (rand < 0.95) return 'online';
        if (rand < 0.98) return 'offline';
        return 'maintenance';
    }

    // 更新设备统计
    updateDeviceStats() {
        const stats = this.calculateDeviceStats();
        
        // 更新顶部统计数据
        this.updateElement('online-devices', stats.online);
        this.updateElement('offline-devices', stats.offline);
        this.updateElement('online-rate', `${stats.onlineRate}%`);
        
        // 添加数字动画效果
        this.animateNumber('online-devices', stats.online);
        this.animateNumber('offline-devices', stats.offline);
    }

    // 计算设备统计
    calculateDeviceStats() {
        const total = this.deviceData.length;
        const online = this.deviceData.filter(d => d.status === 'online').length;
        const offline = this.deviceData.filter(d => d.status === 'offline').length;
        const maintenance = this.deviceData.filter(d => d.status === 'maintenance').length;
        const onlineRate = ((online / total) * 100).toFixed(1);
        
        return { total, online, offline, maintenance, onlineRate };
    }

    // 更新元素内容
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // 数字动画效果
    animateNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    // 开始实时更新
    startRealTimeUpdates() {
        // 模拟实时数据更新
        setInterval(() => {
            this.simulateDeviceStatusChange();
            this.updateStatusTicker();
        }, 3000);
    }

    // 模拟设备状态变化
    simulateDeviceStatusChange() {
        // 更新地图上的设备状态
        if (this.mapController) {
            this.mapController.updateDeviceStatus();
            
            // 从地图获取最新的设备统计
            const mapStats = this.mapController.getDeviceStats();
            if (mapStats.total > 0) {
                this.updateElement('online-devices', mapStats.online);
                this.updateElement('offline-devices', mapStats.offline);
                this.updateElement('online-rate', `${mapStats.onlineRate}%`);
            }
        }
        
        // 原有的设备数据更新逻辑
        if (this.deviceData.length === 0) return;
        
        // 随机选择一个设备改变状态
        const randomIndex = Math.floor(Math.random() * this.deviceData.length);
        const device = this.deviceData[randomIndex];
        
        // 小概率改变状态
        if (Math.random() < 0.1) {
            const oldStatus = device.status;
            device.status = this.getRandomStatus();
            device.lastUpdate = new Date();
            
            // 如果状态发生变化，更新统计
            if (oldStatus !== device.status) {
                this.updateDeviceStats();
            }
        }
        
        // 更新设备参数
        device.brightness = Math.max(0, Math.min(100, device.brightness + (Math.random() - 0.5) * 10));
        device.power = Math.max(10, Math.min(60, device.power + (Math.random() - 0.5) * 5));
        device.temperature = Math.max(15, Math.min(50, device.temperature + (Math.random() - 0.5) * 2));
    }

    // 更新实时数据
    updateRealTimeData() {
        // 更新图表数据
        this.updateChartData();
        
        // 更新能耗显示
        const totalEnergy = Math.floor(Math.random() * 100) + 2800;
        const energyElement = document.querySelector('.text-yellow-400');
        if (energyElement && energyElement.textContent.includes('kWh')) {
            const parent = energyElement.parentElement;
            const numberElement = parent.querySelector('.text-2xl');
            if (numberElement) {
                this.animateNumber(numberElement.id || 'energy-display', totalEnergy);
            }
        }
    }

    // 更新图表数据
    updateChartData() {
        // 更新能耗图表
        if (this.charts.energy) {
            const newData = Array.from({length: 6}, () => Math.floor(Math.random() * 150) + 50);
            this.charts.energy.setOption({
                series: [{
                    data: newData
                }]
            });
        }
        
        // 更新能耗趋势图表
        if (this.charts.energyTrend) {
            const newData = Array.from({length: 7}, () => Math.floor(Math.random() * 500) + 2500);
            this.charts.energyTrend.setOption({
                series: [{
                    data: newData
                }]
            });
        }
    }

    // 更新状态滚动条
    updateStatusTicker() {
        const ticker = document.getElementById('status-ticker');
        if (!ticker) return;
        
        const messages = this.generateStatusMessages();
        const marquee = ticker.querySelector('.animate-marquee');
        
        if (marquee) {
            marquee.innerHTML = messages.join('');
        }
    }

    // 生成状态消息
    generateStatusMessages() {
        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 8);
        
        const messages = [
            `<span class="text-green-400">[${timeStr}]</span> 设备 SL-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')} 状态正常`,
            `<span class="mx-8 text-yellow-400">[${timeStr}]</span> 设备 SL-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')} 开始维护模式`,
            `<span class="mx-8 text-blue-400">[${timeStr}]</span> ${['中山路段', '解放路段', '人民路段', '建设路段'][Math.floor(Math.random() * 4)]}亮度调节完成`,
            `<span class="mx-8 text-cyan-400">[${timeStr}]</span> 系统自检完成，所有设备运行正常`
        ];
        
        // 偶尔添加故障消息
        if (Math.random() < 0.3) {
            messages.push(`<span class="mx-8 text-red-400">[${timeStr}]</span> 设备 SL-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')} 通信异常`);
        }
        
        return messages;
    }

    // 处理窗口大小变化
    handleResize() {
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.resize) {
                chart.resize();
            }
        });
    }
}

// 设备详情弹窗类
class DeviceDetailModal {
    constructor() {
        this.isVisible = false;
        this.currentDevice = null;
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
    }

    // 创建弹窗HTML
    createModal() {
        const modalHTML = `
            <div id="device-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div class="p-6">
                            <!-- 弹窗头部 -->
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-2xl font-bold text-cyan-400">设备详情</h2>
                                <button id="close-modal" class="text-slate-400 hover:text-white transition-colors">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            
                            <!-- 设备基础信息 -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div class="glass-card p-4">
                                    <h3 class="text-lg font-semibold mb-4 text-cyan-400">基础信息</h3>
                                    <div class="space-y-3">
                                        <div class="flex justify-between">
                                            <span class="text-slate-300">设备编号</span>
                                            <span id="device-id" class="text-white font-mono">-</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-300">所属区域</span>
                                            <span id="device-area" class="text-white">-</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-300">设备状态</span>
                                            <span id="device-status" class="status-badge">-</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-300">最后更新</span>
                                            <span id="device-update" class="text-white">-</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="glass-card p-4">
                                    <h3 class="text-lg font-semibold mb-4 text-cyan-400">实时参数</h3>
                                    <div class="space-y-3">
                                        <div class="flex justify-between">
                                            <span class="text-slate-300">亮度等级</span>
                                            <span id="device-brightness" class="text-yellow-400 font-bold">-</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-300">功率消耗</span>
                                            <span id="device-power" class="text-green-400 font-bold">-</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-300">工作电压</span>
                                            <span id="device-voltage" class="text-blue-400 font-bold">-</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-300">工作电流</span>
                                            <span id="device-current" class="text-purple-400 font-bold">-</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 远程控制面板 -->
                            <div class="glass-card p-4 mb-6">
                                <h3 class="text-lg font-semibold mb-4 text-cyan-400">远程控制</h3>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div class="text-center">
                                        <label class="block text-sm text-slate-300 mb-2">设备开关</label>
                                        <button id="toggle-device" class="px-6 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors">
                                            开启
                                        </button>
                                    </div>
                                    <div class="text-center">
                                        <label class="block text-sm text-slate-300 mb-2">亮度调节</label>
                                        <input type="range" id="brightness-slider" min="0" max="100" value="50" 
                                               class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
                                    </div>
                                    <div class="text-center">
                                        <label class="block text-sm text-slate-300 mb-2">定时设置</label>
                                        <button class="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
                                            设置定时
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 历史数据图表 -->
                            <div class="glass-card p-4">
                                <h3 class="text-lg font-semibold mb-4 text-cyan-400">历史数据</h3>
                                <div id="device-history-chart" class="h-64"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // 绑定事件
    bindEvents() {
        const modal = document.getElementById('device-modal');
        const closeBtn = document.getElementById('close-modal');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hide();
                }
            });
        }
    }

    // 显示弹窗
    show(device) {
        this.currentDevice = device;
        this.updateContent();
        
        const modal = document.getElementById('device-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.isVisible = true;
        }
    }

    // 隐藏弹窗
    hide() {
        const modal = document.getElementById('device-modal');
        if (modal) {
            modal.classList.add('hidden');
            this.isVisible = false;
        }
    }

    // 更新弹窗内容
    updateContent() {
        if (!this.currentDevice) return;
        
        const device = this.currentDevice;
        
        // 更新基础信息
        this.updateElement('device-id', device.id);
        this.updateElement('device-area', device.area);
        this.updateElement('device-update', device.lastUpdate.toLocaleString('zh-CN'));
        
        // 更新状态标签
        const statusElement = document.getElementById('device-status');
        if (statusElement) {
            statusElement.textContent = this.getStatusText(device.status);
            statusElement.className = `status-badge ${device.status}`;
        }
        
        // 更新实时参数
        this.updateElement('device-brightness', `${device.brightness}%`);
        this.updateElement('device-power', `${device.power}W`);
        this.updateElement('device-voltage', `${device.voltage}V`);
        this.updateElement('device-current', `${device.current}A`);
        
        // 初始化历史数据图表
        this.initHistoryChart();
    }

    // 更新元素内容
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // 获取状态文本
    getStatusText(status) {
        const statusMap = {
            'online': '在线',
            'offline': '离线',
            'maintenance': '维护中'
        };
        return statusMap[status] || '未知';
    }

    // 初始化历史数据图表
    initHistoryChart() {
        const chartDom = document.getElementById('device-history-chart');
        if (!chartDom) return;
        
        const chart = echarts.init(chartDom);
        const option = {
            backgroundColor: 'transparent',
            grid: {
                left: '10%',
                right: '10%',
                top: '15%',
                bottom: '15%'
            },
            xAxis: {
                type: 'category',
                data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                axisLine: {
                    lineStyle: { color: '#374151' }
                },
                axisLabel: {
                    color: '#9ca3af'
                }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                axisLabel: {
                    color: '#9ca3af'
                },
                splitLine: {
                    lineStyle: {
                        color: '#374151',
                        type: 'dashed'
                    }
                }
            },
            series: [{
                name: '功率',
                data: [30, 45, 35, 50, 45, 40, 35],
                type: 'line',
                smooth: true,
                lineStyle: {
                    color: '#10b981',
                    width: 2
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                            { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
                        ]
                    }
                }
            }]
        };
        
        chart.setOption(option);
    }
}

// 应用初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化主应用
    const dashboard = new StreetLightDashboard();
    
    // 初始化设备详情弹窗
    const deviceModal = new DeviceDetailModal();
    
    // 窗口大小变化处理
    window.addEventListener('resize', () => {
        dashboard.handleResize();
    });
    
    // 全局变量，供其他脚本使用
    window.dashboard = dashboard;
    window.deviceModal = deviceModal;
    
    console.log('物联网路灯可视化大屏系统初始化完成');
});