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
  // Ăn sáng
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
    id: '9',
    name: 'Xôi mặn',
    calories: 350,
    category: 'Ăn sáng',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-xoi-man-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  {
    id: '10',
    name: 'Bún bò Huế',
    calories: 500,
    category: 'Ăn sáng',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-bun-bo-hue-cuc-ngon-va-don-gian-tai-nha-202201250230038502.jpg',
  },
  {
    id: '11',
    name: 'Cháo lòng',
    calories: 400,
    category: 'Ăn sáng',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-chao-long-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  {
    id: '21',
    name: 'Bún riêu cua',
    calories: 450,
    category: 'Ăn sáng',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-bun-rieu-cua-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  {
    id: '22',
    name: 'Bánh cuốn',
    calories: 380,
    category: 'Ăn sáng',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-banh-cuon-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  // Ăn trưa
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
    id: '12',
    name: 'Cơm gà xối mỡ',
    calories: 600,
    category: 'Ăn trưa',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-com-ga-xoi-mo-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  {
    id: '13',
    name: 'Bún chả',
    calories: 450,
    category: 'Ăn trưa',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-bun-cha-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  {
    id: '14',
    name: 'Phở cuốn',
    calories: 400,
    category: 'Ăn trưa',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-pho-cuon-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  {
    id: '23',
    name: 'Cơm rang thập cẩm',
    calories: 580,
    category: 'Ăn trưa',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-com-rang-thap-cam-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  {
    id: '24',
    name: 'Bún bò Nam Bộ',
    calories: 480,
    category: 'Ăn trưa',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-bun-bo-nam-bo-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  // Ăn tối
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
    id: '15',
    name: 'Lẩu hải sản',
    calories: 700,
    category: 'Ăn tối',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-lau-hai-san-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  {
    id: '16',
    name: 'Cơm rang dưa bò',
    calories: 550,
    category: 'Ăn tối',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-com-rang-dua-bo-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  {
    id: '17',
    name: 'Bún riêu cua',
    calories: 450,
    category: 'Ăn tối',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-bun-rieu-cua-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  {
    id: '25',
    name: 'Lẩu Thái',
    calories: 650,
    category: 'Ăn tối',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-lau-thai-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  {
    id: '26',
    name: 'Cơm gà nướng',
    calories: 520,
    category: 'Ăn tối',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-com-ga-nuong-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  // Ăn vặt
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
  {
    id: '18',
    name: 'Bánh tráng trộn',
    calories: 250,
    category: 'Ăn vặt',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-banh-trang-tron-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  {
    id: '19',
    name: 'Chè khúc bạch',
    calories: 200,
    category: 'Ăn vặt',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-che-khuc-bach-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  {
    id: '20',
    name: 'Bánh flan',
    calories: 150,
    category: 'Ăn vặt',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-banh-flan-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  {
    id: '27',
    name: 'Kem trái cây',
    calories: 180,
    category: 'Ăn vặt',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-kem-trai-cay-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
  {
    id: '28',
    name: 'Bánh tiêu',
    calories: 120,
    category: 'Ăn vặt',
    imageUrl: 'https://cdn.tgdd.vn/Files/2022/01/25/1413824/cach-lam-banh-tieu-thom-ngon-don-gian-tai-nha-202201250230038502.jpg',
  },
];

// Hàm chuyển đổi tiếng Việt có dấu thành không dấu
const removeVietnameseTones = (str: string): string => {
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
  str = str.replace(/ + /g, " ");
  str = str.trim();
  return str;
};

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
          return food.calories <= targetCalories;
        } else if (goal === 'gain') {
          return food.calories >= targetCalories;
        }
        return true;
      });
    }

    // Lọc theo từ khóa tìm kiếm (hỗ trợ cả có dấu và không dấu)
    if (searchQuery) {
      const normalizedSearchQuery = removeVietnameseTones(searchQuery);
      foods = foods.filter(food => {
        const normalizedFoodName = removeVietnameseTones(food.name);
        return normalizedFoodName.includes(normalizedSearchQuery);
      });
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
