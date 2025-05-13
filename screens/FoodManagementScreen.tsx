import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'react-native-image-picker';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

type FoodManagementScreenRouteProp = RouteProp<RootStackParamList, 'FoodManagement'>;

interface Food {
  id: string;
  name: string;
  calories: number;
  category: string;
  imageBase64: string;
}

const FoodManagementScreen: React.FC = () => {
  const route = useRoute<FoodManagementScreenRouteProp>();
  const userId = route.params?.userId || 'default';
  const [foods, setFoods] = useState<Food[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [newFood, setNewFood] = useState<Partial<Food>>({
    name: '',
    calories: 0,
    category: 'Ăn sáng',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    validateAndFixData();
    loadFoods();
  }, [userId]);

  const getStorageKey = () => {
    // Nếu là admin, sử dụng key chung
    if (userId === 'admin') {
      return 'foods_global';
    }
    // Nếu là user thường, sử dụng key riêng
    return `foods_${userId}`;
  };

  const loadFoods = async () => {
    try {
      console.log('Loading foods for userId:', userId);
      const foodsData = await AsyncStorage.getItem('foods_global');
      console.log('Foods data from storage:', foodsData);

      if (foodsData) {
        try {
          const parsedFoods = JSON.parse(foodsData);
          console.log('Parsed foods:', parsedFoods);
          if (Array.isArray(parsedFoods)) {
            setFoods(parsedFoods);
          } else {
            console.error('Invalid foods data format');
            setFoods([]);
          }
        } catch (e) {
          console.error('Error parsing foods data:', e);
          setFoods([]);
        }
      } else {
        console.log('No foods data found');
        setFoods([]);
      }
    } catch (error) {
      console.error('Error loading foods:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách món ăn');
    }
  };

  const handleImagePick = () => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: true,
      maxHeight: 200,
      maxWidth: 200,
      quality: 0.3 as const,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Lỗi', 'Không thể chọn hình ảnh');
      } else {
        const base64 = response.assets?.[0]?.base64;
        if (base64) {
          setSelectedImage(base64);
          setNewFood(prev => ({ ...prev, imageBase64: base64 }));
        }
      }
    });
  };

  const saveFood = async () => {
    if (!newFood.name || !newFood.calories || !newFood.category) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const newFoodItem: Food = {
        id: Date.now().toString(),
        name: newFood.name,
        calories: Number(newFood.calories),
        category: newFood.category,
        imageBase64: selectedImage || '',
      };

      console.log('Saving new food item:', newFoodItem);

      // Lấy dữ liệu hiện tại từ AsyncStorage
      const existingFoodsData = await AsyncStorage.getItem('foods_global');
      let currentFoods: Food[] = [];
      
      if (existingFoodsData) {
        try {
          currentFoods = JSON.parse(existingFoodsData);
          console.log('Existing foods:', currentFoods);
        } catch (e) {
          console.error('Error parsing existing foods:', e);
        }
      }

      // Thêm món ăn mới vào danh sách hiện tại
      const updatedFoods = [...currentFoods, newFoodItem];
      console.log('Updated foods list:', updatedFoods);

      // Lưu danh sách đã cập nhật vào AsyncStorage
      await AsyncStorage.setItem('foods_global', JSON.stringify(updatedFoods));
      
      // Cập nhật state
      setFoods(updatedFoods);
      setModalVisible(false);
      setNewFood({ name: '', calories: 0, category: 'Ăn sáng' });
      setSelectedImage(null);
      Alert.alert('Thành công', 'Đã thêm món ăn mới');
    } catch (error) {
      console.error('Error saving food:', error);
      Alert.alert('Lỗi', 'Không thể lưu món ăn');
    }
  };

  const deleteFood = async (id: string) => {
    try {
      const updatedFoods = foods.filter(food => food.id !== id);
      await AsyncStorage.setItem('foods_global', JSON.stringify(updatedFoods));
      setFoods(updatedFoods);
      Alert.alert('Thành công', 'Đã xóa món ăn');
    } catch (error) {
      console.error('Error deleting food:', error);
      Alert.alert('Lỗi', 'Không thể xóa món ăn');
    }
  };

  const editFood = (food: Food) => {
    setEditingFood(food);
    setNewFood(food);
    setModalVisible(true);
  };

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => editFood(item)}
        >
          <Icon name="edit" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Alert.alert(
              'Xác nhận xóa',
              'Bạn có chắc chắn muốn xóa món ăn này?',
              [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', onPress: () => deleteFood(item.id), style: 'destructive' },
              ]
            );
          }}
        >
          <Icon name="delete" size={24} color="#FF5252" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const validateAndFixData = async () => {
    try {
      const foodsData = await AsyncStorage.getItem(getStorageKey());
      if (foodsData) {
        try {
          const parsedFoods = JSON.parse(foodsData);
          if (!Array.isArray(parsedFoods)) {
            // Nếu dữ liệu không phải mảng, xóa và tạo mảng mới
            await AsyncStorage.setItem(getStorageKey(), JSON.stringify([]));
            setFoods([]);
          }
        } catch (e) {
          // Nếu có lỗi parse, xóa dữ liệu cũ
          await AsyncStorage.setItem(getStorageKey(), JSON.stringify([]));
          setFoods([]);
        }
      }
    } catch (error) {
      console.error('Error validating data:', error);
    }
  };

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

      <FlatList
        data={filteredFoods}
        renderItem={renderFoodItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingFood(null);
          setNewFood({
            name: '',
            calories: 0,
            category: 'Ăn sáng',
          });
          setModalVisible(true);
        }}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm món ăn mới</Text>
            
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={handleImagePick}
            >
              {selectedImage ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${selectedImage}` }}
                  style={styles.previewImage}
                />
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  <Icon name="add-a-photo" size={32} color="#4CAF50" />
                  <Text style={styles.imagePickerText}>Chọn hình ảnh</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Tên món ăn"
              value={newFood.name}
              onChangeText={(text) => setNewFood(prev => ({ ...prev, name: text }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Calories"
              keyboardType="numeric"
              value={newFood.calories?.toString()}
              onChangeText={(text) => setNewFood(prev => ({ ...prev, calories: Number(text) }))}
            />

            <View style={styles.categoryContainer}>
              {['Ăn sáng', 'Ăn trưa', 'Ăn tối', 'Ăn vặt'].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    newFood.category === category && styles.selectedCategory,
                  ]}
                  onPress={() => setNewFood(prev => ({ ...prev, category }))}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      newFood.category === category && styles.selectedCategoryText,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewFood({ name: '', calories: 0, category: 'Ăn sáng' });
                  setSelectedImage(null);
                }}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveFood}
              >
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    marginBottom: 8,
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imagePickerButton: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imagePickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default FoodManagementScreen; 