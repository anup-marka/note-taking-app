import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAISearch } from '../hooks/use-ai';
import { useNotesStore } from '../stores/notes-store';

const SUGGESTED_QUESTIONS = [
  'What are my main project goals?',
  'Summarize my meeting notes',
  'What tasks do I need to complete?',
  'What ideas have I written about?',
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { answer, isLoading, error, search, reset } = useAISearch();
  const { notes } = useNotesStore();

  const handleSearch = async () => {
    if (!query.trim()) return;

    Keyboard.dismiss();

    // Get note contents for AI search
    const noteContents = notes
      .filter((n) => !n.isTrashed && !n.isArchived)
      .map((n) => ({
        id: n.id,
        title: n.title,
        content: n.plainText,
      }));

    await search(query, noteContents);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handleClear = () => {
    setQuery('');
    reset();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Search</Text>
        <Text style={styles.subtitle}>
          Ask questions about your notes
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="What would you like to know?"
            placeholderTextColor="#71717a"
            value={query}
            onChangeText={setQuery}
            multiline
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {query.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.searchButton,
            (!query.trim() || isLoading) && styles.searchButtonDisabled,
          ]}
          onPress={handleSearch}
          disabled={!query.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer} keyboardDismissMode="on-drag">
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {answer && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>Answer</Text>
              <Text style={styles.noteCount}>
                Based on {notes.filter((n) => !n.isTrashed && !n.isArchived).length} notes
              </Text>
            </View>
            <Text style={styles.resultText}>{answer}</Text>
          </View>
        )}

        {!answer && !isLoading && !error && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>🔍</Text>
            <Text style={styles.placeholderText}>
              Ask a question to search through your notes using AI
            </Text>

            <View style={styles.suggestions}>
              <Text style={styles.suggestionsTitle}>Try asking:</Text>
              {SUGGESTED_QUESTIONS.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  onPress={() => handleSuggestionPress(suggestion)}
                  style={styles.suggestionButton}
                >
                  <Text style={styles.suggestionText}>"{suggestion}"</Text>
                </TouchableOpacity>
              ))}
            </View>

            {notes.length === 0 && (
              <View style={styles.noNotesWarning}>
                <Text style={styles.warningText}>
                  No notes yet! Create some notes to start searching.
                </Text>
              </View>
            )}
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Searching your notes...</Text>
          </View>
        )}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#71717a',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    paddingRight: 44,
    fontSize: 16,
    color: '#fafafa',
    minHeight: 56,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 20,
    color: '#a1a1aa',
  },
  searchButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#27272a',
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  errorCard: {
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#fecaca',
  },
  resultCard: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  noteCount: {
    fontSize: 12,
    color: '#71717a',
  },
  resultText: {
    fontSize: 16,
    color: '#fafafa',
    lineHeight: 24,
  },
  placeholder: {
    alignItems: 'center',
    paddingTop: 40,
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#71717a',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  suggestions: {
    alignSelf: 'stretch',
    paddingHorizontal: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a1a1aa',
    marginBottom: 12,
  },
  suggestionButton: {
    paddingVertical: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: '#6366f1',
  },
  noNotesWarning: {
    marginTop: 32,
    backgroundColor: '#422006',
    borderRadius: 12,
    padding: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#fcd34d',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#71717a',
  },
});
