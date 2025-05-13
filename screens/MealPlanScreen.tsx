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

type MealPlanScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MealPlan'>;
type MealPlanScreenRouteProp = RouteProp<RootStackParamList, 'MealPlan'>;

interface Food {
  id: string;
  name: string;
  calories: number;
  category: string;
  imageBase64: string;
}

const MealPlanScreen: React.FC = () => {
  const navigation = useNavigation<MealPlanScreenNavigationProp>();
  const route = useRoute<MealPlanScreenRouteProp>();
  const { targetCalories, goal } = route.params;
  const [mealPlan, setMealPlan] = useState<Food[]>([]);

  useEffect(() => {
    loadMealPlan();
  }, []);

  const loadMealPlan = async () => {
    try {
      const mealPlanData = await AsyncStorage.getItem('mealPlan');
      if (mealPlanData) {
        const foods: Food[] = JSON.parse(mealPlanData);
        setMealPlan(foods);
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
      Alert.alert('Lỗi', 'Không thể tải thực đơn');
    }
  };

  const removeFromMealPlan = async (foodId: string) => {
    try {
      const updatedMealPlan = mealPlan.filter(food => food.id !== foodId);
      await AsyncStorage.setItem('mealPlan', JSON.stringify(updatedMealPlan));
      setMealPlan(updatedMealPlan);
      Alert.alert('Thành công', 'Đã xóa món ăn khỏi thực đơn');
    } catch (error) {
      console.error('Error removing from meal plan:', error);
      Alert.alert('Lỗi', 'Không thể xóa món ăn khỏi thực đơn');
    }
  };

  const getTotalCalories = () => {
    return mealPlan.reduce((total, food) => total + food.calories, 0);
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
        <Icon name="remove-circle" size={32} color="#FF5252" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thực đơn của bạn</Text>
        <Text style={styles.subtitle}>
          Mục tiêu: {targetCalories} calories/ngày
          {'\n'}
          Chế độ: {goal === 'lose' ? 'Giảm cân' : goal === 'gain' ? 'Tăng cân' : 'Duy trì'}
        </Text>
        <View style={styles.calorieInfo}>
          <Text style={styles.calorieText}>
            Tổng calo: {getTotalCalories()} / {targetCalories}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((getTotalCalories() / targetCalories) * 100, 100)}%`,
                  backgroundColor:
                    getTotalCalories() > targetCalories
                      ? '#FF5252'
                      : getTotalCalories() < targetCalories * 0.9
                      ? '#FFA726'
                      : '#4CAF50',
                },
              ]}
            />
          </View>
        </View>
      </View>

      <FlatList
        data={mealPlan}
        renderItem={renderFoodItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="restaurant" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có món ăn trong thực đơn</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('FoodSuggestions', { targetCalories, goal })}
            >
              <Text style={styles.addButtonText}>Thêm món ăn</Text>
            </TouchableOpacity>
          </View>
        }
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
    marginBottom: 16,
  },
  calorieInfo: {
    marginTop: 8,
  },
  calorieText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MealPlanScreen; 