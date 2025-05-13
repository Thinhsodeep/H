import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chào mừng đến với FoodApp</Text>
        <Text style={styles.subtitle}>Khám phá các món ăn ngon</Text>
      </View>

      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Danh mục món ăn</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category.name)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.healthCalculatorButton}
        onPress={handleHealthCalculatorPress}
      >
        <Text style={styles.healthCalculatorButtonText}>Tính TDEE & BMI</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#4CAF50',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  categoriesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  healthCalculatorButton: {
    backgroundColor: '#2196F3',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  healthCalculatorButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HomeScreen;
