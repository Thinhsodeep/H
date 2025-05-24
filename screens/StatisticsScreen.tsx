import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';

interface Statistics {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  totalFoods: number;
  foodsByCategory: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  };
}

const StatisticsScreen: React.FC = () => {
  const [stats, setStats] = useState<Statistics>({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    totalFoods: 0,
    foodsByCategory: {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0,
    },
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      // Lấy thông tin người dùng từ Firestore
      const usersSnapshot = await firestore().collection('users').get();
      const users = usersSnapshot.docs.map(doc => doc.data());
      
      const adminUsers = users.filter(user => user.role === 'admin').length;
      setStats(prev => ({
        ...prev,
        totalUsers: users.length,
        adminUsers,
        regularUsers: users.length - adminUsers,
      }));

      // Lấy thông tin món ăn từ Firestore
      const foodsSnapshot = await firestore().collection('foods').get();
      const foods = foodsSnapshot.docs.map(doc => doc.data());
      
      const foodsByCategory = foods.reduce((acc: any, food: any) => {
        acc[food.category] = (acc[food.category] || 0) + 1;
        return acc;
      }, {
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        snack: 0,
      });

      setStats(prev => ({
        ...prev,
        totalFoods: foods.length,
        foodsByCategory,
      }));
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const StatCard = ({ title, value, icon }: { title: string; value: number; icon: string }) => (
    <View style={styles.statCard}>
      <Icon name={icon} size={32} color="#4CAF50" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thống kê hệ thống</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Người dùng</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Tổng số người dùng"
            value={stats.totalUsers}
            icon="people"
          />
          <StatCard
            title="Quản trị viên"
            value={stats.adminUsers}
            icon="admin-panel-settings"
          />
          <StatCard
            title="Người dùng thường"
            value={stats.regularUsers}
            icon="person"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Món ăn</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Tổng số món"
            value={stats.totalFoods}
            icon="restaurant"
          />
          <StatCard
            title="Bữa sáng"
            value={stats.foodsByCategory.breakfast}
            icon="free-breakfast"
          />
          <StatCard
            title="Bữa trưa"
            value={stats.foodsByCategory.lunch}
            icon="lunch-dining"
          />
          <StatCard
            title="Bữa tối"
            value={stats.foodsByCategory.dinner}
            icon="dinner-dining"
          />
          <StatCard
            title="Đồ ăn nhẹ"
            value={stats.foodsByCategory.snack}
            icon="bakery-dining"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '45%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default StatisticsScreen; 