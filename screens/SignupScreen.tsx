import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSignup = async () => {
    try {
      if (!email || !password || !confirmPassword) {
        Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
        return;
      }

      const usersData = await AsyncStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : [];

      if (users.some((user: any) => user.email === email)) {
        Alert.alert('Lỗi', 'Email đã được sử dụng');
        return;
      }

      const newUser = {
        email,
        password,
        isAdmin,
      };

      await AsyncStorage.setItem('users', JSON.stringify([...users, newUser]));
      await AsyncStorage.setItem('userEmail', email);

      Alert.alert(
        'Thành công',
        'Đăng ký thành công!',
        [
          {
            text: 'OK',
            onPress: () => {
              if (isAdmin) {
                navigation.replace('Admin');
              } else {
                navigation.replace('Home');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error during signup:', error);
      Alert.alert('Lỗi', 'Không thể đăng ký. Vui lòng thử lại.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Icon name="restaurant" size={64} color="#4CAF50" />
          <Text style={styles.title}>Đăng ký</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Icon name="email" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.adminToggle, isAdmin && styles.adminToggleActive]}
            onPress={() => setIsAdmin(!isAdmin)}
          >
            <Icon
              name={isAdmin ? 'admin-panel-settings' : 'person'}
              size={24}
              color={isAdmin ? '#fff' : '#4CAF50'}
            />
            <Text
              style={[
                styles.adminToggleText,
                isAdmin && styles.adminToggleTextActive,
              ]}
            >
              {isAdmin ? 'Quản trị viên' : 'Người dùng thường'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.signupButtonText}>Đăng ký</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>
              Đã có tài khoản? Đăng nhập ngay
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  adminToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    marginBottom: 16,
  },
  adminToggleActive: {
    backgroundColor: '#4CAF50',
  },
  adminToggleText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4CAF50',
  },
  adminToggleTextActive: {
    color: '#fff',
  },
  signupButton: {
    backgroundColor: '#4CAF50',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#4CAF50',
    fontSize: 16,
  },
});

export default SignupScreen;
