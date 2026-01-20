# 设备远程控制应用

一个基于React Native开发的移动应用程序，用于通过手机对附近设备进行远程开关机操作及设备扫描功能。

## 功能特性

### 核心功能
- **设备扫描**：自动扫描并识别用户周围可连接的智能设备
  - 支持BLE（蓝牙低功耗）设备扫描
  - 支持Wi-Fi设备扫描
- **设备控制**：实现对已识别设备的远程开机和关机操作
- **设备管理**：显示已扫描设备列表，包含设备名称、类型、连接状态等信息

### 技术特性
- 跨平台支持：同时支持iOS和Android
- 安全认证机制：设备连接认证，防止未授权设备控制
- 通信加密：确保通信数据的安全性和完整性
- 直观的用户界面：简化设备扫描和控制流程
- 操作反馈：提供清晰的操作结果和状态提示

## 技术栈

- **框架**：React Native 0.74.5
- **跨平台支持**：Expo 54.0.0
- **设备通信**：
  - 蓝牙：react-native-ble-plx
  - Wi-Fi：react-native-wifi-reborn
- **状态管理**：Redux Toolkit
- **UI组件**：React Native Paper
- **导航**：React Navigation

## 项目结构

```
device-control-app/
├── src/
│   ├── components/          # UI组件
│   ├── screens/             # 应用页面
│   ├── services/            # 核心服务
│   │   ├── ble-manager.js   # BLE设备管理
│   │   ├── wifi-scanner.js  # Wi-Fi设备扫描
│   │   └── device-control.js # 设备控制逻辑
│   ├── store/               # Redux状态管理
│   ├── utils/               # 工具函数
│   ├── constants/           # 常量定义
│   └── navigation/          # 导航配置
├── App.js                   # 应用入口
├── package.json             # 依赖配置
└── README.md                # 项目文档
```

## 安装和运行

### 前置条件
- Node.js 18.x 或更高版本
- npm 或 yarn
- Expo CLI（可选，但推荐）
- EAS CLI（用于构建生产版本）：`npm install -g eas-cli`

### 安装步骤

1. 克隆或下载项目代码

2. 安装依赖
   ```bash
   npm install
   ```
   或
   ```bash
   yarn install
   ```

3. 启动开发服务器
   ```bash
   npm start
   ```
   或
   ```bash
   expo start
   ```

4. 在设备上运行应用
   - 使用Expo Go应用扫描终端中显示的二维码
   - 或使用Android模拟器/iOS模拟器运行

### 构建应用

#### 开发构建（推荐用于测试）

```bash
# Android开发构建
expo build:android --development-client

# iOS开发构建
expo build:ios --development-client
```

#### 生产构建

生产构建需要Expo账户和EAS CLI：

1. 确保已安装EAS CLI：`npm install -g eas-cli`
2. 登录Expo账户：`eas login`
3. 初始化EAS项目：`eas init`
4. 运行构建命令：

```bash
# Android生产构建
npm run build:android
# 或
eas build --platform android

# iOS生产构建
npm run build:ios
# 或
eas build --platform ios
```

#### 本地构建（适用于开发环境）

```bash
# 启动开发服务器
npm start

# 在Android模拟器上运行
npm run android

# 在iOS模拟器上运行
npm run ios
```

## 使用说明

### 1. 设备扫描

1. 打开应用，点击底部的"扫描设备"按钮
2. 在扫描页面选择扫描类型（BLE或Wi-Fi）
3. 点击"开始扫描"按钮，应用将开始扫描周围的设备
4. 扫描结果将实时显示在列表中

### 2. 设备控制

1. 在设备列表中点击要控制的设备
2. 进入设备详情页面
3. 点击"连接设备"按钮（如果设备未连接）
4. 使用"开机"或"关机"按钮控制设备
5. 操作结果将通过弹窗提示

### 3. 设备管理

- 设备列表页面显示所有已扫描的设备
- 可以通过下拉刷新更新设备状态
- 可以点击"清空设备列表"按钮清除所有设备记录

## 安全机制

- **设备认证**：设备连接时进行密钥验证
- **通信加密**：敏感命令使用Base64加密传输（实际部署时建议使用更强大的加密算法）
- **权限管理**：应用需要获取蓝牙和Wi-Fi权限才能正常工作

## 开发说明

### 添加新设备类型

1. 在`src/services`目录下创建新的设备管理服务
2. 在`src/store/deviceSlice.js`中添加相应的状态管理逻辑
3. 在`src/services/device-control.js`中实现控制逻辑
4. 更新UI组件以支持新设备类型

### 自定义命令协议

1. 修改`src/services/device-control.js`中的命令格式
2. 更新加密/解密逻辑
3. 确保设备端支持相同的协议

## 已知限制

- Wi-Fi设备扫描目前使用模拟数据，实际部署时需要实现真实的网络扫描
- BLE设备控制使用默认的服务和特征UUID，实际部署时需要根据设备调整
- 加密机制为演示版本，建议在生产环境中使用更安全的加密算法

## 许可证

MIT License

## 贡献

欢迎提交Issues和Pull Requests来改进这个项目。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 项目地址：[GitHub Repository]
- 邮箱：[your-email@example.com]
