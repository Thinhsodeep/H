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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

type FoodSuggestionsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FoodSuggestions'>;
type FoodSuggestionsScreenRouteProp = RouteProp<RootStackParamList, 'FoodSuggestions'>;

interface Food {
  id: string;
  name: string;
  calories: number;
  category: string;
  imageBase64: string;
}

const FoodSuggestionsScreen: React.FC = () => {
  const navigation = useNavigation<FoodSuggestionsScreenNavigationProp>();
  const route = useRoute<FoodSuggestionsScreenRouteProp>();
  const { targetCalories, goal } = route.params;
  const [suggestedFoods, setSuggestedFoods] = useState<Food[]>([]);

  useEffect(() => {
    loadSuggestedFoods();
  }, []);

  const loadSuggestedFoods = async () => {
    try {
      const foodsData = await AsyncStorage.getItem('foods');
      if (foodsData) {
        const allFoods: Food[] = JSON.parse(foodsData);
        let filteredFoods: Food[] = [];

        // Lọc món ăn dựa trên mục tiêu
        switch (goal) {
          case 'lose':
            filteredFoods = allFoods.filter(food => food.calories <= 500);
            break;
          case 'gain':
            filteredFoods = allFoods.filter(food => food.calories >= 600);
            break;
          case 'maintain':
            filteredFoods = allFoods.filter(food => food.calories >= 400 && food.calories <= 700);
            break;
        }

        // Sắp xếp theo calories phù hợp với mục tiêu
        filteredFoods.sort((a, b) => {
          if (goal === 'lose') return a.calories - b.calories;
          if (goal === 'gain') return b.calories - a.calories;
          return Math.abs(a.calories - targetCalories / 3) - Math.abs(b.calories - targetCalories / 3);
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
      if (mealPlan.some(item => item.id === food.id)) {
        Alert.alert('Thông báo', 'Món ăn này đã có trong thực đơn');
        return;
      }

      mealPlan.push(food);
      await AsyncStorage.setItem('mealPlan', JSON.stringify(mealPlan));
      Alert.alert('Thành công', 'Đã thêm món ăn vào thực đơn');
    } catch (error) {
      console.error('Error adding to meal plan:', error);
      Alert.alert('Lỗi', 'Không thể thêm món ăn vào thực đơn');
    }
  };

  const renderFoodItem = ({ item }: { item: Food }) => (
    <TouchableOpacity
      style={styles.foodItem}
      onPress={() => navigation.navigate('FoodDetail', { food: item })}
    >
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
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gợi ý món ăn</Text>
        <Text style={styles.subtitle}>
          Mục tiêu: {targetCalories} calories/ngày
          {'\n'}
          Chế độ: {goal === 'lose' ? 'Giảm cân' : goal === 'gain' ? 'Tăng cân' : 'Duy trì'}
        </Text>
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
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
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