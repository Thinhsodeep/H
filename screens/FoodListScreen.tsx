import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type FoodListScreenRouteProp = RouteProp<RootStackParamList, 'FoodList'>;
type FoodListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FoodList'>;

interface Food {
  id: string;
  name: string;
  calories: number;
  category: string;
  imageUrl: string;
}

const mockFoods: Food[] = [
  {
    id: '1',
    name: 'Phở bò',
    calories: 450,
    category: 'Ăn sáng',
    imageUrl: 'https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480_1_5x/img/recipe/ras/Assets/DE1752E4-0B71-4F56-8D65-8DE586E0B930/Derivates/E501E84F-FD9A-40D9-AC4A-B6ECC7AB4882.jpg',
  },
  {
    id: '2',
    name: 'Bánh mì',
    calories: 300,
    category: 'Ăn sáng',
    imageUrl: 'https://banhmibahuynh.vn/wp-content/uploads/2022/11/Banh-mi-Ba-Huynh-o-moi-1.webp',
  },
  {
    id: '3',
    name: 'Cơm tấm sườn',
    calories: 550,
    category: 'Ăn trưa',
    imageUrl: 'https://www.order.capichiapp.com/_next/image?url=https%3A%2F%2Fcdn.capichiapp.com%2Frestaurants%2Fapp_images%2F000%2F001%2F831%2Flarge%2F23H05598-min.jpg%3F1690363228&w=3840&q=75',
  },
  {
    id: '4',
    name: 'Canh chua cá lóc',
    calories: 250,
    category: 'Ăn trưa',
    imageUrl: 'https://pandafood.com.vn/wp-content/uploads/2019/08/maxresdefault-6.jpg',
  },
  {
    id: '5',
    name: 'Mì xào bò',
    calories: 600,
    category: 'Ăn tối',
    imageUrl: 'https://beptruong.edu.vn/wp-content/uploads/2024/10/cach-lam-mi-xao-bo.jpg',
  },
  {
    id: '6',
    name: 'Cháo gà',
    calories: 280,
    category: 'Ăn tối',
    imageUrl: 'https://daynauan.info.vn/wp-content/uploads/2020/08/chao-ga.jpg',
  },
  {
    id: '7',
    name: 'Sữa chua trái cây',
    calories: 120,
    category: 'Ăn vặt',
    imageUrl: 'https://cdn.tgdd.vn/2021/08/CookProduct/9916d8014b26f125dc995fa286ab98f1-1200x676.jpg',
  },
  {
    id: '8',
    name: 'Trái cây mix',
    calories: 180,
    category: 'Ăn vặt',
    imageUrl: 'https://product.hstatic.net/200000604011/product/z4332739623770_1ffeb3976c259da6114dfef92436b1a0_3f51a2eccc4949e5b52e2166d4f59409.jpg',
  },
];

const FoodListScreen: React.FC = () => {
  const route = useRoute<FoodListScreenRouteProp>();
  const navigation = useNavigation<FoodListScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);

  useEffect(() => {
    let foods = mockFoods;

    // Lọc theo danh mục
    if (route.params?.category && route.params.category !== 'Tất cả') {
      foods = foods.filter(food => food.category === route.params.category);
    }

    // Lọc theo mục tiêu calo và mục tiêu (giảm/tăng cân)
    if (route.params?.calories && route.params?.goal) {
      const targetCalories = route.params.calories;
      const goal = route.params.goal;

      foods = foods.filter(food => {
        if (goal === 'lose') {
          // Cho mục tiêu giảm cân, ưu tiên món ít calo
          return food.calories <= targetCalories;
        } else if (goal === 'gain') {
          // Cho mục tiêu tăng cân, ưu tiên món nhiều calo
          return food.calories >= targetCalories;
        }
        return true;
      });
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      foods = foods.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFoods(foods);
  }, [route.params, searchQuery]);

  const renderItem = ({ item }: { item: Food }) => (
    <TouchableOpacity
      style={styles.foodItem}
      onPress={() => navigation.navigate('FoodDetail', { food: item })}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.foodImage}
        resizeMode="cover"
      />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodCalories}>{item.calories} calo</Text>
        <Text style={styles.foodCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm món ăn..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredFoods}
        renderItem={renderItem}
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
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  listContainer: {
    padding: 16,
  },
  foodItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  foodImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  foodInfo: {
    flex: 1,
    padding: 12,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  foodCalories: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  foodCategory: {
    fontSize: 14,
    color: '#888',
  },
});

export default FoodListScreen;
