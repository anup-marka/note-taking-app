import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AIAction } from '@note-app/shared-types';
import { AI_ACTIONS } from '@note-app/shared-constants';
import { useAI } from '../../hooks/use-ai';

interface AIActionSheetProps {
  visible: boolean;
  selectedText: string;
  onClose: () => void;
  onApply: (newText: string) => void;
}

const AI_ACTION_LIST: Array<{ key: AIAction; label: string; icon: string; description: string }> = [
  { key: 'improve', label: 'Improve writing', icon: '✨', description: 'Make the text clearer and more engaging' },
  { key: 'expand', label: 'Expand', icon: '📝', description: 'Add more detail and explanation' },
  { key: 'summarize', label: 'Summarize', icon: '📋', description: 'Create a concise summary' },
  { key: 'simplify', label: 'Simplify', icon: '💡', description: 'Use simpler language' },
  { key: 'fix-grammar', label: 'Fix grammar', icon: '✓', description: 'Correct spelling and grammar' },
  { key: 'continue', label: 'Continue writing', icon: '→', description: 'Continue from where you left off' },
];

export default function AIActionSheet({
  visible,
  selectedText,
  onClose,
  onApply,
}: AIActionSheetProps) {
  const { result, isLoading, error, execute, reset } = useAI();
  const [showResult, setShowResult] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleAction = async (action: AIAction) => {
    const newText = await execute(action, selectedText, action === 'custom' ? customPrompt : undefined);
    if (newText) {
      setShowResult(true);
    }
  };

  const handleApply = () => {
    if (result) {
      onApply(result);
      handleClose();
    }
  };

  const handleClose = () => {
    reset();
    setShowResult(false);
    setShowCustom(false);
    setCustomPrompt('');
    onClose();
  };

  const handleBack = () => {
    reset();
    setShowResult(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          {showResult ? (
            <TouchableOpacity onPress={handleBack}>
              <Text style={styles.headerButton}>← Back</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}
          <Text style={styles.headerTitle}>AI Assist</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.headerButton}>Done</Text>
          </TouchableOpacity>
        </View>

        {!showResult ? (
          <ScrollView style={styles.content}>
            {selectedText && (
              <View style={styles.selectedTextContainer}>
                <Text style={styles.selectedTextLabel}>Selected text:</Text>
                <Text style={styles.selectedText} numberOfLines={3}>
                  "{selectedText}"
                </Text>
              </View>
            )}

            <View style={styles.actionList}>
              {AI_ACTION_LIST.map((action) => (
                <TouchableOpacity
                  key={action.key}
                  style={styles.actionItem}
                  onPress={() => handleAction(action.key)}
                  disabled={isLoading}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                    <Text style={styles.actionDescription}>{action.description}</Text>
                  </View>
                  {isLoading && (
                    <ActivityIndicator size="small" color="#6366f1" />
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => setShowCustom(!showCustom)}
              >
                <Text style={styles.actionIcon}>🎯</Text>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionLabel}>Custom prompt</Text>
                  <Text style={styles.actionDescription}>Give specific instructions</Text>
                </View>
              </TouchableOpacity>

              {showCustom && (
                <View style={styles.customPromptContainer}>
                  <TextInput
                    style={styles.customPromptInput}
                    placeholder="Enter your instructions..."
                    placeholderTextColor="#71717a"
                    value={customPrompt}
                    onChangeText={setCustomPrompt}
                    multiline
                  />
                  <TouchableOpacity
                    style={[
                      styles.customPromptButton,
                      !customPrompt.trim() && styles.customPromptButtonDisabled,
                    ]}
                    onPress={() => handleAction('custom')}
                    disabled={!customPrompt.trim() || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.customPromptButtonText}>Apply</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>Result</Text>
            </View>
            <ScrollView style={styles.resultContent}>
              <Text style={styles.resultText}>{result}</Text>
            </ScrollView>
            <View style={styles.resultActions}>
              <TouchableOpacity
                style={styles.discardButton}
                onPress={handleBack}
              >
                <Text style={styles.discardButtonText}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
              >
                <Text style={styles.applyButtonText}>Apply Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fafafa',
  },
  headerButton: {
    fontSize: 17,
    color: '#6366f1',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  selectedTextContainer: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  selectedTextLabel: {
    fontSize: 12,
    color: '#71717a',
    marginBottom: 8,
  },
  selectedText: {
    fontSize: 14,
    color: '#a1a1aa',
    fontStyle: 'italic',
  },
  actionList: {
    gap: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  actionIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  actionInfo: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fafafa',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    color: '#71717a',
  },
  customPromptContainer: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  customPromptInput: {
    backgroundColor: '#27272a',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#fafafa',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  customPromptButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  customPromptButtonDisabled: {
    backgroundColor: '#27272a',
  },
  customPromptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  errorContainer: {
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#fecaca',
  },
  resultContainer: {
    flex: 1,
  },
  resultHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  resultContent: {
    flex: 1,
    padding: 16,
  },
  resultText: {
    fontSize: 16,
    color: '#fafafa',
    lineHeight: 24,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  discardButton: {
    flex: 1,
    backgroundColor: '#27272a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  discardButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fafafa',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
