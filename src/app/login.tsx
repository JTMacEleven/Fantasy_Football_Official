import { Image } from 'expo-image';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { BrandColors, Fonts, Spacing } from '@/constants/theme';

const APP_VERSION = '1.0.0';

export default function LoginScreen() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Email and password are required.');
      return;
    }

    if (mode === 'signup') {
      if (!confirmPassword) {
        setError('Please confirm your password.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(trimmedEmail, password, rememberMe);
      } else {
        await signup(trimmedEmail, password, confirmPassword);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <Image
              source={require('@/assets/images/afroangel-logo.jpg')}
              style={styles.logo}
              contentFit="contain"
            />

            <Text style={styles.subheading}>
              {mode === 'login'
                ? 'Enter your email and password to continue.'
                : 'Create your AfroAngel Fantasy Football account.'}
            </Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="admin@afroangel.local"
              placeholderTextColor={BrandColors.silver}
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={BrandColors.silver}
              style={styles.input}
            />

            {mode === 'signup' ? (
              <>
                <Text style={styles.label}>Confirm password</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor={BrandColors.silver}
                  style={styles.input}
                />
              </>
            ) : null}

            {mode === 'login' ? (
              <View style={styles.rememberRow}>
                <Switch
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  trackColor={{ false: BrandColors.border, true: BrandColors.purple }}
                  thumbColor={rememberMe ? BrandColors.neonGreen : BrandColors.silver}
                />
                <Text style={styles.rememberText}>Remember me</Text>
              </View>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.primaryButton, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={BrandColors.black} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {mode === 'login' ? 'Login' : 'Sign up'}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setConfirmPassword('');
              }}>
              <Text style={styles.switchText}>
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Login'}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
        <Text style={styles.footer}>v{APP_VERSION} © 2026 AfroAngel DevOps</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.black,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  logo: {
    width: '100%',
    height: 140,
    marginBottom: Spacing.three,
  },
  subheading: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: BrandColors.silver,
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: Spacing.one,
  },
  input: {
    fontFamily: Fonts.sans,
    borderWidth: 1,
    borderColor: BrandColors.purple,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    color: '#FFFFFF',
    backgroundColor: BrandColors.cardBg,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  rememberText: {
    fontFamily: Fonts.sans,
    color: '#FFFFFF',
    fontSize: 14,
  },
  error: {
    fontFamily: Fonts.sans,
    color: '#FF6B6B',
    marginTop: Spacing.two,
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: Spacing.three,
    backgroundColor: BrandColors.neonGreen,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontFamily: Fonts.sans,
    color: BrandColors.black,
    fontSize: 16,
    fontWeight: '700',
  },
  switchText: {
    fontFamily: Fonts.sans,
    color: BrandColors.neonGreen,
    textAlign: 'center',
    marginTop: Spacing.three,
    fontSize: 14,
  },
  footer: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: BrandColors.silver,
    textAlign: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
});
