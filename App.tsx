import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import FoodDetailScreen from './screens/FoodDetailScreen';
import FoodListScreen from './screens/FoodListScreen';
import HealthCalculatorScreen from './screens/HealthCalculatorScreen';
import MealPlanScreen from './screens/MealPlanScreen';
import FoodSuggestionsScreen from './screens/FoodSuggestionsScreen';

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
      imageUrl: string;
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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Đăng ký' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Đăng nhập' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
        <Stack.Screen name="FoodList" component={FoodListScreen} options={{ title: 'Danh sách món ăn' }} />
        <Stack.Screen name="FoodDetail" component={FoodDetailScreen} options={{ title: 'Chi tiết món ăn' }} />
        <Stack.Screen name="HealthCalculator" component={HealthCalculatorScreen} options={{ title: 'Tính TDEE & BMI' }} />
        <Stack.Screen name="MealPlan" component={MealPlanScreen} options={{ title: 'Thực đơn' }} />
        <Stack.Screen name="FoodSuggestions" component={FoodSuggestionsScreen} options={{ title: 'Gợi ý thực đơn' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
