import { BleManager } from 'react-native-ble-plx';
import { Platform } from 'react-native';

class BLEManagerService {
  constructor() {
    this.manager = new BleManager();
    this.peripheralFoundCallback = null;
    this.isScanning = false;
    this.initialize();
  }

  initialize() {
    // Set up listeners for BLE events
    this.manager.onStateChange((state) => {
      console.log('BLE State:', state);
    }, true);
  }

  async requestPermissions() {
    if (Platform.OS === 'android') {
      // Android specific permissions handled by react-native-ble-plx
    }
    return true;
  }

  async startScan(callback) {
    try {
      this.peripheralFoundCallback = callback;
      this.isScanning = true;

      await this.manager.startDeviceScan(null, null, this.handlePeripheralFound);
      return true;
    } catch (error) {
      console.error('Failed to start BLE scan:', error);
      this.isScanning = false;
      return false;
    }
  }

  handlePeripheralFound = (error, device) => {
    if (error) {
      console.error('BLE Scan Error:', error);
      this.stopScan();
      return;
    }

    if (device && this.peripheralFoundCallback) {
      const deviceInfo = {
        id: device.id,
        name: device.name || 'Unknown BLE Device',
        type: 'ble',
        rssi: device.rssi,
        connected: device.isConnected,
        macAddress: Platform.OS === 'android' ? device.id : null,
      };
      this.peripheralFoundCallback(deviceInfo);
    }
  };

  async stopScan() {
    try {
      await this.manager.stopDeviceScan();
      this.isScanning = false;
      return true;
    } catch (error) {
      console.error('Failed to stop BLE scan:', error);
      return false;
    }
  }

  async connectToDevice(deviceId) {
    try {
      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      return device;
    } catch (error) {
      console.error('Failed to connect to BLE device:', error);
      return null;
    }
  }

  async disconnectFromDevice(deviceId) {
    try {
      await this.manager.cancelDeviceConnection(deviceId);
      return true;
    } catch (error) {
      console.error('Failed to disconnect from BLE device:', error);
      return false;
    }
  }

  async sendCommand(deviceId, serviceUUID, characteristicUUID, command) {
    try {
      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      await device.writeCharacteristicWithResponseForService(
        serviceUUID,
        characteristicUUID,
        command
      );
      return true;
    } catch (error) {
      console.error('Failed to send BLE command:', error);
      return false;
    }
  }
}

export default new BLEManagerService();