import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { BottomTabInset, BrandColors, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';

function formatLastLogin(iso: string | null) {
  if (!iso) return 'Never';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType = 'default',
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={BrandColors.silver}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function MyProfileScreen() {
  const { user, logout, updateProfileDetails, updateEmail, updatePassword } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [fplId, setFplId] = useState(user?.fplId ?? '');

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailPassword, setEmailPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName);
    setPhoneNumber(user.phoneNumber ?? '');
    setFplId(user.fplId ?? '');
  }, [user]);

  if (!user) return null;

  async function handleSaveProfile() {
    setProfileError('');
    setProfileMessage('');
    setProfileSaving(true);
    try {
      await updateProfileDetails({
        displayName: displayName.trim() || user!.displayName,
        phoneNumber: phoneNumber.trim() || null,
        fplId: fplId.trim() || null,
      });
      setProfileMessage('Profile updated.');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not update profile.');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangeEmail() {
    setEmailError('');
    setEmailMessage('');
    setEmailSaving(true);
    try {
      await updateEmail(emailPassword, newEmail.trim());
      setEmailMessage('Email updated.');
      setEmailPassword('');
      setNewEmail('');
      setShowEmailForm(false);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Could not update email.');
    } finally {
      setEmailSaving(false);
    }
  }

  async function handleChangePassword() {
    setPasswordError('');
    setPasswordMessage('');
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setPasswordSaving(true);
    try {
      await updatePassword(currentPassword, newPassword, confirmPassword);
      setPasswordMessage('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(user.displayName)}</Text>
            </View>
            <Text style={styles.name}>{user.displayName}</Text>
            <Text style={styles.username}>@{user.username}</Text>
          </View>

          <Section title="Account overview">
            <InfoRow label="Email" value={user.email} />
            <View style={styles.divider} />
            <InfoRow label="Last login" value={formatLastLogin(user.lastLoginAt)} />
          </Section>

          <Section title="Profile details">
            <Field
              label="Display name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              autoCapitalize="words"
            />
            <Field
              label="Phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+1 555 000 0000"
              keyboardType="phone-pad"
            />
            <Field
              label="FPL ID"
              value={fplId}
              onChangeText={setFplId}
              placeholder="Your unique Fantasy Premier League ID"
            />
            <Text style={styles.hint}>FPL ID must be unique across all users.</Text>

            {profileError ? <Text style={styles.error}>{profileError}</Text> : null}
            {profileMessage ? <Text style={styles.success}>{profileMessage}</Text> : null}

            <Pressable
              style={[styles.primaryButton, profileSaving && styles.buttonDisabled]}
              onPress={handleSaveProfile}
              disabled={profileSaving}>
              {profileSaving ? (
                <ActivityIndicator color={BrandColors.black} />
              ) : (
                <Text style={styles.primaryButtonText}>Save profile</Text>
              )}
            </Pressable>
          </Section>

          <Section title="Security">
            <Pressable
              style={styles.secondaryAction}
              onPress={() => {
                setShowEmailForm((v) => !v);
                setEmailError('');
                setEmailMessage('');
              }}>
              <Text style={styles.secondaryActionText}>Change email</Text>
              <Text style={styles.chevron}>{showEmailForm ? '−' : '+'}</Text>
            </Pressable>

            {showEmailForm ? (
              <View style={styles.nestedForm}>
                <Field
                  label="Current password"
                  value={emailPassword}
                  onChangeText={setEmailPassword}
                  secureTextEntry
                />
                <Field
                  label="New email"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                />
                {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
                {emailMessage ? <Text style={styles.success}>{emailMessage}</Text> : null}
                <Pressable
                  style={[styles.primaryButton, emailSaving && styles.buttonDisabled]}
                  onPress={handleChangeEmail}
                  disabled={emailSaving}>
                  {emailSaving ? (
                    <ActivityIndicator color={BrandColors.black} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Update email</Text>
                  )}
                </Pressable>
              </View>
            ) : null}

            <View style={styles.divider} />

            <Pressable
              style={styles.secondaryAction}
              onPress={() => {
                setShowPasswordForm((v) => !v);
                setPasswordError('');
                setPasswordMessage('');
              }}>
              <Text style={styles.secondaryActionText}>Change password</Text>
              <Text style={styles.chevron}>{showPasswordForm ? '−' : '+'}</Text>
            </Pressable>

            {showPasswordForm ? (
              <View style={styles.nestedForm}>
                <Field
                  label="Current password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                />
                <Field
                  label="New password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
                <Field
                  label="Confirm new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
                {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
                {passwordMessage ? <Text style={styles.success}>{passwordMessage}</Text> : null}
                <Pressable
                  style={[styles.primaryButton, passwordSaving && styles.buttonDisabled]}
                  onPress={handleChangePassword}
                  disabled={passwordSaving}>
                  {passwordSaving ? (
                    <ActivityIndicator color={BrandColors.black} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Update password</Text>
                  )}
                </Pressable>
              </View>
            ) : null}
          </Section>

          <Pressable style={styles.logoutButton} onPress={() => logout()}>
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </ScrollView>
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
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.five,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    gap: Spacing.three,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    gap: Spacing.one,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: BrandColors.purpleDark,
    borderWidth: 2,
    borderColor: BrandColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  avatarText: {
    fontFamily: Fonts.sans,
    fontSize: 28,
    fontWeight: '700',
    color: BrandColors.neonGreen,
  },
  name: {
    fontFamily: Fonts.sans,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  username: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: BrandColors.silver,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.neonGreen,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: Spacing.one,
  },
  card: {
    backgroundColor: BrandColors.cardBg,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  infoLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: BrandColors.silver,
  },
  infoValue: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#FFFFFF',
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: BrandColors.border,
    marginVertical: Spacing.one,
  },
  field: {
    gap: Spacing.one,
  },
  fieldLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: BrandColors.silver,
  },
  input: {
    fontFamily: Fonts.sans,
    borderWidth: 1,
    borderColor: BrandColors.purple,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    color: '#FFFFFF',
    backgroundColor: BrandColors.black,
    fontSize: 14,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: BrandColors.silver,
    marginTop: -Spacing.one,
  },
  nestedForm: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  secondaryAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  secondaryActionText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chevron: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    color: BrandColors.neonGreen,
    fontWeight: '700',
  },
  primaryButton: {
    marginTop: Spacing.one,
    backgroundColor: BrandColors.neonGreen,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two + 2,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontFamily: Fonts.sans,
    color: BrandColors.black,
    fontSize: 14,
    fontWeight: '700',
  },
  error: {
    fontFamily: Fonts.sans,
    color: '#FF6B6B',
    fontSize: 13,
    textAlign: 'center',
  },
  success: {
    fontFamily: Fonts.sans,
    color: BrandColors.neonGreen,
    fontSize: 13,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: Spacing.two,
    borderWidth: 1,
    borderColor: BrandColors.purple,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: Fonts.sans,
    color: BrandColors.neonGreen,
    fontSize: 15,
    fontWeight: '700',
  },
});
