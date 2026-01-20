import bleManager from './ble-manager';
import wifiScanner from './wifi-scanner';

class DeviceControlService {
  constructor() {
    this.securityKey = 'device-control-app-secret-key'; // In real app, this should be securely stored
  }

  // Generate authentication token
  generateAuthToken() {
    // Simple token generation for demo purposes
    return btoa(`${this.securityKey}-${Date.now()}`);
  }

  // Verify device authentication
  verifyDeviceAuth(deviceId, token) {
    // Simple verification for demo purposes
    const decoded = atob(token);
    return decoded.startsWith(this.securityKey);
  }

  // Encrypt command data
  encryptCommand(command) {
    // Simple encryption for demo purposes
    return btoa(JSON.stringify(command));
  }

  // Decrypt command data
  decryptCommand(encryptedCommand) {
    // Simple decryption for demo purposes
    return JSON.parse(atob(encryptedCommand));
  }

  // Send power on command to device
  async powerOnDevice(device) {
    try {
      const command = {
        action: 'powerOn',
        token: this.generateAuthToken(),
        timestamp: Date.now(),
      };

      if (device.type === 'ble') {
        // BLE specific command
        const encryptedCommand = this.encryptCommand(command);
        // Use default service and characteristic UUIDs (should be configurable)
        const serviceUUID = '180A';
        const characteristicUUID = '2A57';
        return await bleManager.sendCommand(
          device.id,
          serviceUUID,
          characteristicUUID,
          encryptedCommand
        );
      } else if (device.type === 'wifi') {
        // Wi-Fi specific command
        const encryptedCommand = this.encryptCommand(command);
        // Use default port (should be configurable)
        const port = 8080;
        return await wifiScanner.sendCommand(
          device.ipAddress,
          port,
          encryptedCommand
        );
      }
      return false;
    } catch (error) {
      console.error('Failed to power on device:', error);
      return false;
    }
  }

  // Send power off command to device
  async powerOffDevice(device) {
    try {
      const command = {
        action: 'powerOff',
        token: this.generateAuthToken(),
        timestamp: Date.now(),
      };

      if (device.type === 'ble') {
        // BLE specific command
        const encryptedCommand = this.encryptCommand(command);
        const serviceUUID = '180A';
        const characteristicUUID = '2A57';
        return await bleManager.sendCommand(
          device.id,
          serviceUUID,
          characteristicUUID,
          encryptedCommand
        );
      } else if (device.type === 'wifi') {
        // Wi-Fi specific command
        const encryptedCommand = this.encryptCommand(command);
        const port = 8080;
        return await wifiScanner.sendCommand(
          device.ipAddress,
          port,
          encryptedCommand
        );
      }
      return false;
    } catch (error) {
      console.error('Failed to power off device:', error);
      return false;
    }
  }

  // Get device status
  async getDeviceStatus(device) {
    try {
      if (device.type === 'ble') {
        // In real app, this would read from BLE characteristic
        return { power: 'on', connected: device.connected };
      } else if (device.type === 'wifi') {
        // In real app, this would send status request to Wi-Fi device
        return { power: 'on', connected: device.connected };
      }
      return null;
    } catch (error) {
      console.error('Failed to get device status:', error);
      return null;
    }
  }

  // Connect to device
  async connectToDevice(device) {
    try {
      if (device.type === 'ble') {
        return await bleManager.connectToDevice(device.id);
      } else if (device.type === 'wifi') {
        // Wi-Fi devices are typically already connected to the network
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to connect to device:', error);
      return false;
    }
  }

  // Disconnect from device
  async disconnectFromDevice(device) {
    try {
      if (device.type === 'ble') {
        return await bleManager.disconnectFromDevice(device.id);
      } else if (device.type === 'wifi') {
        // Wi-Fi devices don't need explicit disconnection
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to disconnect from device:', error);
      return false;
    }
  }
}

export default new DeviceControlService();