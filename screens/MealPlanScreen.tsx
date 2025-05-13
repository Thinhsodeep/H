import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { mockFoods } from './FoodListScreen';

type MealPlanScreenRouteProp = RouteProp<RootStackParamList, 'MealPlan'>;
type MealPlanScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MealPlan'>;

interface SelectedMeal {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks: string[];
}

const MealPlanScreen: React.FC = () => {
  const route = useRoute<MealPlanScreenRouteProp>();
  const navigation = useNavigation<MealPlanScreenNavigationProp>();
  const { targetCalories, goal } = route.params;

  const [selectedMeals, setSelectedMeals] = useState<SelectedMeal>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  });

  const breakfastFoods = mockFoods.filter(food => food.category === 'Ăn sáng');
  const lunchFoods = mockFoods.filter(food => food.category === 'Ăn trưa');
  const dinnerFoods = mockFoods.filter(food => food.category === 'Ăn tối');
  const snackFoods = mockFoods.filter(food => food.category === 'Ăn vặt');

  const calculateTotalCalories = () => {
    let total = 0;
    const allSelectedFoods = [
      ...selectedMeals.breakfast,
      ...selectedMeals.lunch,
      ...selectedMeals.dinner,
      ...selectedMeals.snacks,
    ];

    allSelectedFoods.forEach(foodId => {
      const food = mockFoods.find(f => f.id === foodId);
      if (food) {
        total += food.calories;
      }
    });

    return total;
  };

  const getCalorieStatus = () => {
    const totalCalories = calculateTotalCalories();
    const difference = totalCalories - targetCalories;
    const tolerance = 50; // Cho phép sai số 50 calo

    if (Math.abs(difference) <= tolerance) {
      return { message: 'Đã đạt mục tiêu calo', color: '#4CAF50' };
    }

    if (goal === 'lose') {
      if (difference > 0) {
        return { message: 'Vượt quá mục tiêu calo', color: '#f44336' };
      } else {
        return { message: 'Chưa đạt mục tiêu calo', color: '#ff9800' };
      }
    } else if (goal === 'gain') {
      if (difference < 0) {
        return { message: 'Chưa đạt mục tiêu calo', color: '#ff9800' };
      } else {
        return { message: 'Vượt quá mục tiêu calo', color: '#4CAF50' };
      }
    } else {
      if (difference > 0) {
        return { message: 'Vượt quá mục tiêu calo', color: '#f44336' };
      } else {
        return { message: 'Chưa đạt mục tiêu calo', color: '#ff9800' };
      }
    }
  };

  const toggleMealSelection = (category: keyof SelectedMeal, foodId: string) => {
    setSelectedMeals(prev => {
      const currentSelection = prev[category];
      const newSelection = currentSelection.includes(foodId)
        ? currentSelection.filter(id => id !== foodId)
        : [...currentSelection, foodId];
      
      return {
        ...prev,
        [category]: newSelection,
      };
    });
  };

  const renderMealSection = (title: string, foods: typeof mockFoods, category: keyof SelectedMeal) => (
    <View style={styles.mealSection}>
      <Text style={styles.mealTitle}>{title}</Text>
      <FlatList
        data={foods}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.foodItem,
              selectedMeals[category].includes(item.id) && styles.selectedFoodItem,
            ]}
            onPress={() => toggleMealSelection(category, item.id)}
          >
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodCalories}>{item.calories} calo</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.foodList}
      />
    </View>
  );

  const calorieStatus = getCalorieStatus();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tạo thực đơn</Text>
        <Text style={styles.subtitle}>Mục tiêu: {targetCalories} calo/ngày</Text>
        <Text style={styles.goalText}>
          Mục tiêu: {goal === 'lose' ? 'Giảm cân' : goal === 'gain' ? 'Tăng cân' : 'Duy trì cân nặng'}
        </Text>
      </View>

      {renderMealSection('Bữa sáng', breakfastFoods, 'breakfast')}
      {renderMealSection('Bữa trưa', lunchFoods, 'lunch')}
      {renderMealSection('Bữa tối', dinnerFoods, 'dinner')}
      {renderMealSection('Ăn vặt', snackFoods, 'snacks')}

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Tổng kết</Text>
        <Text style={styles.totalCalories}>
          Tổng calo: {calculateTotalCalories()} / {targetCalories}
        </Text>
        <Text style={[styles.statusText, { color: calorieStatus.color }]}>
          {calorieStatus.message}
        </Text>
      </View>
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
  goalText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  mealSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  foodList: {
    paddingRight: 16,
  },
  foodItem: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 150,
  },
  selectedFoodItem: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  foodCalories: {
    fontSize: 14,
    color: '#666',
  },
  summaryContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    margin: 16,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  totalCalories: {
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MealPlanScreen; 