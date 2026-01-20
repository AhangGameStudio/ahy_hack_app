import bleManager from './ble-manager';
import wifiScanner from './wifi-scanner';
import deviceControl from './device-control';

class ListeningService {
  constructor() {
    this.isListening = false;
    this.store = null;
    this.scanInterval = null;
  }

  // 初始化服务，传入Redux store
  initialize(store) {
    this.store = store;
  }

  // 开始监听
  async startListening() {
    if (this.isListening) return false;
    
    this.isListening = true;
    
    try {
      // 启动BLE扫描
      await bleManager.startScan((device) => {
        // 添加设备到Redux store
        this.store.dispatch({
          type: 'device/addDevice',
          payload: device
        });
        // 自动连接并操作设备
        this.autoConnectAndOperate(device);
      });
      
      // 启动Wi-Fi扫描
      await wifiScanner.startScan((device) => {
        // 添加设备到Redux store
        this.store.dispatch({
          type: 'device/addDevice',
          payload: device
        });
        // 自动连接并操作设备
        this.autoConnectAndOperate(device);
      });
      
      // 设置定期扫描（每30秒）
      this.scanInterval = setInterval(() => {
        this.performPeriodicScan();
      }, 30000);
      
      return true;
    } catch (error) {
      console.error('Failed to start listening:', error);
      this.isListening = false;
      return false;
    }
  }

  // 停止监听
  async stopListening() {
    if (!this.isListening) return false;
    
    this.isListening = false;
    
    try {
      // 停止BLE扫描
      await bleManager.stopScan();
      // 停止Wi-Fi扫描
      await wifiScanner.stopScan();
      
      // 清除定期扫描
      if (this.scanInterval) {
        clearInterval(this.scanInterval);
        this.scanInterval = null;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to stop listening:', error);
      return false;
    }
  }

  // 自动连接并操作设备
  async autoConnectAndOperate(device) {
    try {
      // 1. 自动连接设备
      await deviceControl.connectToDevice(device);
      
      // 2. 检查设备状态
      const status = await deviceControl.getDeviceStatus(device);
      
      // 3. 这里可以添加自动操作逻辑，例如：
      // if (status && status.power === 'off') {
      //   await deviceControl.powerOnDevice(device);
      //   console.log(`自动开机: ${device.name}`);
      // }
      
      // 4. 更新设备状态
      this.store.dispatch({
        type: 'device/updateDevice',
        payload: {
          id: device.id,
          connected: true,
          status: status?.power || 'unknown'
        }
      });
      
    } catch (error) {
      console.error(`自动操作设备失败 ${device.name}:`, error);
      // 更新设备连接状态
      this.store.dispatch({
        type: 'device/updateDevice',
        payload: {
          id: device.id,
          connected: false
        }
      });
    }
  }

  // 定期扫描
  async performPeriodicScan() {
    try {
      console.log('Performing periodic scan...');
      // 重新扫描BLE设备
      await bleManager.stopScan();
      await bleManager.startScan((device) => {
        this.store.dispatch({
          type: 'device/addDevice',
          payload: device
        });
        this.autoConnectAndOperate(device);
      });
      
      // 重新扫描Wi-Fi设备
      await wifiScanner.startScan((device) => {
        this.store.dispatch({
          type: 'device/addDevice',
          payload: device
        });
        this.autoConnectAndOperate(device);
      });
    } catch (error) {
      console.error('Failed to perform periodic scan:', error);
    }
  }

  // 批量操作设备
  async batchOperateDevices(devices, action) {
    const results = [];
    
    for (const device of devices) {
      try {
        let success = false;
        
        if (action === 'powerOn') {
          success = await deviceControl.powerOnDevice(device);
        } else if (action === 'powerOff') {
          success = await deviceControl.powerOffDevice(device);
        }
        
        results.push({
          deviceId: device.id,
          success,
          action
        });
        
        // 更新设备状态
        if (success) {
          this.store.dispatch({
            type: 'device/updateDevice',
            payload: {
              id: device.id,
              status: action === 'powerOn' ? 'on' : 'off'
            }
          });
        }
        
      } catch (error) {
        console.error(`批量操作设备失败 ${device.name}:`, error);
        results.push({
          deviceId: device.id,
          success: false,
          action,
          error: error.message
        });
      }
    }
    
    return results;
  }
}

export default new ListeningService();