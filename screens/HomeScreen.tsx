import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import { getUserHealthInfo } from '../config/firebase';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setUserEmail(user.email || '');
    }
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất');
    }
  };

  const handleViewMealPlan = async () => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem thực đơn');
        return;
      }

      const healthInfo = await getUserHealthInfo(userId);
      if (!healthInfo) {
        Alert.alert(
          'Thông báo',
          'Bạn chưa có thông tin TDEE. Vui lòng tính TDEE trước khi xem thực đơn.',
          [
            { text: 'Hủy', style: 'cancel' },
            { 
              text: 'Tính TDEE',
              onPress: () => navigation.navigate('HealthCalculator')
            }
          ]
        );
        return;
      }

      navigation.navigate('MealPlan', {
        targetCalories: healthInfo.targetCalories,
        goal: healthInfo.goal
      });
    } catch (error) {
      console.error('Error loading meal plan:', error);
      Alert.alert('Lỗi', 'Không thể tải thực đơn');
    }
  };

  const categories = [
    { id: '1', name: 'Ăn sáng', icon: '🌅' },
    { id: '2', name: 'Ăn trưa', icon: '🌞' },
    { id: '3', name: 'Ăn tối', icon: '🌙' },
    { id: '4', name: 'Ăn vặt', icon: '🍿' },
  ];

  const handleCategoryPress = (category: string) => {
    navigation.navigate('FoodList', { category });
  };

  const handleHealthCalculatorPress = () => {
    navigation.navigate('HealthCalculator');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Icon name="account-circle" size={24} color="#4CAF50" />
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Chào mừng đến với Health App</Text>
        
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('FoodList', { category: 'Tất cả' })}
          >
            <Icon name="restaurant" size={32} color="#4CAF50" />
            <Text style={styles.menuText}>Danh sách món ăn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('HealthCalculator')}
          >
            <Icon name="calculate" size={32} color="#4CAF50" />
            <Text style={styles.menuText}>Tính TDEE & BMI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleViewMealPlan}
          >
            <Icon name="menu-book" size={32} color="#4CAF50" />
            <Text style={styles.menuText}>Thực đơn của tôi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userEmail: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 16,
  },
  menuItem: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuText: {
    marginTop: 8,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default HomeScreen;
