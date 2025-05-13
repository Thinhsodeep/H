import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { mockFoods } from './FoodListScreen';

type FoodSuggestionsScreenRouteProp = RouteProp<RootStackParamList, 'FoodSuggestions'>;
type FoodSuggestionsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FoodSuggestions'>;

interface SuggestedMeal {
  breakfast: typeof mockFoods;
  lunch: typeof mockFoods;
  dinner: typeof mockFoods;
  snacks: typeof mockFoods;
  totalCalories: number;
}

const FoodSuggestionsScreen: React.FC = () => {
  const route = useRoute<FoodSuggestionsScreenRouteProp>();
  const navigation = useNavigation<FoodSuggestionsScreenNavigationProp>();
  const [suggestedMeal, setSuggestedMeal] = useState<SuggestedMeal | null>(null);

  const targetCalories = route.params?.targetCalories || 2000;
  const goal = route.params?.goal || 'maintain';

  // Sắp xếp món ăn theo calo
  const sortFoodsByCalories = (foods: typeof mockFoods, targetCal: number, isGain: boolean) => {
    return [...foods].sort((a, b) => {
      const diffA = Math.abs(a.calories - targetCal);
      const diffB = Math.abs(b.calories - targetCal);
      return isGain ? diffA - diffB : diffB - diffA;
    });
  };

  const selectMeals = (foods: typeof mockFoods, targetCalories: number, isGain: boolean) => {
    const sortedFoods = sortFoodsByCalories(foods, targetCalories, isGain);
    const selected: typeof mockFoods = [];
    let currentCalories = 0;

    for (const food of sortedFoods) {
      if (currentCalories + food.calories <= targetCalories * 1.1) { // Cho phép vượt 10%
        selected.push(food);
        currentCalories += food.calories;
      }
      if (currentCalories >= targetCalories * 0.9) break; // Đạt ít nhất 90% mục tiêu
    }

    return selected;
  };

  const generateMealPlan = () => {
    const breakfastFoods = mockFoods.filter(food => food.category === 'Ăn sáng');
    const lunchFoods = mockFoods.filter(food => food.category === 'Ăn trưa');
    const dinnerFoods = mockFoods.filter(food => food.category === 'Ăn tối');
    const snackFoods = mockFoods.filter(food => food.category === 'Ăn vặt');

    // Phân bổ calo cho các bữa ăn
    const breakfastCalories = Math.round(targetCalories * 0.3); // 30% calo cho bữa sáng
    const lunchCalories = Math.round(targetCalories * 0.35); // 35% calo cho bữa trưa
    const dinnerCalories = Math.round(targetCalories * 0.25); // 25% calo cho bữa tối
    const snackCalories = Math.round(targetCalories * 0.1); // 10% calo cho ăn vặt

    const isGain = goal === 'gain';

    // Chọn món ăn cho từng bữa
    const selectedBreakfast = selectMeals(breakfastFoods, breakfastCalories, isGain);
    const selectedLunch = selectMeals(lunchFoods, lunchCalories, isGain);
    const selectedDinner = selectMeals(dinnerFoods, dinnerCalories, isGain);
    const selectedSnacks = selectMeals(snackFoods, snackCalories, isGain);

    const totalCalories = [...selectedBreakfast, ...selectedLunch, ...selectedDinner, ...selectedSnacks]
      .reduce((sum, food) => sum + food.calories, 0);

    setSuggestedMeal({
      breakfast: selectedBreakfast,
      lunch: selectedLunch,
      dinner: selectedDinner,
      snacks: selectedSnacks,
      totalCalories,
    });
  };

  useEffect(() => {
    generateMealPlan();
  }, [targetCalories, goal]);

  const renderMealSection = (title: string, foods: typeof mockFoods, totalCalories: number) => (
    <View style={styles.mealSection}>
      <Text style={styles.mealTitle}>{title}</Text>
      <View style={styles.foodList}>
        {foods.map(food => (
          <View key={food.id} style={styles.foodItem}>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodCalories}>{food.calories} calo</Text>
          </View>
        ))}
      </View>
      <Text style={styles.sectionTotal}>Tổng: {totalCalories} calo</Text>
    </View>
  );

  if (!suggestedMeal) {
    return (
      <View style={styles.container}>
        <Text>Đang tạo thực đơn...</Text>
      </View>
    );
  }

  const breakfastTotal = suggestedMeal.breakfast.reduce((sum, food) => sum + food.calories, 0);
  const lunchTotal = suggestedMeal.lunch.reduce((sum, food) => sum + food.calories, 0);
  const dinnerTotal = suggestedMeal.dinner.reduce((sum, food) => sum + food.calories, 0);
  const snacksTotal = suggestedMeal.snacks.reduce((sum, food) => sum + food.calories, 0);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderMealSection('Ăn sáng', suggestedMeal.breakfast, breakfastTotal)}
        {renderMealSection('Ăn trưa', suggestedMeal.lunch, lunchTotal)}
        {renderMealSection('Ăn tối', suggestedMeal.dinner, dinnerTotal)}
        {renderMealSection('Ăn vặt', suggestedMeal.snacks, snacksTotal)}
      </ScrollView>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Tổng kết</Text>
        <Text style={styles.calorieText}>
          Tổng calo: {suggestedMeal.totalCalories} / {targetCalories}
        </Text>
        <TouchableOpacity
          style={styles.useMealPlanButton}
          onPress={() => navigation.navigate('MealPlan', {
            targetCalories,
            goal,
          })}
        >
          <Text style={styles.useMealPlanButtonText}>Sử dụng thực đơn này</Text>
        </TouchableOpacity>
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
  foodList: {
    marginBottom: 8,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  foodName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  foodCalories: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  sectionTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginTop: 8,
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
    marginBottom: 16,
  },
  useMealPlanButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  useMealPlanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FoodSuggestionsScreen; 