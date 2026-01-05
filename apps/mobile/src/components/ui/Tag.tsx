import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { TAG_COLORS, DEFAULT_TAG_COLOR } from '@note-app/shared-constants';

interface TagProps {
  name: string;
  color?: string;
  size?: 'small' | 'medium';
  onPress?: () => void;
  onRemove?: () => void;
  style?: ViewStyle;
}

export default function Tag({
  name,
  color = DEFAULT_TAG_COLOR,
  size = 'small',
  onPress,
  onRemove,
  style,
}: TagProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.tag,
        styles[size],
        { backgroundColor: `${color}20` },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, styles[`${size}Text`]]}>{name}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Text style={styles.removeText}>×</Text>
        </TouchableOpacity>
      )}
    </Container>
  );
}

interface TagListProps {
  tags: string[];
  colors?: Record<string, string>;
  maxTags?: number;
  onTagPress?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  style?: ViewStyle;
}

export function TagList({
  tags,
  colors = {},
  maxTags,
  onTagPress,
  onTagRemove,
  style,
}: TagListProps) {
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const hiddenCount = maxTags ? Math.max(0, tags.length - maxTags) : 0;

  return (
    <View style={[styles.tagList, style]}>
      {displayTags.map((tag, index) => (
        <Tag
          key={tag}
          name={tag}
          color={colors[tag] || TAG_COLORS[index % TAG_COLORS.length]}
          onPress={onTagPress ? () => onTagPress(tag) : undefined}
          onRemove={onTagRemove ? () => onTagRemove(tag) : undefined}
        />
      ))}
      {hiddenCount > 0 && (
        <View style={styles.moreTag}>
          <Text style={styles.moreText}>+{hiddenCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    gap: 4,
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    color: '#fafafa',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  removeButton: {
    marginLeft: 4,
  },
  removeText: {
    fontSize: 16,
    color: '#a1a1aa',
    fontWeight: '500',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  moreTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#27272a',
    borderRadius: 6,
  },
  moreText: {
    fontSize: 12,
    color: '#71717a',
  },
});
