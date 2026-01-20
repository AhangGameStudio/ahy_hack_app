import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Button,
  Card,
  Text,
  FAB,
  Chip,
  Switch,
  Checkbox,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import {
  clearDevices,
  updateDevice,
  toggleListening,
  setListening,
  toggleDeviceSelection,
  selectAllDevices,
  clearSelectedDevices,
} from '../store/deviceSlice';
import deviceControl from '../services/device-control';
import listeningService from '../services/listening-service';

const DeviceListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { devices, isScanning, isListening, selectedDevices } = useSelector((state) => state.device);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check device statuses on mount
    checkDeviceStatuses();
  }, []);

  // 监听状态变化时启动或停止监听服务
  useEffect(() => {
    if (isListening) {
      listeningService.startListening();
    } else {
      listeningService.stopListening();
    }
  }, [isListening]);

  const checkDeviceStatuses = async () => {
    for (const device of devices) {
      const status = await deviceControl.getDeviceStatus(device);
      if (status) {
        dispatch(updateDevice({
          id: device.id,
          status: status.power,
        }));
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkDeviceStatuses();
    setRefreshing(false);
  };

  // 监听开关处理
  const handleListeningToggle = () => {
    dispatch(toggleListening());
  };

  // 批量开机操作
  const handleBatchPowerOn = async () => {
    if (selectedDevices.length === 0) {
      Alert.alert('提示', '请先选择要操作的设备');
      return;
    }

    setIsLoading(true);
    try {
      const selectedDevicesList = devices.filter(device => selectedDevices.includes(device.id));
      const results = await listeningService.batchOperateDevices(selectedDevicesList, 'powerOn');
      const successCount = results.filter(r => r.success).length;
      Alert.alert('批量操作完成', `成功开机 ${successCount}/${selectedDevicesList.length} 台设备`);
    } catch (error) {
      Alert.alert('批量操作失败', '无法执行批量开机操作');
    } finally {
      setIsLoading(false);
    }
  };

  // 批量关机操作
  const handleBatchPowerOff = async () => {
    if (selectedDevices.length === 0) {
      Alert.alert('提示', '请先选择要操作的设备');
      return;
    }

    setIsLoading(true);
    try {
      const selectedDevicesList = devices.filter(device => selectedDevices.includes(device.id));
      const results = await listeningService.batchOperateDevices(selectedDevicesList, 'powerOff');
      const successCount = results.filter(r => r.success).length;
      Alert.alert('批量操作完成', `成功关机 ${successCount}/${selectedDevicesList.length} 台设备`);
    } catch (error) {
      Alert.alert('批量操作失败', '无法执行批量关机操作');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDeviceItem = ({ item }) => {
    const isSelected = selectedDevices.includes(item.id);
    
    return (
      <Card
        style={styles.deviceCard}
        onPress={() => navigation.navigate('DeviceDetail', { device: item })}
      >
        <Card.Content>
          <View style={styles.deviceHeader}>
            <Checkbox
              status={isSelected ? 'checked' : 'unchecked'}
              onPress={() => dispatch(toggleDeviceSelection(item.id))}
              color="#6200ee"
              style={styles.deviceCheckbox}
            />
            <Text variant="titleMedium" style={styles.deviceName}>
              {item.name}
            </Text>
            <Chip
              mode="flat"
              style={[
                styles.deviceTypeChip,
                item.type === 'ble' ? styles.bleChip : styles.wifiChip,
              ]}
              textStyle={styles.chipText}
            >
              {item.type === 'ble' ? 'BLE设备' : 'Wi-Fi设备'}
            </Chip>
          </View>
          <Text variant="bodySmall" style={styles.deviceId}>
            ID: {item.id}
          </Text>
          <View style={styles.deviceFooter}>
            <Chip
              mode="flat"
              style={[
                styles.statusChip,
                item.connected ? styles.connectedChip : styles.disconnectedChip,
              ]}
              textStyle={styles.chipText}
            >
              {item.connected ? '已连接' : '未连接'}
            </Chip>
            {item.status && (
              <Chip
                mode="flat"
                style={[
                  styles.statusChip,
                  item.status === 'on' ? styles.onChip : styles.offChip,
                ]}
                textStyle={styles.chipText}
              >
                {item.status === 'on' ? '已开机' : '已关机'}
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* 监听控制栏 */}
      <View style={styles.listeningControl}>
        <View style={styles.listeningHeader}>
          <Text variant="titleMedium" style={styles.listeningTitle}>
            设备监听
          </Text>
          <Switch
            value={isListening}
            onValueChange={handleListeningToggle}
            color="#6200ee"
          />
        </View>
      </View>

      {devices.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="titleLarge" style={styles.emptyText}>
            暂无设备
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            点击下方按钮开始扫描设备
          </Text>
        </View>
      ) : (
        <>
          {/* 批量操作按钮 */}
          {selectedDevices.length > 0 && (
            <View style={styles.batchControls}>
              <Button
                mode="outlined"
                onPress={() => dispatch(selectAllDevices())}
                icon="checkbox-marked-outline"
                style={styles.batchButton}
              >
                全选
              </Button>
              <Button
                mode="contained"
                onPress={handleBatchPowerOn}
                icon="power-on"
                style={styles.batchButton}
                disabled={isLoading}
              >
                批量开机
              </Button>
              <Button
                mode="contained"
                onPress={handleBatchPowerOff}
                icon="power-off"
                style={[styles.batchButton, styles.powerOffButton]}
                disabled={isLoading}
              >
                批量关机
              </Button>
              <Button
                mode="outlined"
                onPress={() => dispatch(clearSelectedDevices())}
                icon="close"
                style={styles.batchButton}
              >
                取消选择
              </Button>
            </View>
          )}
          
          <FlatList
            data={devices}
            renderItem={renderDeviceItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.deviceList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#6200ee']}
                tintColor="#6200ee"
              />
            }
          />
        )}

      <FAB
        icon="magnify"
        style={styles.fab}
        onPress={() => navigation.navigate('Scan')}
        label="扫描设备"
      />

      {isScanning && (
        <View style={styles.scanningIndicator}>
          <ActivityIndicator animating={true} color="#6200ee" />
          <Text style={styles.scanningText}>正在扫描设备...</Text>
        </View>
      )}

      {devices.length > 0 && (
        <Button
          mode="outlined"
          onPress={() => dispatch(clearDevices())}
          style={styles.clearButton}
          icon="delete-outline"
        >
          清空设备列表
        </Button>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>正在执行批量操作...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  deviceList: {
    padding: 16,
  },
  deviceCard: {
    marginBottom: 16,
    elevation: 3,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceCheckbox: {
    marginRight: 12,
  },
  deviceName: {
    fontWeight: 'bold',
    flex: 1,
  },
  deviceId: {
    color: '#666',
    marginBottom: 8,
    marginLeft: 48,
  },
  deviceFooter: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 48,
  },
  deviceTypeChip: {
    height: 28,
  },
  bleChip: {
    backgroundColor: '#03a9f4',
  },
  wifiChip: {
    backgroundColor: '#4caf50',
  },
  statusChip: {
    height: 28,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginBottom: 16,
    color: '#333',
  },
  emptySubtext: {
    color: '#666',
    textAlign: 'center',
  },
  scanningIndicator: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
  },
  scanningText: {
    marginLeft: 8,
    color: '#6200ee',
    fontWeight: '500',
  },
  clearButton: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
  },
  // 监听控制相关样式
  listeningControl: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
  },
  listeningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listeningTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  // 批量操作相关样式
  batchControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  batchButton: {
    flex: 1,
    minWidth: 120,
  },
  powerOffButton: {
    backgroundColor: '#f44336',
  },
  // 加载覆盖层样式
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    color: '#6200ee',
    fontWeight: '500',
  },
});

export default DeviceListScreen;