import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { getWordCount } from '@note-app/shared-utils';
import { AUTO_SAVE_DELAY } from '@note-app/shared-constants';
import type { RootStackParamList } from '../navigation';
import { useNote, useNoteActions } from '../hooks/use-notes';
import { useDebouncedCallback } from '../hooks/use-debounce';
import AIActionSheet from '../components/editor/AIActionSheet';

type NoteEditorRouteProp = RouteProp<RootStackParamList, 'NoteEditor'>;

export default function NoteEditorScreen() {
  const navigation = useNavigation();
  const route = useRoute<NoteEditorRouteProp>();
  const { noteId } = route.params || {};

  const { note } = useNote(noteId);
  const { createNote, saveNote, togglePinNote, trashNote } = useNoteActions();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState<string | undefined>(noteId);
  const [showAISheet, setShowAISheet] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Load note data when editing existing note
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.plainText);
    }
  }, [note]);

  // Track changes
  useEffect(() => {
    if (note) {
      setHasChanges(title !== note.title || content !== note.plainText);
    } else {
      setHasChanges(title.length > 0 || content.length > 0);
    }
  }, [title, content, note]);

  // Auto-save with debounce
  const debouncedSave = useDebouncedCallback(
    async (id: string, t: string, c: string) => {
      setSaveStatus('saving');
      try {
        await saveNote(id, {
          title: t.trim() || 'Untitled',
          content: `<p>${c}</p>`,
          plainText: c,
        });
        setSaveStatus('saved');
      } catch (error) {
        setSaveStatus('unsaved');
      }
    },
    AUTO_SAVE_DELAY
  );

  // Trigger auto-save when content changes (only for existing notes)
  useEffect(() => {
    if (currentNoteId && hasChanges) {
      setSaveStatus('unsaved');
      debouncedSave(currentNoteId, title, content);
    }
  }, [title, content, currentNoteId, hasChanges, debouncedSave]);

  const handleSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) {
      navigation.goBack();
      return;
    }

    try {
      setSaveStatus('saving');
      if (currentNoteId) {
        await saveNote(currentNoteId, {
          title: title.trim() || 'Untitled',
          content: `<p>${content}</p>`,
          plainText: content,
        });
      } else {
        const newNote = await createNote({
          title: title.trim() || 'Untitled',
          content: `<p>${content}</p>`,
          plainText: content,
          tags: [],
        });
        setCurrentNoteId(newNote.id);
      }
      setSaveStatus('saved');
      setHasChanges(false);
      navigation.goBack();
    } catch (error) {
      setSaveStatus('unsaved');
      Alert.alert('Error', 'Failed to save note');
    }
  }, [title, content, currentNoteId, saveNote, createNote, navigation]);

  const handleClose = useCallback(() => {
    if (hasChanges && saveStatus === 'unsaved') {
      Alert.alert(
        'Unsaved Changes',
        'Do you want to save your changes?',
        [
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save', onPress: handleSave },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [hasChanges, saveStatus, handleSave, navigation]);

  const handlePin = useCallback(async () => {
    if (currentNoteId && note) {
      await togglePinNote(currentNoteId, !note.isPinned);
    }
  }, [currentNoteId, note, togglePinNote]);

  const handleDelete = useCallback(() => {
    if (currentNoteId) {
      Alert.alert(
        'Delete Note',
        'Are you sure you want to move this note to trash?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await trashNote(currentNoteId);
              navigation.goBack();
            },
          },
        ]
      );
    }
  }, [currentNoteId, trashNote, navigation]);

  const handleAIApply = useCallback((newText: string) => {
    setContent(newText);
  }, []);

  const wordCount = getWordCount(content);

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'unsaved':
        return 'Unsaved changes';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.headerButton}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            {currentNoteId && (
              <>
                <TouchableOpacity onPress={handlePin} style={styles.iconButton}>
                  <Text style={styles.iconButtonText}>
                    {note?.isPinned ? '📌' : '📍'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
                  <Text style={styles.iconButtonText}>🗑️</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={handleSave}>
              <Text style={[styles.headerButton, styles.saveButton]}>
                {hasChanges ? 'Save' : 'Done'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} keyboardDismissMode="interactive">
          <TextInput
            style={styles.titleInput}
            placeholder="Note title"
            placeholderTextColor="#71717a"
            value={title}
            onChangeText={setTitle}
            multiline={false}
            autoFocus={!noteId}
          />
          <TextInput
            style={styles.contentInput}
            placeholder="Start writing..."
            placeholderTextColor="#71717a"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.statusBar}>
            <Text style={styles.wordCount}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </Text>
            <Text style={[
              styles.saveStatusText,
              saveStatus === 'unsaved' && styles.unsavedText,
            ]}>
              {getSaveStatusText()}
            </Text>
          </View>
          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.toolbarButton}>
              <Text style={styles.toolbarButtonText}>B</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <Text style={[styles.toolbarButtonText, { fontStyle: 'italic' }]}>
                I
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <Text style={styles.toolbarButtonText}>H</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <Text style={styles.toolbarButtonText}>•</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <Text style={styles.toolbarButtonText}>✓</Text>
            </TouchableOpacity>
            <View style={styles.toolbarSpacer} />
            <TouchableOpacity
              style={styles.aiButton}
              onPress={() => setShowAISheet(true)}
              disabled={!content.trim()}
            >
              <Text style={styles.aiButtonText}>AI ✨</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <AIActionSheet
        visible={showAISheet}
        selectedText={content}
        onClose={() => setShowAISheet(false)}
        onApply={handleAIApply}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    fontSize: 17,
    color: '#6366f1',
  },
  saveButton: {
    fontWeight: '600',
  },
  iconButton: {
    padding: 4,
  },
  iconButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fafafa',
    marginBottom: 16,
    padding: 0,
  },
  contentInput: {
    fontSize: 16,
    color: '#fafafa',
    lineHeight: 24,
    padding: 0,
    minHeight: 300,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    backgroundColor: '#18181b',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  wordCount: {
    fontSize: 12,
    color: '#71717a',
  },
  saveStatusText: {
    fontSize: 12,
    color: '#71717a',
  },
  unsavedText: {
    color: '#f59e0b',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toolbarButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  toolbarButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#a1a1aa',
  },
  toolbarSpacer: {
    flex: 1,
  },
  aiButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
