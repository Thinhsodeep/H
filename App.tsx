import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { initializeSampleData } from './config/firebase';

import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import FoodDetailScreen from './screens/FoodDetailScreen';
import FoodListScreen from './screens/FoodListScreen';
import HealthCalculatorScreen from './screens/HealthCalculatorScreen';
import MealPlanScreen from './screens/MealPlanScreen';
import FoodSuggestionsScreen from './screens/FoodSuggestionsScreen';
import AdminScreen from './screens/AdminScreen';
import UserManagementScreen from './screens/UserManagementScreen';
import FoodManagementScreen from './screens/FoodManagementScreen';
import StatisticsScreen from './screens/StatisticsScreen';

export type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  FoodList: {
    category: string;
    calories?: number;
    goal?: string;
  };
  FoodDetail: {
    food: {
      id: string;
      name: string;
      calories: number;
      category: string;
      imageBase64: string;
    };
  };
  HealthCalculator: undefined;
  MealPlan: {
    targetCalories: number;
    goal: 'lose' | 'gain' | 'maintain';
  };
  FoodSuggestions: {
    targetCalories: number;
    goal: 'lose' | 'gain' | 'maintain';
  };
  Admin: undefined;
  UserManagement: undefined;
  FoodManagement: { userId: string };
  Statistics: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFirebase = async () => {
      try {
        const app = getApp();
        console.log('Firebase đã sẵn sàng:', app.name);
        setIsFirebaseReady(true);
      } catch (error) {
        console.error('Lỗi kiểm tra Firebase:', error);
        setIsFirebaseReady(true); // Vẫn set true để app có thể chạy
      }
    };

    const initializeApp = async () => {
      try {
        await initializeSampleData();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFirebase();
    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
        <Stack.Screen name="FoodList" component={FoodListScreen} options={{ title: 'Danh sách món ăn' }} />
        <Stack.Screen name="FoodDetail" component={FoodDetailScreen} options={{ title: 'Chi tiết món ăn' }} />
        <Stack.Screen name="HealthCalculator" component={HealthCalculatorScreen} options={{ title: 'Tính toán sức khỏe' }} />
        <Stack.Screen name="MealPlan" component={MealPlanScreen} options={{ title: 'Kế hoạch bữa ăn' }} />
        <Stack.Screen name="FoodSuggestions" component={FoodSuggestionsScreen} options={{ title: 'Gợi ý món ăn' }} />
        <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Quản trị' }} />
        <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ title: 'Quản lý người dùng' }} />
        <Stack.Screen name="FoodManagement" component={FoodManagementScreen} options={{ title: 'Quản lý món ăn' }} />
        <Stack.Screen name="Statistics" component={StatisticsScreen} options={{ title: 'Thống kê' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
