import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../theme/ThemeContext';

const SignUpScreen = ({ navigation }) => {
  const { signup } = useContext(AuthContext);
  const { colors, isDarkMode } = useContext(ThemeContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, name);
    } catch (e) {
      Alert.alert('Sign Up Failed', e.message);
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
              <Ionicons name="person-add" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Join Resourcely today</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(800).springify()} style={styles.form}>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

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

            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirm Password"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 4 }}>
                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.loginBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleSignUp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Create Account</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchBtn} onPress={() => navigation.goBack()}>
              <Text style={[styles.switchBtnText, { color: colors.textSecondary }]}>
                Already have an account? <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Sign In</Text>
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

export default SignUpScreen;
