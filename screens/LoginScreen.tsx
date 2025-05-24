// screens/LoginScreen.tsx
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
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getUserData = async (userId: string, retryCount = 0): Promise<any> => {
    try {
      const app = getApp();
      const userDoc = await firestore(app)
        .collection('users')
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      return userDoc.data();
    } catch (error: any) {
      if (error.code === 'firestore/unavailable' && retryCount < 3) {
        // Đợi 1 giây trước khi thử lại
        await new Promise(resolve => setTimeout(resolve, 1000));
        return getUserData(userId, retryCount + 1);
      }
      throw error;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Lỗi', 'Email không đúng định dạng');
      return;
    }

    setLoading(true);
    console.log('Bắt đầu đăng nhập với email:', email);

    try {
      // Lấy instance của Firebase app
      const app = getApp();
      console.log('Đang xác thực với Firebase...');
      
      // Đăng nhập với email và password
      const userCredential = await auth(app).signInWithEmailAndPassword(email.trim(), password);
      console.log('Đăng nhập thành công, user:', userCredential.user.uid);

      // Lấy thông tin người dùng từ Firestore với retry logic
      console.log('Đang lấy thông tin người dùng từ Firestore...');
      const userData = await getUserData(userCredential.user.uid);
      console.log('Thông tin người dùng:', userData);

      if (userData?.role === 'admin') {
        console.log('Chuyển hướng đến trang Admin');
        navigation.replace('Admin');
      } else {
        console.log('Chuyển hướng đến trang Home');
        navigation.replace('Home');
      }
    } catch (error: any) {
      console.error('Chi tiết lỗi:', error);
      let errorMessage = 'Đã xảy ra lỗi khi đăng nhập';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Email hoặc mật khẩu không đúng';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email không đúng định dạng';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại';
      } else if (error.code === 'auth/timeout') {
        errorMessage = 'Kết nối quá thời gian. Vui lòng kiểm tra kết nối mạng và thử lại';
      } else if (error.code === 'firestore/unavailable') {
        errorMessage = 'Không thể kết nối đến cơ sở dữ liệu. Vui lòng thử lại sau';
      } else if (error.message === 'Không tìm thấy thông tin người dùng') {
        errorMessage = 'Không tìm thấy thông tin người dùng. Vui lòng liên hệ quản trị viên';
      }
      
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
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
          <Text style={styles.title}>Đăng nhập</Text>
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
              autoCorrect={false}
              editable={!loading}
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
              editable={!loading}
            />
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate('Signup')}
            disabled={loading}
          >
            <Text style={styles.signupButtonText}>
              Chưa có tài khoản? Đăng ký ngay
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
  loginButton: {
    backgroundColor: '#4CAF50',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
});

export default LoginScreen;
