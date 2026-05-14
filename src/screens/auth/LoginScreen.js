import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../theme/ThemeContext';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const { colors, isDarkMode } = useContext(ThemeContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      Alert.alert('Login Failed', e.message);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={colors.background} style={StyleSheet.absoluteFillObject} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.header}>
            <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="school" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to sync your resources</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(800).springify()} style={styles.form}>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                placeholder="Email Address"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.loginBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Sign In</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchBtn} onPress={() => navigation.navigate('SignUp')}>
              <Text style={[styles.switchBtnText, { color: colors.textSecondary }]}>
                Don't have an account? <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 32 },
  header: { alignItems: 'center', marginBottom: 48 },
  iconWrapper: { width: 96, height: 96, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -1, marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: '500' },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, marginBottom: 16, height: 60 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, fontWeight: '600' },
  loginBtn: { height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 16, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  loginBtnText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  switchBtn: { marginTop: 32, alignItems: 'center' },
  switchBtnText: { fontSize: 15 },
});

export default LoginScreen;
