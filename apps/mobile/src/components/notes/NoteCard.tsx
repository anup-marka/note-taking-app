import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { Note } from '@note-app/shared-types';
import { formatRelativeTime, truncate } from '@note-app/shared-utils';
import { TagList } from '../ui/Tag';
import { haptics } from '../../lib/haptics';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function NoteCard({ note, onPress, onLongPress }: NoteCardProps) {
  const preview = truncate(note.plainText, 120);
  const timeAgo = formatRelativeTime(new Date(note.updatedAt));

  const handlePress = useCallback(() => {
    haptics.light();
    onPress();
  }, [onPress]);

  const handleLongPress = useCallback(() => {
    haptics.medium();
    onLongPress?.();
  }, [onLongPress]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {note.isPinned && <Text style={styles.pinIcon}>📌</Text>}
          <Text style={styles.title} numberOfLines={1}>
            {note.title || 'Untitled'}
          </Text>
        </View>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>

      {preview && (
        <Text style={styles.preview} numberOfLines={2}>
          {preview}
        </Text>
      )}

      {note.tags && note.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          <TagList tags={note.tags} maxTags={3} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  pinIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fafafa',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#71717a',
  },
  preview: {
    fontSize: 14,
    color: '#a1a1aa',
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsContainer: {
    marginTop: 4,
  },
});
