// FoodDetailScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FoodDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FoodDetail'>;
type FoodDetailScreenRouteProp = RouteProp<RootStackParamList, 'FoodDetail'>;

interface Food {
  id: string;
  name: string;
  calories: number;
  category: string;
  imageBase64: string;
}

const FoodDetailScreen: React.FC = () => {
  const navigation = useNavigation<FoodDetailScreenNavigationProp>();
  const route = useRoute<FoodDetailScreenRouteProp>();
  const { food } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = async () => {
    try {
      const favoritesData = await AsyncStorage.getItem('favorites');
      let favorites: Food[] = [];
      
      if (favoritesData) {
        favorites = JSON.parse(favoritesData);
      }

      if (isFavorite) {
        favorites = favorites.filter(f => f.id !== food.id);
      } else {
        favorites.push(food);
      }

      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
      Alert.alert(
        'Thành công',
        isFavorite ? 'Đã xóa khỏi mục yêu thích' : 'Đã thêm vào mục yêu thích'
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật mục yêu thích');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {food.imageBase64 ? (
        <Image
          source={{ uri: `data:image/jpeg;base64,${food.imageBase64}` }}
          style={styles.foodImage}
        />
      ) : (
        <View style={styles.foodImagePlaceholder}>
          <Icon name="restaurant" size={64} color="#4CAF50" />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.foodName}>{food.name}</Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <Icon
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={24}
              color={isFavorite ? '#FF5252' : '#666'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Icon name="local-fire-department" size={24} color="#FF5252" />
            <Text style={styles.infoText}>{food.calories} calories</Text>
          </View>

          <View style={styles.infoItem}>
            <Icon name="category" size={24} color="#4CAF50" />
            <Text style={styles.infoText}>{food.category}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            // TODO: Implement add to meal plan functionality
            Alert.alert('Thông báo', 'Tính năng đang được phát triển');
          }}
        >
          <Text style={styles.addButtonText}>Thêm vào kế hoạch ăn uống</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  foodImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  foodImagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FoodDetailScreen;
