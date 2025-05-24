import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { foodService, Food } from '../config/firebase';

type FoodListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FoodList'>;
type FoodListScreenRouteProp = RouteProp<RootStackParamList, 'FoodList'>;

const FoodListScreen: React.FC = () => {
  const navigation = useNavigation<FoodListScreenNavigationProp>();
  const route = useRoute<FoodListScreenRouteProp>();
  const { category, calories: routeCalories, goal } = route.params || {};
  const [foods, setFoods] = useState<Food[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(category || null);
  const [calories, setCalories] = useState<number | null>(routeCalories || null);

  useEffect(() => {
    loadFoods();
  }, [selectedCategory, calories]);

  const loadFoods = async () => {
    try {
      let foods: Food[] = [];
      
      if (selectedCategory) {
        foods = await foodService.getFoodsByCategory(selectedCategory);
      } else {
        foods = await foodService.getAllFoods();
      }

      // Lọc theo calories nếu có
      if (calories) {
        foods = foods.filter(food => food.calories <= calories);
      }

      // Sắp xếp theo calories
      foods.sort((a, b) => a.calories - b.calories);

      setFoods(foods);
    } catch (error) {
      console.error('Error loading foods:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách món ăn');
    }
  };

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
    </TouchableOpacity>
  );

  const categories = ['Ăn sáng', 'Ăn trưa', 'Ăn tối', 'Ăn vặt'];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm món ăn..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
        </ScrollView>
      </View>

      <FlatList
        data={filteredFoods}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
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
});

export default FoodListScreen;
