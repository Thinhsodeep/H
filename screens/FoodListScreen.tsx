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

export const mockFoods: Food[] = [
  // Ăn sáng
  {
    id: '1',
    name: 'Phở bò',
    calories: 550,
    category: 'Ăn sáng',
    imageUrl: 'https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480_1_5x/img/recipe/ras/Assets/DE1752E4-0B71-4F56-8D65-8DE586E0B930/Derivates/E501E84F-FD9A-40D9-AC4A-B6ECC7AB4882.jpg',
  },
  {
    id: '2',
    name: 'Bánh mì thịt',
    calories: 480,
    category: 'Ăn sáng',
    imageUrl: 'https://banhmibahuynh.vn/wp-content/uploads/2022/11/Banh-mi-Ba-Huynh-o-moi-1.webp',
  },
  {
    id: '3',
    name: 'Xôi mặn',
    calories: 520,
    category: 'Ăn sáng',
    imageUrl: 'https://bepxua.vn/wp-content/uploads/2022/04/cach-nau-xoi-man.jpg',
  },
  {
    id: '4',
    name: 'Bún bò Huế',
    calories: 580,
    category: 'Ăn sáng',
    imageUrl: 'https://i.ytimg.com/vi/CSI9ildGX9s/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCxhRIyoYY7k9ZuxY0YOC9jNFLapg',
  },
  {
    id: '5',
    name: 'Cháo lòng',
    calories: 450,
    category: 'Ăn sáng',
    imageUrl: 'https://icdn.dantri.com.vn/thumb_w/680/2024/01/31/quan-chao-long-ngon-o-ha-noi-16124886805101388065702-1706704946707.jpg',
  },
  {
    id: '6',
    name: 'Bún riêu cua',
    calories: 500,
    category: 'Ăn sáng',
    imageUrl: 'https://cdn.tgdd.vn/2020/08/CookProduct/Untitled-1-1200x676-10.jpg',
  },
  {
    id: '7',
    name: 'Bánh cuốn',
    calories: 480,
    category: 'Ăn sáng',
    imageUrl: 'https://feedthepudge.com/wp-content/uploads/2025/02/Banh-Cuon-Cover--1024x683.webp',
  },

  // Ăn trưa
  {
    id: '8',
    name: 'Cơm sườn',
    calories: 650,
    category: 'Ăn trưa',
    imageUrl: 'https://www.order.capichiapp.com/_next/image?url=https%3A%2F%2Fcdn.capichiapp.com%2Frestaurants%2Fapp_images%2F000%2F001%2F831%2Flarge%2F23H05598-min.jpg%3F1690363228&w=3840&q=75',
  },
  {
    id: '9',
    name: 'Cơm gà xối mỡ',
    calories: 700,
    category: 'Ăn trưa',
    imageUrl: 'https://cdn.tgdd.vn/2022/01/CookDish/cach-lam-com-ga-chien-xoi-mo-ngon-da-vang-gion-rum-dom-gian-avt-1200x676.jpg',
  },
  {
    id: '10',
    name: 'Bún chả',
    calories: 570,
    category: 'Ăn trưa',
    imageUrl: 'https://www.seriouseats.com/thmb/J0g7JWjk9r6CHESo1CIrD1BfGd0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/20231204-SEA-VyTran-BunChaHanoi-19-f623913c6ef34a9185bcd6e5680c545f.jpg',
  },
  {
    id: '11',
    name: 'Phở cuốn',
    calories: 530,
    category: 'Ăn trưa',
    imageUrl: 'https://barona.vn/storage/meo-vat/51/cach-lam-pho-cuon-thit-bo.jpg',
  },
  {
    id: '12',
    name: 'Cơm rang thập cẩm',
    calories: 670,
    category: 'Ăn trưa',
    imageUrl: 'https://nuocmamtin.com/wp-content/uploads/2021/10/com-rang-thap-cam-2.jpg',
  },
  {
    id: '13',
    name: 'Bún bò Nam Bộ',
    calories: 600,
    category: 'Ăn trưa',
    imageUrl: 'https://cdn.mediamart.vn/images/news/cach-lam-bun-bo-nam-b-chun-v-hp-dn-ai-an-cung-me_95e65352.jpg',
  },

  // Ăn tối
  {
    id: '14',
    name: 'Lẩu hải sản',
    calories: 800,
    category: 'Ăn tối',
    imageUrl: 'https://lh5.googleusercontent.com/proxy/qXO9jtJhY-c8SvE-MAfAA97BA8fziu0Bpqoa934baZmYbSb0auy0EKECXoAd4mbcARq8TVN9Api6SxItz7MSIJ1sopH4wI_nQTc6v6CafI0JB3vp-NsL57YbZiSh90IJN6zxR1hDreDruUmAnhbyIkpFMYWdUk2QfoY6',
  },
  {
    id: '15',
    name: 'Cơm rang dưa bò',
    calories: 630,
    category: 'Ăn tối',
    imageUrl: 'https://afamilycdn.com/150157425591193600/2023/12/17/cong-thuc-lam-com-rang-dua-bo-ngon-chuan-vi-ha-noi1-1702799295172-17027992956191958849824.jpg',
  },
  {
    id: '16',
    name: 'Bún riêu cua',
    calories: 500,
    category: 'Ăn tối',
    imageUrl: 'https://i.ytimg.com/vi/C1P1Cw9J1-I/maxresdefault.jpg',
  },
  {
    id: '17',
    name: 'Lẩu Thái',
    calories: 750,
    category: 'Ăn tối',
    imageUrl: 'https://sgtt.thesaigontimes.vn/wp-content/uploads/2025/01/2024_1_23_638416491645237808_mach-ban-cach-nau-lau-thai-bang-goi-gia-vi_960.jpg',
  },
  {
    id: '18',
    name: 'Cơm gà nướng',
    calories: 670,
    category: 'Ăn tối',
    imageUrl: 'https://file.hstatic.net/200000700229/article/com-tam-ga-nuong-thumb_5945b01705c349e4b01aca9534a53a84.jpg',
  },

  // Ăn vặt
  {
    id: '19',
    name: 'Bánh tráng trộn',
    calories: 320,
    category: 'Ăn vặt',
    imageUrl: 'https://i-giadinh.vnecdn.net/2023/08/05/mon-7-1691221823-6409-1691221866.jpg',
  },
  {
    id: '20',
    name: 'Chè khúc bạch',
    calories: 280,
    category: 'Ăn vặt',
    imageUrl: 'https://cdn.buffetposeidon.com/app/media/Kham-pha-am-thuc/04.2024/190424-lam-che-khuc-bach-buffet-poseidon-01.jpeg',
  },
  {
    id: '21',
    name: 'Bánh flan',
    calories: 250,
    category: 'Ăn vặt',
    imageUrl: 'https://static.hawonkoo.vn/hwks1/images/2023/07/cach-lam-banh-flan-bang-noi-chien-khong-dau-1-1.jpg',
  },
  {
    id: '22',
    name: 'Kem trái cây',
    calories: 220,
    category: 'Ăn vặt',
    imageUrl: 'https://danviet.mediacdn.vn/296231569849192448/2021/7/6/1-1625507746087908266247.jpg',
  },
  {
    id: '23',
    name: 'Bánh tiêu',
    calories: 180,
    category: 'Ăn vặt',
    imageUrl: 'https://fullofplants.com/wp-content/uploads/2020/05/super-tender-hollow-sesame-brioche-vietnamese-inspired-vegan-banh-tieu-thumb.jpg',
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
