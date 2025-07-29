// WebSocket 模拟器 - 用于模拟实时数据更新
class WebSocketSimulator {
    constructor() {
        this.isConnected = false;
        this.listeners = {};
        this.updateInterval = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.init();
    }

    // 初始化WebSocket模拟器
    init() {
        this.connect();
        this.startDataSimulation();
    }

    // 模拟连接
    connect() {
        console.log('正在连接WebSocket服务器...');
        
        // 模拟连接延迟
        setTimeout(() => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('WebSocket连接成功');
            
            // 触发连接成功事件
            this.emit('connected', {
                timestamp: new Date(),
                message: 'WebSocket连接已建立'
            });
            
            // 发送初始化数据
            this.sendInitialData();
        }, 1000);
    }

    // 断开连接
    disconnect() {
        this.isConnected = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('WebSocket连接已断开');
        this.emit('disconnected', {
            timestamp: new Date(),
            message: 'WebSocket连接已断开'
        });
    }

    // 重新连接
    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`尝试重新连接... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, 2000 * this.reconnectAttempts);
        } else {
            console.error('重连次数已达上限，停止重连');
            this.emit('reconnectFailed', {
                timestamp: new Date(),
                message: '重连失败，请检查网络连接'
            });
        }
    }

    // 发送初始化数据
    sendInitialData() {
        const initialData = {
            type: 'init',
            data: {
                serverTime: new Date(),
                totalDevices: 1260,
                onlineDevices: 1248,
                offlineDevices: 12,
                systemStatus: 'normal'
            }
        };
        
        this.emit('message', initialData);
    }

    // 开始数据模拟
    startDataSimulation() {
        // 每3秒发送一次实时数据更新
        this.updateInterval = setInterval(() => {
            if (this.isConnected) {
                this.sendRealtimeUpdate();
            }
        }, 3000);

        // 每10秒发送设备状态变化
        setInterval(() => {
            if (this.isConnected) {
                this.sendDeviceStatusChange();
            }
        }, 10000);

        // 每30秒发送告警信息
        setInterval(() => {
            if (this.isConnected) {
                this.sendAlertUpdate();
            }
        }, 30000);

        // 每60秒发送能耗统计更新
        setInterval(() => {
            if (this.isConnected) {
                this.sendEnergyUpdate();
            }
        }, 60000);
    }

    // 发送实时数据更新
    sendRealtimeUpdate() {
        const updateData = {
            type: 'realtime_update',
            timestamp: new Date(),
            data: {
                onlineDevices: 1248 + Math.floor(Math.random() * 10) - 5,
                offlineDevices: 12 + Math.floor(Math.random() * 6) - 3,
                currentPower: Math.floor(Math.random() * 100) + 2800,
                networkLatency: Math.floor(Math.random() * 50) + 10,
                systemLoad: Math.floor(Math.random() * 30) + 20
            }
        };
        
        this.emit('message', updateData);
    }

    // 发送设备状态变化
    sendDeviceStatusChange() {
        const deviceId = `SL-${String(Math.floor(Math.random() * 1260) + 1).padStart(3, '0')}`;
        const statuses = ['online', 'offline', 'maintenance'];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        const statusData = {
            type: 'device_status_change',
            timestamp: new Date(),
            data: {
                deviceId: deviceId,
                oldStatus: statuses[Math.floor(Math.random() * statuses.length)],
                newStatus: newStatus,
                area: ['市中心区', '开发区', '工业园区', '住宅区'][Math.floor(Math.random() * 4)],
                reason: this.getStatusChangeReason(newStatus)
            }
        };
        
        this.emit('message', statusData);
    }

    // 发送告警更新
    sendAlertUpdate() {
        const alertTypes = ['通信故障', '灯具损坏', '电源异常', '温度过高', '亮度异常'];
        const alertLevels = ['低', '中', '高', '紧急'];
        
        const alertData = {
            type: 'alert_update',
            timestamp: new Date(),
            data: {
                deviceId: `SL-${String(Math.floor(Math.random() * 1260) + 1).padStart(3, '0')}`,
                alertType: alertTypes[Math.floor(Math.random() * alertTypes.length)],
                alertLevel: alertLevels[Math.floor(Math.random() * alertLevels.length)],
                description: '设备运行参数超出正常范围',
                area: ['市中心区', '开发区', '工业园区', '住宅区'][Math.floor(Math.random() * 4)]
            }
        };
        
        this.emit('message', alertData);
    }

    // 发送能耗统计更新
    sendEnergyUpdate() {
        const energyData = {
            type: 'energy_update',
            timestamp: new Date(),
            data: {
                totalConsumption: Math.floor(Math.random() * 500) + 2500,
                hourlyConsumption: Math.floor(Math.random() * 50) + 100,
                peakHour: Math.floor(Math.random() * 24),
                efficiency: (Math.random() * 10 + 85).toFixed(1),
                costSaving: Math.floor(Math.random() * 1000) + 500
            }
        };
        
        this.emit('message', energyData);
    }

    // 获取状态变化原因
    getStatusChangeReason(status) {
        const reasons = {
            'online': ['设备重启完成', '网络连接恢复', '维护完成', '系统自检通过'],
            'offline': ['网络连接中断', '设备故障', '电源异常', '通信超时'],
            'maintenance': ['定期维护', '固件升级', '硬件检修', '参数调整']
        };
        
        const statusReasons = reasons[status] || ['未知原因'];
        return statusReasons[Math.floor(Math.random() * statusReasons.length)];
    }

    // 事件监听器
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    // 移除事件监听器
    off(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    }

    // 触发事件
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('WebSocket事件处理错误:', error);
                }
            });
        }
    }

    // 发送消息（模拟发送到服务器）
    send(message) {
        if (!this.isConnected) {
            console.warn('WebSocket未连接，无法发送消息');
            return false;
        }
        
        console.log('发送WebSocket消息:', message);
        
        // 模拟服务器响应
        setTimeout(() => {
            const response = {
                type: 'response',
                timestamp: new Date(),
                data: {
                    status: 'success',
                    message: '消息已接收',
                    originalMessage: message
                }
            };
            this.emit('message', response);
        }, 100);
        
        return true;
    }

    // 获取连接状态
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts
        };
    }

    // 模拟网络中断
    simulateNetworkError() {
        if (this.isConnected) {
            console.log('模拟网络中断...');
            this.disconnect();
            
            // 3秒后尝试重连
            setTimeout(() => {
                this.reconnect();
            }, 3000);
        }
    }

    // 发送心跳包
    sendHeartbeat() {
        if (this.isConnected) {
            const heartbeatData = {
                type: 'heartbeat',
                timestamp: new Date(),
                data: {
                    clientId: 'dashboard_client',
                    status: 'alive'
                }
            };
            
            this.emit('message', heartbeatData);
        }
    }

    // 启动心跳检测
    startHeartbeat() {
        setInterval(() => {
            this.sendHeartbeat();
        }, 30000); // 每30秒发送一次心跳
    }
}

// 导出WebSocket模拟器
window.WebSocketSimulator = WebSocketSimulator;