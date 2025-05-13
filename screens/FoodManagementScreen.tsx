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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Food {
  id: string;
  name: string;
  calories: number;
  category: string;
  imageUrl: string;
}

const FoodManagementScreen: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [newFood, setNewFood] = useState<Partial<Food>>({
    name: '',
    calories: 0,
    category: 'breakfast',
    imageUrl: '',
  });

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    try {
      const foodsData = await AsyncStorage.getItem('foods');
      if (foodsData) {
        setFoods(JSON.parse(foodsData));
      }
    } catch (error) {
      console.error('Error loading foods:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách món ăn');
    }
  };

  const saveFood = async () => {
    try {
      if (!newFood.name || !newFood.calories || !newFood.category) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
        return;
      }

      let updatedFoods;
      if (editingFood) {
        updatedFoods = foods.map(food =>
          food.id === editingFood.id ? { ...newFood, id: food.id } as Food : food
        );
      } else {
        const newId = Date.now().toString();
        updatedFoods = [...foods, { ...newFood, id: newId } as Food];
      }

      await AsyncStorage.setItem('foods', JSON.stringify(updatedFoods));
      setFoods(updatedFoods);
      setModalVisible(false);
      setEditingFood(null);
      setNewFood({
        name: '',
        calories: 0,
        category: 'breakfast',
        imageUrl: '',
      });
      Alert.alert('Thành công', 'Đã lưu món ăn');
    } catch (error) {
      console.error('Error saving food:', error);
      Alert.alert('Lỗi', 'Không thể lưu món ăn');
    }
  };

  const deleteFood = async (id: string) => {
    try {
      const updatedFoods = foods.filter(food => food.id !== id);
      await AsyncStorage.setItem('foods', JSON.stringify(updatedFoods));
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
      <View style={styles.foodInfo}>
        <Icon name="restaurant" size={24} color="#4CAF50" />
        <View style={styles.foodDetails}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodCategory}>{item.category}</Text>
          <Text style={styles.foodCalories}>{item.calories} calories</Text>
        </View>
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
            category: 'breakfast',
            imageUrl: '',
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
            <Text style={styles.modalTitle}>
              {editingFood ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
            </Text>

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

            <TextInput
              style={styles.input}
              placeholder="Danh mục (breakfast/lunch/dinner/snack)"
              value={newFood.category}
              onChangeText={text => setNewFood({ ...newFood, category: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="URL hình ảnh"
              value={newFood.imageUrl}
              onChangeText={text => setNewFood({ ...newFood, imageUrl: text })}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  foodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  foodDetails: {
    marginLeft: 8,
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  foodCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  foodCalories: {
    fontSize: 14,
    color: '#4CAF50',
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
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    marginBottom: 12,
    fontSize: 16,
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
    backgroundColor: '#FF5252',
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
});

export default FoodManagementScreen; 