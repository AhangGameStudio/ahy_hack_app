import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Button,
  Text,
  RadioButton,
  Card,
  Chip,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { startScan, stopScan, addDevice, clearDevices } from '../store/deviceSlice';
import bleManager from '../services/ble-manager';
import wifiScanner from '../services/wifi-scanner';

const ScanScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isScanning, devices, scanType } = useSelector((state) => state.device);
  const [selectedScanType, setSelectedScanType] = useState('ble');
  const [scanResults, setScanResults] = useState([]);

  useEffect(() => {
    // Start scan when component mounts
    startScanHandler();

    // Cleanup on unmount
    return () => {
      stopScanHandler();
    };
  }, []);

  useEffect(() => {
    // Update local scan results when Redux devices change
    setScanResults(devices);
  }, [devices]);

  const startScanHandler = async () => {
    try {
      // Clear previous scan results
      dispatch(clearDevices());
      setScanResults([]);

      // Request permissions
      let hasPermission = false;
      if (selectedScanType === 'ble') {
        hasPermission = await bleManager.requestPermissions();
      } else {
        hasPermission = await wifiScanner.requestPermissions();
      }

      if (!hasPermission) {
        Alert.alert(
          '权限不足',
          `无法获取${selectedScanType === 'ble' ? 'BLE' : 'Wi-Fi'}权限，请在设置中开启权限`,
          [{ text: '确定' }]
        );
        return;
      }

      // Start scanning
      dispatch(startScan(selectedScanType));

      if (selectedScanType === 'ble') {
        await bleManager.startScan((device) => {
          dispatch(addDevice(device));
        });
      } else {
        await wifiScanner.startScan((device) => {
          dispatch(addDevice(device));
        });
      }
    } catch (error) {
      console.error('Failed to start scan:', error);
      Alert.alert(
        '扫描失败',
        `无法启动${selectedScanType === 'ble' ? 'BLE' : 'Wi-Fi'}扫描，请重试`,
        [{ text: '确定' }]
      );
      dispatch(stopScan());
    }
  };

  const stopScanHandler = async () => {
    try {
      dispatch(stopScan());
      if (selectedScanType === 'ble') {
        await bleManager.stopScan();
      } else {
        await wifiScanner.stopScan();
      }
    } catch (error) {
      console.error('Failed to stop scan:', error);
    }
  };

  const renderScanResultItem = ({ item }) => {
    return (
      <Card
        style={styles.scanResultCard}
        onPress={() => navigation.navigate('DeviceDetail', { device: item })}
      >
        <Card.Content>
          <View style={styles.deviceHeader}>
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
              {item.type === 'ble' ? 'BLE' : 'Wi-Fi'}
            </Chip>
          </View>
          <Text variant="bodySmall" style={styles.deviceId}>
            ID: {item.id}
          </Text>
          {item.rssi && (
            <Text variant="bodySmall" style={styles.deviceRssi}>
              信号强度: {item.rssi} dBm
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Scan Type Selection */}
      <Card style={styles.scanTypeCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            选择扫描类型
          </Text>
          <RadioButton.Group
            onValueChange={(value) => setSelectedScanType(value)}
            value={selectedScanType}
          >
            <View style={styles.radioButtonContainer}>
              <RadioButton.Android value="ble" />
              <Text>BLE设备</Text>
            </View>
            <View style={styles.radioButtonContainer}>
              <RadioButton.Android value="wifi" />
              <Text>Wi-Fi设备</Text>
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Scan Controls */}
      <View style={styles.scanControls}>
        {isScanning ? (
          <Button
            mode="contained"
            onPress={stopScanHandler}
            icon="stop"
            style={styles.scanButton}
          >
            停止扫描
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={startScanHandler}
            icon="play"
            style={styles.scanButton}
          >
            开始扫描
          </Button>
        )}
      </View>

      {/* Scan Status */}
      <View style={styles.scanStatus}>
        {isScanning && (
          <View style={styles.scanningIndicator}>
            <ActivityIndicator animating={true} color="#6200ee" />
            <Text style={styles.scanningText}>
              正在扫描{selectedScanType === 'ble' ? 'BLE' : 'Wi-Fi'}设备...
            </Text>
          </View>
        )}
        <Text variant="bodySmall" style={styles.resultCount}>
          已发现设备: {scanResults.length}
        </Text>
      </View>

      {/* Scan Results */}
      {scanResults.length > 0 ? (
        <FlatList
          data={scanResults}
          renderItem={renderScanResultItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scanResultsList}
        />
      ) : (
        <View style={styles.emptyResults}>
          <Text variant="bodyMedium" style={styles.emptyResultsText}>
            {isScanning ? '正在搜索设备...' : '暂无扫描结果'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  scanTypeCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scanControls: {
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: '#6200ee',
  },
  scanStatus: {
    marginBottom: 16,
    alignItems: 'center',
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scanningText: {
    marginLeft: 8,
    color: '#6200ee',
    fontWeight: '500',
  },
  resultCount: {
    color: '#666',
  },
  scanResultsList: {
    flexGrow: 1,
  },
  scanResultCard: {
    marginBottom: 16,
    elevation: 2,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceName: {
    fontWeight: 'bold',
  },
  deviceId: {
    color: '#666',
    marginBottom: 4,
  },
  deviceRssi: {
    color: '#666',
  },
  deviceTypeChip: {
    height: 24,
  },
  bleChip: {
    backgroundColor: '#03a9f4',
  },
  wifiChip: {
    backgroundColor: '#4caf50',
  },
  chipText: {
    color: '#fff',
    fontSize: 11,
  },
  emptyResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyResultsText: {
    color: '#666',
    textAlign: 'center',
  },
});

export default ScanScreen;