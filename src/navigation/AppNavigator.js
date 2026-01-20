import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DeviceListScreen from '../screens/DeviceListScreen';
import ScanScreen from '../screens/ScanScreen';
import DeviceDetailScreen from '../screens/DeviceDetailScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="DeviceList"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="DeviceList"
        component={DeviceListScreen}
        options={{
          title: '设备列表',
        }}
      />
      <Stack.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          title: '扫描设备',
        }}
      />
      <Stack.Screen
        name="DeviceDetail"
        component={DeviceDetailScreen}
        options={({ route }) => ({
          title: route.params?.device?.name || '设备详情',
        })}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;