import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Note } from '@note-app/shared-types';
import type { RootStackParamList } from '../navigation';
import { useNotes, useNoteActions } from '../hooks/use-notes';
import { useNotesStore } from '../stores/notes-store';
import { useSync } from '../hooks/use-sync';
import { NoteCard } from '../components/notes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Initialize with some demo data
const demoNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to Notes',
    content: '<p>This is your first note. Start writing!</p>',
    plainText: 'This is your first note. Start writing!',
    tags: ['welcome'],
    isPinned: true,
    isArchived: false,
    isTrashed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: { wordCount: 8, charCount: 42, readingTime: 1 },
  },
  {
    id: '2',
    title: 'Getting Started',
    content: '<p>Tips and tricks for using the app effectively.</p>',
    plainText: 'Tips and tricks for using the app effectively.',
    tags: ['tips', 'tutorial'],
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
    metadata: { wordCount: 8, charCount: 47, readingTime: 1 },
  },
  {
    id: '3',
    title: 'Meeting Notes',
    content: '<p>Discussion points from the team sync.</p>',
    plainText: 'Discussion points from the team sync.',
    tags: ['work', 'meetings'],
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
    metadata: { wordCount: 7, charCount: 40, readingTime: 1 },
  },
];

export default function NotesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { notes, pinnedNotes, unpinnedNotes, isLoading } = useNotes();
  const { togglePinNote, trashNote } = useNoteActions();
  const setNotes = useNotesStore((state) => state.setNotes);
  const { initialSync } = useSync();
  const [refreshing, setRefreshing] = React.useState(false);

  // Initialize demo data on first load
  useEffect(() => {
    if (notes.length === 0) {
      setNotes(demoNotes);
    }
  }, []);

  const handleCreateNote = useCallback(() => {
    navigation.navigate('NoteEditor', {});
  }, [navigation]);

  const handleOpenNote = useCallback((noteId: string) => {
    navigation.navigate('NoteEditor', { noteId });
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await initialSync();
    setRefreshing(false);
  }, [initialSync]);

  const handleNoteLongPress = useCallback((note: Note) => {
    Alert.alert(
      note.title || 'Untitled',
      'Choose an action',
      [
        {
          text: note.isPinned ? 'Unpin' : 'Pin',
          onPress: () => togglePinNote(note.id, !note.isPinned),
        },
        {
          text: 'Move to Trash',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Note',
              'Are you sure you want to move this note to trash?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => trashNote(note.id),
                },
              ]
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [togglePinNote, trashNote]);

  // Build sections for SectionList
  const sections = React.useMemo(() => {
    const result = [];
    if (pinnedNotes.length > 0) {
      result.push({ title: 'Pinned', data: pinnedNotes });
    }
    if (unpinnedNotes.length > 0) {
      result.push({ title: 'Notes', data: unpinnedNotes });
    }
    return result;
  }, [pinnedNotes, unpinnedNotes]);

  const renderNoteCard = useCallback(({ item }: { item: Note }) => (
    <NoteCard
      note={item}
      onPress={() => handleOpenNote(item.id)}
      onLongPress={() => handleNoteLongPress(item)}
    />
  ), [handleOpenNote, handleNoteLongPress]);

  const renderSectionHeader = useCallback(({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateNote}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderNoteCard}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#6366f1"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>No notes yet</Text>
            <Text style={styles.emptySubtext}>
              Tap + to create your first note
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fafafa',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
  listContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#71717a',
  },
});
