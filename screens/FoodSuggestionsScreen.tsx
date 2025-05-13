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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

type FoodSuggestionsScreenRouteProp = RouteProp<RootStackParamList, 'FoodSuggestions'>;

interface Food {
  id: string;
  name: string;
  calories: number;
  category: string;
  imageBase64: string;
}

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
      const foodsData = await AsyncStorage.getItem('foods_global');
      if (foodsData) {
        const allFoods: Food[] = JSON.parse(foodsData);
        let filteredFoods = allFoods;

        // Lọc theo category nếu có
        if (selectedCategory) {
          filteredFoods = filteredFoods.filter(food => food.category === selectedCategory);
        }

        // Lọc theo mục tiêu và calories
        filteredFoods = filteredFoods.filter(food => {
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
        filteredFoods.sort((a, b) => {
          if (goal === 'lose') {
            return a.calories - b.calories;
          } else if (goal === 'gain') {
            return b.calories - a.calories;
          }
          return Math.abs(a.calories - targetCalories * 0.25) - Math.abs(b.calories - targetCalories * 0.25);
        });

        setSuggestedFoods(filteredFoods);
      }
    } catch (error) {
      console.error('Error loading suggested foods:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách món ăn gợi ý');
    }
  };

  const addToMealPlan = async (food: Food) => {
    try {
      const mealPlanData = await AsyncStorage.getItem('mealPlan');
      let mealPlan: Food[] = [];
      
      if (mealPlanData) {
        mealPlan = JSON.parse(mealPlanData);
      }

      // Kiểm tra xem món ăn đã có trong thực đơn chưa
      const isDuplicate = mealPlan.some(item => item.id === food.id);
      if (isDuplicate) {
        Alert.alert('Thông báo', 'Món ăn này đã có trong thực đơn');
        return;
      }

      // Thêm món ăn vào thực đơn
      mealPlan.push(food);
      await AsyncStorage.setItem('mealPlan', JSON.stringify(mealPlan));
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

      <FlatList
        data={suggestedFoods}
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
});

export default FoodSuggestionsScreen; 