import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatRelativeTime } from '@note-app/shared-utils';
import { useAuth } from '../hooks/use-auth';
import { useAppStore } from '../stores/app-store';
import { useNotesStore } from '../stores/notes-store';
import { config } from '../lib/config';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { isSyncing, lastSyncedAt, isOnline } = useAppStore();
  const { notes } = useNotesStore();
  const [darkMode, setDarkMode] = React.useState(true);
  const [autoSync, setAutoSync] = React.useState(true);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const handleSyncNow = async () => {
    // TODO: Implement manual sync
    Alert.alert('Sync', 'Syncing notes...');
  };

  const handleExportData = () => {
    const exportData = JSON.stringify({ notes }, null, 2);
    Alert.alert(
      'Export',
      `Your ${notes.length} notes are ready to export.\n\nNote: Full export functionality coming soon.`
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your local notes. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement clear all data
            Alert.alert('Cleared', 'All local data has been cleared.');
          },
        },
      ]
    );
  };

  const userInitial = user?.displayName?.[0] || user?.email?.[0] || 'U';
  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || 'Not signed in';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userInitial.toUpperCase()}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userEmail}>{userEmail}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <ActivityIndicator color="#ef4444" />
              ) : (
                <Text style={styles.signOutText}>Sign Out</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Sync Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Auto Sync</Text>
                <Text style={styles.settingDescription}>
                  Automatically sync notes across devices
                </Text>
              </View>
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: '#27272a', true: '#6366f1' }}
                thumbColor="#fafafa"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Status</Text>
                <Text style={styles.settingDescription}>
                  {isSyncing
                    ? 'Syncing...'
                    : isOnline
                    ? 'Connected'
                    : 'Offline'}
                </Text>
              </View>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: isOnline ? '#22c55e' : '#71717a' },
                ]}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Last Synced</Text>
                <Text style={styles.settingDescription}>
                  {lastSyncedAt
                    ? formatRelativeTime(lastSyncedAt)
                    : 'Never'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
                onPress={handleSyncNow}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <ActivityIndicator color="#fafafa" size="small" />
                ) : (
                  <Text style={styles.syncButtonText}>Sync Now</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>
                  Use dark theme
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#27272a', true: '#6366f1' }}
                thumbColor="#fafafa"
              />
            </View>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Notes</Text>
                <Text style={styles.settingDescription}>
                  {notes.length} {notes.length === 1 ? 'note' : 'notes'} stored locally
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleExportData}
            >
              <View>
                <Text style={styles.settingLabel}>Export Notes</Text>
                <Text style={styles.settingDescription}>
                  Download all notes as JSON
                </Text>
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleClearData}
            >
              <View>
                <Text style={[styles.settingLabel, styles.dangerText]}>
                  Clear All Data
                </Text>
                <Text style={styles.settingDescription}>
                  Delete all local notes
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.settingValue}>{config.app.version}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fafafa',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717a',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    overflow: 'hidden',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fafafa',
  },
  userEmail: {
    fontSize: 14,
    color: '#71717a',
  },
  signOutButton: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#fafafa',
  },
  settingDescription: {
    fontSize: 14,
    color: '#71717a',
    marginTop: 2,
  },
  settingValue: {
    fontSize: 16,
    color: '#71717a',
  },
  divider: {
    height: 1,
    backgroundColor: '#27272a',
    marginLeft: 16,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  syncButton: {
    backgroundColor: '#27272a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    opacity: 0.7,
  },
  syncButtonText: {
    fontSize: 14,
    color: '#fafafa',
  },
  dangerText: {
    color: '#ef4444',
  },
});
