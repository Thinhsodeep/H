import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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
  const navigation = useNavigation<MealPlanScreenNavigationProp>();
  const route = useRoute<MealPlanScreenRouteProp>();
  const [selectedMeals, setSelectedMeals] = useState<SelectedMeal>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  });
  const [totalCalories, setTotalCalories] = useState(0);

  const targetCalories = route.params?.targetCalories || 2000;
  const goal = route.params?.goal || 'maintain';

  const breakfastFoods = mockFoods.filter(food => food.category === 'Ăn sáng');
  const lunchFoods = mockFoods.filter(food => food.category === 'Ăn trưa');
  const dinnerFoods = mockFoods.filter(food => food.category === 'Ăn tối');
  const snackFoods = mockFoods.filter(food => food.category === 'Ăn vặt');

  const calculateTotalCalories = (meals: SelectedMeal) => {
    let total = 0;
    meals.breakfast.forEach(id => {
      const food = mockFoods.find(f => f.id === id);
      if (food) total += food.calories;
    });
    meals.lunch.forEach(id => {
      const food = mockFoods.find(f => f.id === id);
      if (food) total += food.calories;
    });
    meals.dinner.forEach(id => {
      const food = mockFoods.find(f => f.id === id);
      if (food) total += food.calories;
    });
    meals.snacks.forEach(id => {
      const food = mockFoods.find(f => f.id === id);
      if (food) total += food.calories;
    });
    return total;
  };

  const toggleFoodSelection = (mealType: keyof SelectedMeal, foodId: string) => {
    setSelectedMeals(prev => {
      const newMeals = { ...prev };
      const index = newMeals[mealType].indexOf(foodId);
      
      if (index === -1) {
        // Thêm món ăn
        newMeals[mealType] = [...newMeals[mealType], foodId];
      } else {
        // Xóa món ăn
        newMeals[mealType] = newMeals[mealType].filter(id => id !== foodId);
      }

      const newTotalCalories = calculateTotalCalories(newMeals);
      setTotalCalories(newTotalCalories);

      return newMeals;
    });
  };

  const getCalorieStatus = () => {
    const difference = totalCalories - targetCalories;
    const tolerance = 50; // Cho phép sai số 50 calo

    if (goal === 'lose') {
      if (difference > tolerance) {
        return { color: '#ff4444', message: `Vượt ${difference} calo so với mục tiêu` };
      } else if (difference < -tolerance) {
        return { color: '#00C851', message: `Thiếu ${Math.abs(difference)} calo so với mục tiêu` };
      }
    } else if (goal === 'gain') {
      if (difference < -tolerance) {
        return { color: '#ff4444', message: `Thiếu ${Math.abs(difference)} calo so với mục tiêu` };
      } else if (difference > tolerance) {
        return { color: '#00C851', message: `Vượt ${difference} calo so với mục tiêu` };
      }
    } else if (goal === 'maintain') {
      if (Math.abs(difference) > tolerance) {
        return { 
          color: '#ff4444', 
          message: difference > 0 
            ? `Vượt ${difference} calo so với mục tiêu` 
            : `Thiếu ${Math.abs(difference)} calo so với mục tiêu`
        };
      }
    }

    return { color: '#00C851', message: 'Đạt mục tiêu calo' };
  };

  const renderMealSection = (title: string, foods: typeof mockFoods, mealType: keyof SelectedMeal) => (
    <View style={styles.mealSection}>
      <Text style={styles.mealTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.foodScroll}>
        {foods.map(food => (
          <TouchableOpacity
            key={food.id}
            style={[
              styles.foodItem,
              selectedMeals[mealType].includes(food.id) && styles.selectedFoodItem
            ]}
            onPress={() => toggleFoodSelection(mealType, food.id)}
          >
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodCalories}>{food.calories} calo</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const calorieStatus = getCalorieStatus();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderMealSection('Ăn sáng', breakfastFoods, 'breakfast')}
        {renderMealSection('Ăn trưa', lunchFoods, 'lunch')}
        {renderMealSection('Ăn tối', dinnerFoods, 'dinner')}
        {renderMealSection('Ăn vặt', snackFoods, 'snacks')}
      </ScrollView>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Tổng kết</Text>
        <Text style={styles.calorieText}>
          Tổng calo: {totalCalories} / {targetCalories}
        </Text>
        <Text style={[styles.statusText, { color: calorieStatus.color }]}>
          {calorieStatus.message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  mealSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  foodScroll: {
    flexDirection: 'row',
  },
  foodItem: {
    padding: 12,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minWidth: 120,
  },
  selectedFoodItem: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
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
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  calorieText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MealPlanScreen; 