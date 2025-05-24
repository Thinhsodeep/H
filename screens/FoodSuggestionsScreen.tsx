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

type FoodSuggestionsScreenRouteProp = RouteProp<RootStackParamList, 'FoodSuggestions'>;

const FoodSuggestionsScreen: React.FC = () => {
  const route = useRoute<FoodSuggestionsScreenRouteProp>();
  const { targetCalories, goal } = route.params;
  const [suggestedFoods, setSuggestedFoods] = useState<Food[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadSuggestedFoods();
  }, [selectedCategory]);

  const loadSuggestedFoods = async () => {
    try {
      let foods: Food[] = [];
      
      if (selectedCategory) {
        foods = await foodService.getFoodsByCategory(selectedCategory);
      } else {
        foods = await foodService.getAllFoods();
      }

      // Lọc theo mục tiêu và calories
      foods = foods.filter(food => {
        switch (goal) {
          case 'lose':
            return food.calories <= targetCalories * 0.3; // 30% calories cho mỗi bữa
          case 'gain':
            return food.calories >= targetCalories * 0.2; // 20% calories cho mỗi bữa
          case 'maintain':
            return food.calories <= targetCalories * 0.25; // 25% calories cho mỗi bữa
          default:
            return true;
        }
      });

      // Sắp xếp theo calories
      foods.sort((a, b) => {
        if (goal === 'lose') {
          return a.calories - b.calories;
        } else if (goal === 'gain') {
          return b.calories - a.calories;
        }
        return Math.abs(a.calories - targetCalories * 0.25) - Math.abs(b.calories - targetCalories * 0.25);
      });

      setSuggestedFoods(foods);
    } catch (error) {
      console.error('Error loading suggested foods:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách món ăn gợi ý');
    }
  };

  const addToMealPlan = async (food: Food) => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm món ăn vào thực đơn');
        return;
      }

      const mealPlanData = await foodService.getMealPlan(userId);
      let mealPlan: Food[] = [];
      
      if (mealPlanData) {
        mealPlan = mealPlanData;
      }

      // Kiểm tra xem món ăn đã có trong thực đơn chưa
      const isDuplicate = mealPlan.some(item => item.id === food.id);
      if (isDuplicate) {
        Alert.alert('Thông báo', 'Món ăn này đã có trong thực đơn');
        return;
      }

      // Thêm món ăn vào thực đơn
      await foodService.addToMealPlan(userId, food);
      Alert.alert('Thành công', 'Đã thêm món ăn vào thực đơn');
    } catch (error) {
      console.error('Error adding to meal plan:', error);
      Alert.alert('Lỗi', 'Không thể thêm món ăn vào thực đơn');
    }
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
        <Text style={styles.foodCalories}>{item.calories} calories</Text>
        <Text style={styles.foodCategory}>{item.category}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addToMealPlan(item)}
      >
        <Icon name="add-circle" size={32} color="#4CAF50" />
      </TouchableOpacity>
    </View>
  );

  const categories = ['Ăn sáng', 'Ăn trưa', 'Ăn tối', 'Ăn vặt'];

  return (
    <View style={styles.container}>
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

      {suggestedFoods.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="restaurant" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Không có món ăn nào phù hợp</Text>
          <Text style={styles.emptySubText}>
            Hãy thử chọn danh mục khác hoặc điều chỉnh mục tiêu calories
          </Text>
        </View>
      ) : (
        <FlatList
          data={suggestedFoods}
          renderItem={renderFoodItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  addButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default FoodSuggestionsScreen; 