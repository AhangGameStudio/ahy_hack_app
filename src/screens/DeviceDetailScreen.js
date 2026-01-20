import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Chip,
  Divider,
} from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { updateDevice } from '../store/deviceSlice';
import deviceControl from '../services/device-control';

const DeviceDetailScreen = ({ route }) => {
  const { device } = route.params;
  const dispatch = useDispatch();
  const [status, setStatus] = useState('unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(device.connected ? '已连接' : '未连接');

  useEffect(() => {
    // Get initial device status
    getDeviceStatus();
  }, []);

  const getDeviceStatus = async () => {
    try {
      setIsLoading(true);
      const deviceStatus = await deviceControl.getDeviceStatus(device);
      if (deviceStatus) {
        setStatus(deviceStatus.power);
        dispatch(updateDevice({
          id: device.id,
          status: deviceStatus.power,
        }));
      }
    } catch (error) {
      console.error('Failed to get device status:', error);
      Alert.alert('获取设备状态失败', '无法获取设备当前状态，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const powerOnHandler = async () => {
    try {
      setIsLoading(true);
      const success = await deviceControl.powerOnDevice(device);
      if (success) {
        setStatus('on');
        dispatch(updateDevice({
          id: device.id,
          status: 'on',
        }));
        Alert.alert('操作成功', '设备已开机');
      } else {
        Alert.alert('操作失败', '无法开机，请检查设备连接');
      }
    } catch (error) {
      console.error('Failed to power on device:', error);
      Alert.alert('操作失败', '设备开机失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const powerOffHandler = async () => {
    try {
      setIsLoading(true);
      const success = await deviceControl.powerOffDevice(device);
      if (success) {
        setStatus('off');
        dispatch(updateDevice({
          id: device.id,
          status: 'off',
        }));
        Alert.alert('操作成功', '设备已关机');
      } else {
        Alert.alert('操作失败', '无法关机，请检查设备连接');
      }
    } catch (error) {
      console.error('Failed to power off device:', error);
      Alert.alert('操作失败', '设备关机失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const connectHandler = async () => {
    try {
      setIsLoading(true);
      const success = await deviceControl.connectToDevice(device);
      if (success) {
        setConnectionStatus('已连接');
        dispatch(updateDevice({
          id: device.id,
          connected: true,
        }));
        Alert.alert('连接成功', '已成功连接到设备');
      } else {
        Alert.alert('连接失败', '无法连接到设备，请重试');
      }
    } catch (error) {
      console.error('Failed to connect to device:', error);
      Alert.alert('连接失败', '设备连接失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectHandler = async () => {
    try {
      setIsLoading(true);
      const success = await deviceControl.disconnectFromDevice(device);
      if (success) {
        setConnectionStatus('未连接');
        dispatch(updateDevice({
          id: device.id,
          connected: false,
        }));
        Alert.alert('断开成功', '已成功断开与设备的连接');
      } else {
        Alert.alert('断开失败', '无法断开与设备的连接，请重试');
      }
    } catch (error) {
      console.error('Failed to disconnect from device:', error);
      Alert.alert('断开失败', '设备断开失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Device Basic Info */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.deviceName}>
            {device.name}
          </Text>
          <View style={styles.deviceInfoRow}>
            <Chip
              mode="flat"
              style={[
                styles.deviceTypeChip,
                device.type === 'ble' ? styles.bleChip : styles.wifiChip,
              ]}
              textStyle={styles.chipText}
            >
              {device.type === 'ble' ? 'BLE设备' : 'Wi-Fi设备'}
            </Chip>
            <Chip
              mode="flat"
              style={[
                styles.statusChip,
                connectionStatus === '已连接' ? styles.connectedChip : styles.disconnectedChip,
              ]}
              textStyle={styles.chipText}
            >
              {connectionStatus}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailInfo}>
            <Text variant="bodyMedium" style={styles.infoLabel}>
              设备ID:
            </Text>
            <Text variant="bodySmall" style={styles.infoValue}>
              {device.id}
            </Text>
          </View>

          {device.macAddress && (
            <View style={styles.detailInfo}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                MAC地址:
              </Text>
              <Text variant="bodySmall" style={styles.infoValue}>
                {device.macAddress}
              </Text>
            </View>
          )}

          {device.ipAddress && (
            <View style={styles.detailInfo}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                IP地址:
              </Text>
              <Text variant="bodySmall" style={styles.infoValue}>
                {device.ipAddress}
              </Text>
            </View>
          )}

          {device.rssi && (
            <View style={styles.detailInfo}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                信号强度:
              </Text>
              <Text variant="bodySmall" style={styles.infoValue}>
                {device.rssi} dBm
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Device Status */}
      <Card style={styles.statusCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            设备状态
          </Text>
          <View style={styles.statusContainer}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#6200ee" />
            ) : (
              <Chip
                mode="flat"
                style={[
                  styles.statusChip,
                  status === 'on' ? styles.onChip : styles.offChip,
                ]}
                textStyle={styles.chipText}
              >
                {status === 'on' ? '已开机' : status === 'off' ? '已关机' : '未知状态'}
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Control Buttons */}
      <View style={styles.controlButtons}>
        <Button
          mode="contained"
          onPress={powerOnHandler}
          icon="power-on"
          style={[styles.controlButton, styles.powerOnButton]}
          disabled={isLoading}
        >
          开机
        </Button>
        <Button
          mode="contained"
          onPress={powerOffHandler}
          icon="power-off"
          style={[styles.controlButton, styles.powerOffButton]}
          disabled={isLoading}
        >
          关机
        </Button>
      </View>

      {/* Connection Controls */}
      <View style={styles.connectionButtons}>
        {connectionStatus === '未连接' ? (
          <Button
            mode="outlined"
            onPress={connectHandler}
            icon="connection"
            style={styles.connectionButton}
            disabled={isLoading}
          >
            连接设备
          </Button>
        ) : (
          <Button
            mode="outlined"
            onPress={disconnectHandler}
            icon="disconnect"
            style={styles.connectionButton}
            disabled={isLoading}
          >
            断开连接
          </Button>
        )}
        <Button
          mode="outlined"
          onPress={getDeviceStatus}
          icon="refresh"
          style={styles.connectionButton}
          disabled={isLoading}
        >
          刷新状态
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  deviceName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deviceInfoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  deviceTypeChip: {
    height: 32,
  },
  bleChip: {
    backgroundColor: '#03a9f4',
  },
  wifiChip: {
    backgroundColor: '#4caf50',
  },
  statusChip: {
    height: 32,
  },
  connectedChip: {
    backgroundColor: '#4caf50',
  },
  disconnectedChip: {
    backgroundColor: '#f44336',
  },
  onChip: {
    backgroundColor: '#4caf50',
  },
  offChip: {
    backgroundColor: '#9e9e9e',
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
  },
  divider: {
    marginVertical: 12,
  },
  detailInfo: {
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoValue: {
    color: '#666',
    marginLeft: 8,
  },
  statusCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusContainer: {
    alignItems: 'center',
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  controlButton: {
    flex: 1,
    height: 56,
    justifyContent: 'center',
  },
  powerOnButton: {
    backgroundColor: '#4caf50',
  },
  powerOffButton: {
    backgroundColor: '#f44336',
  },
  connectionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  connectionButton: {
    flex: 1,
    height: 56,
    justifyContent: 'center',
  },
});

export default DeviceDetailScreen;