import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatRelativeTime, truncate } from '@note-app/shared-utils';
import type { Note } from '@note-app/shared-types';
import type { RootStackParamList } from '../navigation';
import { useNotes, useNoteActions } from '../hooks/use-notes';
import { useNotesStore } from '../stores/notes-store';

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
  const [refreshing, setRefreshing] = React.useState(false);

  // Initialize demo data on first load
  useEffect(() => {
    if (notes.length === 0) {
      setNotes(demoNotes);
    }
  }, []);

  const handleCreateNote = () => {
    navigation.navigate('NoteEditor', {});
  };

  const handleOpenNote = (noteId: string) => {
    navigation.navigate('NoteEditor', { noteId });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Sync notes from server
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const renderNoteCard = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => handleOpenNote(item.id)}
      onLongPress={() => {
        // TODO: Show action sheet
      }}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {item.title || 'Untitled'}
        </Text>
        {item.isPinned && <Text style={styles.pinIndicator}>📌</Text>}
      </View>
      <Text style={styles.notePreview} numberOfLines={2}>
        {truncate(item.plainText, 150)}
      </Text>
      <View style={styles.noteMeta}>
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {item.tags.length > 2 && (
            <Text style={styles.moreTagsText}>+{item.tags.length - 2}</Text>
          )}
        </View>
        <Text style={styles.dateText}>
          {formatRelativeTime(new Date(item.updatedAt))}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <>
      {pinnedNotes.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pinned</Text>
        </View>
      )}
    </>
  );

  const SectionSeparator = () => {
    if (pinnedNotes.length > 0 && unpinnedNotes.length > 0) {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notes</Text>
        </View>
      );
    }
    return null;
  };

  // Combine pinned and unpinned with section separators
  const allNotes = [...pinnedNotes, ...unpinnedNotes];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateNote}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={allNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderNoteCard}
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
    padding: 16,
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteCard: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fafafa',
    flex: 1,
  },
  pinIndicator: {
    marginLeft: 8,
  },
  notePreview: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 12,
    lineHeight: 20,
  },
  noteMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tag: {
    backgroundColor: '#27272a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#a1a1aa',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#71717a',
  },
  dateText: {
    fontSize: 12,
    color: '#71717a',
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
