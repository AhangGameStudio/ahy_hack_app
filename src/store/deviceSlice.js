import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  devices: [],
  isScanning: false,
  activeDevice: null,
  scanType: null, // 'ble' or 'wifi'
  isListening: false, // 监听状态
  selectedDevices: [], // 选中设备列表
};

export const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    startScan: (state, action) => {
      state.isScanning = true;
      state.scanType = action.payload;
    },
    stopScan: (state) => {
      state.isScanning = false;
    },
    addDevice: (state, action) => {
      const existingIndex = state.devices.findIndex(
        (device) => device.id === action.payload.id
      );
      if (existingIndex === -1) {
        state.devices.push(action.payload);
      }
    },
    updateDevice: (state, action) => {
      const index = state.devices.findIndex(
        (device) => device.id === action.payload.id
      );
      if (index !== -1) {
        state.devices[index] = { ...state.devices[index], ...action.payload };
      }
    },
    removeDevice: (state, action) => {
      state.devices = state.devices.filter((device) => device.id !== action.payload);
      // 从选中列表中移除
      state.selectedDevices = state.selectedDevices.filter((id) => id !== action.payload);
    },
    clearDevices: (state) => {
      state.devices = [];
      state.selectedDevices = [];
    },
    setActiveDevice: (state, action) => {
      state.activeDevice = action.payload;
    },
    // 监听相关reducers
    toggleListening: (state) => {
      state.isListening = !state.isListening;
    },
    setListening: (state, action) => {
      state.isListening = action.payload;
    },
    // 设备选择相关reducers
    toggleDeviceSelection: (state, action) => {
      const deviceId = action.payload;
      const index = state.selectedDevices.indexOf(deviceId);
      if (index === -1) {
        state.selectedDevices.push(deviceId);
      } else {
        state.selectedDevices.splice(index, 1);
      }
    },
    selectAllDevices: (state) => {
      state.selectedDevices = state.devices.map(device => device.id);
    },
    clearSelectedDevices: (state) => {
      state.selectedDevices = [];
    },
  },
});

export const { 
  startScan, 
  stopScan, 
  addDevice, 
  updateDevice, 
  removeDevice, 
  clearDevices, 
  setActiveDevice,
  // 监听相关actions
  toggleListening,
  setListening,
  // 设备选择相关actions
  toggleDeviceSelection,
  selectAllDevices,
  clearSelectedDevices
} = deviceSlice.actions;

export default deviceSlice.reducer;