import { initializeApp, getApp, getApps } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAouLVyFRvanwzSdGfaUONzK1e_-aL6e8Q',
  authDomain: 'healthy-b17a4.firebaseapp.com',
  projectId: 'healthy-b17a4',
  storageBucket: 'healthy-b17a4.appspot.com',
  messagingSenderId: '59454643197',
  appId: '1:59454643197:android:44a72621475d686b6f9794',
  databaseURL: 'https://healthy-b17a4-default-rtdb.asia-southeast1.firebasedatabase.app'
};

// Initialize Firebase
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

// Export the initialized instances
export const authInstance = auth();
export const firestoreInstance = firestore();

// Collection names
export const COLLECTIONS = {
  FOODS: 'foods',
  USERS: 'users',
  MEAL_PLANS: 'meal_plans',
};

export interface Food {
  id: string;
  name: string;
  calories: number;
  category: string;
  imageBase64: string;
}

// Food related functions
export const foodService = {
  // Get all foods
  getAllFoods: async (): Promise<Food[]> => {
    try {
      const snapshot = await firestoreInstance.collection(COLLECTIONS.FOODS).get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Food[];
    } catch (error) {
      console.error('Error getting foods:', error);
      throw error;
    }
  },

  // Add new food
  addFood: async (foodData: Omit<Food, 'id'>): Promise<Food> => {
    try {
      const docRef = await firestoreInstance.collection(COLLECTIONS.FOODS).add(foodData);
      return {
        id: docRef.id,
        ...foodData
      };
    } catch (error) {
      console.error('Error adding food:', error);
      throw error;
    }
  },

  // Update food
  updateFood: async (foodId: string, foodData: Partial<Food>): Promise<Food> => {
    try {
      await firestoreInstance.collection(COLLECTIONS.FOODS).doc(foodId).update(foodData);
      return {
        id: foodId,
        ...foodData
      } as Food;
    } catch (error) {
      console.error('Error updating food:', error);
      throw error;
    }
  },

  // Delete food
  deleteFood: async (foodId: string): Promise<string> => {
    try {
      await firestoreInstance.collection(COLLECTIONS.FOODS).doc(foodId).delete();
      return foodId;
    } catch (error) {
      console.error('Error deleting food:', error);
      throw error;
    }
  },

  // Get foods by category
  getFoodsByCategory: async (category: string): Promise<Food[]> => {
    try {
      const snapshot = await firestoreInstance
        .collection(COLLECTIONS.FOODS)
        .where('category', '==', category)
        .get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Food[];
    } catch (error) {
      console.error('Error getting foods by category:', error);
      throw error;
    }
  },

  // Get foods by calories range
  getFoodsByCaloriesRange: async (minCalories: number, maxCalories: number): Promise<Food[]> => {
    try {
      const snapshot = await firestoreInstance
        .collection(COLLECTIONS.FOODS)
        .where('calories', '>=', minCalories)
        .where('calories', '<=', maxCalories)
        .get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Food[];
    } catch (error) {
      console.error('Error getting foods by calories range:', error);
      throw error;
    }
  },

  // Get meal plan
  getMealPlan: async (): Promise<Food[]> => {
    try {
      const snapshot = await firestoreInstance.collection(COLLECTIONS.MEAL_PLANS).get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Food[];
    } catch (error) {
      console.error('Error getting meal plan:', error);
      throw error;
    }
  },

  // Add food to meal plan
  addToMealPlan: async (food: Food): Promise<void> => {
    try {
      await firestoreInstance.collection(COLLECTIONS.MEAL_PLANS).add(food);
    } catch (error) {
      console.error('Error adding to meal plan:', error);
      throw error;
    }
  },

  // Remove food from meal plan
  removeFromMealPlan: async (foodId: string): Promise<void> => {
    try {
      await firestoreInstance.collection(COLLECTIONS.MEAL_PLANS).doc(foodId).delete();
    } catch (error) {
      console.error('Error removing from meal plan:', error);
      throw error;
    }
  }
}; 