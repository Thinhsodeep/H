import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  email: string;
  isAdmin: boolean;
}

const UserManagementScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await AsyncStorage.getItem('users');
      if (usersData) {
        setUsers(JSON.parse(usersData));
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    }
  };

  const toggleAdminStatus = async (email: string) => {
    try {
      const updatedUsers = users.map(user =>
        user.email === email ? { ...user, isAdmin: !user.isAdmin } : user
      );
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      Alert.alert('Thành công', 'Đã cập nhật quyền người dùng');
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật quyền người dùng');
    }
  };

  const deleteUser = async (email: string) => {
    try {
      const updatedUsers = users.filter(user => user.email !== email);
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      Alert.alert('Thành công', 'Đã xóa người dùng');
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Lỗi', 'Không thể xóa người dùng');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Icon name="person" size={24} color="#4CAF50" />
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={[styles.userRole, item.isAdmin && styles.adminRole]}>
          {item.isAdmin ? 'Admin' : 'User'}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleAdminStatus(item.email)}
        >
          <Icon
            name={item.isAdmin ? 'admin-panel-settings' : 'person'}
            size={24}
            color="#4CAF50"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Alert.alert(
              'Xác nhận xóa',
              'Bạn có chắc chắn muốn xóa người dùng này?',
              [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', onPress: () => deleteUser(item.email), style: 'destructive' },
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
          placeholder="Tìm kiếm người dùng..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item.email}
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
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userEmail: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  adminRole: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default UserManagementScreen; 