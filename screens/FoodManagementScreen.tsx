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
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { foodService } from '../config/firebase';
import * as ImagePicker from 'react-native-image-picker';

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
    imageBase64: '',
  });

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    try {
      const foodsData = await foodService.getAllFoods();
      setFoods(foodsData as Food[]);
    } catch (error) {
      console.error('Error loading foods:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách món ăn');
    }
  };

  const handleImagePicker = () => {
    ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 800,
      maxWidth: 800,
    }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets?.[0]?.base64) {
        setNewFood(prev => ({
          ...prev,
          imageBase64: response.assets[0].base64
        }));
      }
    });
  };

  const handleAddFood = async () => {
    try {
      if (!newFood.name || !newFood.calories || !newFood.category) {
        Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
        return;
      }

      if (editingFood) {
        await foodService.updateFood(editingFood.id, newFood);
        Alert.alert('Thành công', 'Đã cập nhật món ăn');
      } else {
        await foodService.addFood(newFood);
        Alert.alert('Thành công', 'Đã thêm món ăn mới');
      }

      setModalVisible(false);
      setEditingFood(null);
      setNewFood({
        name: '',
        calories: 0,
        category: 'Ăn sáng',
        imageBase64: '',
      });
      loadFoods();
    } catch (error) {
      console.error('Error saving food:', error);
      Alert.alert('Lỗi', 'Không thể lưu món ăn');
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    try {
      await foodService.deleteFood(foodId);
      Alert.alert('Thành công', 'Đã xóa món ăn');
      loadFoods();
    } catch (error) {
      console.error('Error deleting food:', error);
      Alert.alert('Lỗi', 'Không thể xóa món ăn');
    }
  };

  const editFood = (food: Food) => {
    setEditingFood(food);
    setNewFood({
      name: food.name,
      calories: food.calories,
      category: food.category,
      imageBase64: food.imageBase64,
    });
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
                { text: 'Xóa', onPress: () => handleDeleteFood(item.id), style: 'destructive' },
              ]
            );
          }}
        >
          <Icon name="delete" size={24} color="#FF5252" />
        </TouchableOpacity>
      </View>
    </View>
  );

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

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingFood ? 'Sửa món ăn' : 'Thêm món ăn mới'}
            </Text>

            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={handleImagePicker}
            >
              {newFood.imageBase64 ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${newFood.imageBase64}` }}
                  style={styles.previewImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="add-a-photo" size={32} color="#666" />
                  <Text style={styles.imagePlaceholderText}>Thêm hình ảnh</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Tên món ăn"
              value={newFood.name}
              onChangeText={text => setNewFood({ ...newFood, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Calories"
              keyboardType="numeric"
              value={newFood.calories?.toString()}
              onChangeText={text => setNewFood({ ...newFood, calories: parseInt(text) || 0 })}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              {['Ăn sáng', 'Ăn trưa', 'Ăn tối', 'Ăn vặt'].map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    newFood.category === category && styles.selectedCategory,
                  ]}
                  onPress={() => setNewFood({ ...newFood, category })}
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
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setEditingFood(null);
                  setNewFood({
                    name: '',
                    calories: 0,
                    category: 'Ăn sáng',
                    imageBase64: '',
                  });
                }}
              >
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddFood}
              >
                <Text style={[styles.modalButtonText, styles.saveButtonText]}>
                  {editingFood ? 'Cập nhật' : 'Thêm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingFood(null);
          setNewFood({
            name: '',
            calories: 0,
            category: 'Ăn sáng',
            imageBase64: '',
          });
          setModalVisible(true);
        }}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
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
    marginBottom: 16,
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
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
  modalButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  saveButtonText: {
    color: '#fff',
  },
  imagePickerButton: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
  },
});

export default FoodManagementScreen; 