import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { foodService, Food } from '../config/firebase';
import auth from '@react-native-firebase/auth';

type MealPlanScreenRouteProp = RouteProp<RootStackParamList, 'MealPlan'>;

const MealPlanScreen: React.FC = () => {
  const route = useRoute<MealPlanScreenRouteProp>();
  const { targetCalories, goal } = route.params;
  const [mealPlan, setMealPlan] = useState<Food[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [totalCalories, setTotalCalories] = useState(0);

  useEffect(() => {
    loadMealPlan();
  }, [selectedCategory]);

  useEffect(() => {
    // Tính tổng calories mỗi khi mealPlan thay đổi
    const total = mealPlan.reduce((sum, food) => sum + (food.calories || 0), 0);
    setTotalCalories(total);
  }, [mealPlan]);

  const loadMealPlan = async () => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem thực đơn');
        return;
      }

      const foods = await foodService.getMealPlan(userId);
      
      // Lọc theo category nếu có
      if (selectedCategory) {
        const filteredFoods = foods.filter(food => food.category === selectedCategory);
        setMealPlan(filteredFoods);
      } else {
        setMealPlan(foods);
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
      Alert.alert('Lỗi', 'Không thể tải thực đơn');
    }
  };

  const removeFromMealPlan = async (foodId: string) => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để xóa món ăn khỏi thực đơn');
        return;
      }

      await foodService.removeFromMealPlan(userId, foodId);
      const updatedMealPlan = mealPlan.filter(food => food.id !== foodId);
      setMealPlan(updatedMealPlan);
      Alert.alert('Thành công', 'Đã xóa món ăn khỏi thực đơn');
    } catch (error) {
      console.error('Error removing from meal plan:', error);
      Alert.alert('Lỗi', 'Không thể xóa món ăn khỏi thực đơn');
    }
  };

  const getProgressColor = () => {
    const percentage = totalCalories / targetCalories;
    
    if (percentage < 0.8) return '#FFA726'; // Orange
    if (percentage > 1.2) return '#EF5350'; // Red
    return '#4CAF50'; // Green
  };

  const renderFoodItem = ({ item }: { item: Food }) => (
    <View style={styles.foodItem}>
      {item.imageBase64 ? (
        <Image
          source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
          style={styles.foodImage}
        />
      ) : (
        <View style={styles.foodImagePlaceholder}>
          <Icon name="restaurant" size={32} color="#4CAF50" />
        </View>
      )}
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodCalories}>{Math.round(item.calories || 0)} calories</Text>
        <Text style={styles.foodCategory}>{item.category}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => {
          Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa món ăn này khỏi thực đơn?',
            [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Xóa', onPress: () => removeFromMealPlan(item.id), style: 'destructive' },
            ]
          );
        }}
      >
        <Icon name="remove-circle" size={32} color="#EF5350" />
      </TouchableOpacity>
    </View>
  );

  const categories = ['Ăn sáng', 'Ăn trưa', 'Ăn tối', 'Ăn vặt'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thực đơn của bạn</Text>
        <View style={styles.calorieInfo}>
          <Text style={styles.calorieText}>
            Tổng calories: {Math.round(totalCalories).toLocaleString()} / {Math.round(targetCalories).toLocaleString()}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: getProgressColor() }]} />
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            !selectedCategory && styles.selectedCategory,
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.categoryText,
              !selectedCategory && styles.selectedCategoryText,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={mealPlan}
        renderItem={renderFoodItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  calorieInfo: {
    marginTop: 8,
  },
  calorieText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  categoryContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  foodImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  foodCalories: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 2,
  },
  foodCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
});

export default MealPlanScreen; 