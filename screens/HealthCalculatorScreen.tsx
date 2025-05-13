import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface HealthCalculatorScreenProps {
  navigation: {
    navigate: (screen: string, params: any) => void;
  };
}

const HealthCalculatorScreen: React.FC<HealthCalculatorScreenProps> = ({ navigation }) => {
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goal, setGoal] = useState('maintain');
  const [results, setResults] = useState<{
    bmi: number;
    bmiCategory: string;
    tdee: number;
    recommendedCalories: number;
  } | null>(null);

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Thiếu cân';
    if (bmi < 25) return 'Bình thường';
    if (bmi < 30) return 'Thừa cân';
    return 'Béo phì';
  };

  const calculateTDEE = (weight: number, height: number, age: number, gender: string, activityLevel: string) => {
    // Công thức Mifflin-St Jeor
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;

    const activityMultipliers = {
      sedentary: 1.2,      // Ít vận động
      light: 1.375,        // Vận động nhẹ
      moderate: 1.55,      // Vận động vừa phải
      active: 1.725,       // Vận động nhiều
      veryActive: 1.9      // Vận động rất nhiều
    };

    return bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];
  };

  const getRecommendedCalories = (tdee: number, goal: string) => {
    switch (goal) {
      case 'lose':
        return tdee - 500; // Giảm 500 calo để giảm cân
      case 'gain':
        return tdee + 500; // Tăng 500 calo để tăng cân
      default:
        return tdee; // Duy trì cân nặng
    }
  };

  const handleCalculate = () => {
    if (!age || !height || !weight) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseInt(age);

    if (isNaN(weightNum) || isNaN(heightNum) || isNaN(ageNum)) {
      Alert.alert('Lỗi', 'Vui lòng nhập số hợp lệ');
      return;
    }

    const bmi = calculateBMI(weightNum, heightNum);
    const bmiCategory = getBMICategory(bmi);
    const tdee = calculateTDEE(weightNum, heightNum, ageNum, gender, activityLevel);
    const recommendedCalories = getRecommendedCalories(tdee, goal);

    setResults({
      bmi,
      bmiCategory,
      tdee,
      recommendedCalories,
    });
  };

  const handleViewFoodSuggestions = () => {
    if (!results) return;

    navigation.navigate('FoodList', {
      category: 'Tất cả',
      calories: results.recommendedCalories,
      goal: goal,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tính toán TDEE & BMI</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Giới tính</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(value) => setGender(value)}
              style={styles.picker}
            >
              <Picker.Item label="Nam" value="male" />
              <Picker.Item label="Nữ" value="female" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tuổi</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tuổi của bạn"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Chiều cao (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập chiều cao của bạn"
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Cân nặng (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập cân nặng của bạn"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mức độ vận động</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={activityLevel}
              onValueChange={(value) => setActivityLevel(value)}
              style={styles.picker}
            >
              <Picker.Item label="Ít vận động" value="sedentary" />
              <Picker.Item label="Vận động nhẹ" value="light" />
              <Picker.Item label="Vận động vừa phải" value="moderate" />
              <Picker.Item label="Vận động nhiều" value="active" />
              <Picker.Item label="Vận động rất nhiều" value="veryActive" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mục tiêu</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={goal}
              onValueChange={(value) => setGoal(value)}
              style={styles.picker}
            >
              <Picker.Item label="Giảm cân" value="lose" />
              <Picker.Item label="Duy trì cân nặng" value="maintain" />
              <Picker.Item label="Tăng cân" value="gain" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
          <Text style={styles.calculateButtonText}>Tính toán</Text>
        </TouchableOpacity>

        {results && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Kết quả</Text>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>BMI:</Text>
              <Text style={styles.resultValue}>{results.bmi.toFixed(1)}</Text>
              <Text style={styles.resultCategory}>({results.bmiCategory})</Text>
            </View>

            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>TDEE:</Text>
              <Text style={styles.resultValue}>{Math.round(results.tdee)} calo/ngày</Text>
            </View>

            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Calo khuyến nghị:</Text>
              <Text style={styles.resultValue}>{Math.round(results.recommendedCalories)} calo/ngày</Text>
            </View>

            <TouchableOpacity
              style={styles.suggestionsButton}
              onPress={handleViewFoodSuggestions}
            >
              <Text style={styles.suggestionsButtonText}>Xem danh sách món ăn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.suggestionsButton, { marginTop: 10, backgroundColor: '#4CAF50' }]}
              onPress={() => navigation.navigate('MealPlan', {
                targetCalories: Math.round(results.recommendedCalories),
                goal: goal,
              })}
            >
              <Text style={styles.suggestionsButtonText}>Tạo thực đơn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#4CAF50' }]}
              onPress={() => navigation.navigate('FoodSuggestions', {
                targetCalories: results.recommendedCalories,
                goal,
              })}
            >
              <Text style={styles.buttonText}>Xem gợi ý thực đơn</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  calculateButton: {
    backgroundColor: '#4CAF50',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  resultCategory: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  suggestionsButton: {
    backgroundColor: '#2196F3',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  suggestionsButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#4CAF50',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HealthCalculatorScreen; 