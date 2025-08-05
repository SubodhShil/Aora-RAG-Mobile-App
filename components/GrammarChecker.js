import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GrammarChecker = () => {
    const [text, setText] = useState('');
    const [correctedText, setCorrectedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckGrammar = async () => {
        if (!text.trim()) return;

        setIsLoading(true);
        // Mock API call for grammar correction
        setTimeout(() => {
            // This is a mock correction. Replace with actual API call.
            const corrected = text.replace(/\b(calender|seperate|wierd)\b/gi, (match) => {
                const corrections = {
                    calender: 'calendar',
                    seperate: 'separate',
                    wierd: 'weird',
                };
                return corrections[match.toLowerCase()] || match;
            });
            setCorrectedText(corrected);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Grammar Checker</Text>
                <Text style={styles.description}>
                    Enter any text below to check for grammatical errors and get corrections.
                </Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        multiline
                        placeholder="Type or paste your text here..."
                        value={text}
                        onChangeText={setText}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    style={styles.checkButton}
                    onPress={handleCheckGrammar}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.checkButtonText}>Check Grammar</Text>
                    )}
                </TouchableOpacity>

                {correctedText ? (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.resultsTitle}>Corrected Text:</Text>
                        <Text style={styles.correctedText}>{correctedText}</Text>
                    </View>
                ) : null}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#343a40',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#6c757d',
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    textInput: {
        height: 200,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        borderColor: '#dee2e6',
        borderWidth: 1,
    },
    checkButton: {
        backgroundColor: '#007bff',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    checkButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultsContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        borderColor: '#dee2e6',
        borderWidth: 1,
    },
    resultsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#28a745',
        marginBottom: 10,
    },
    correctedText: {
        fontSize: 16,
        color: '#212529',
        lineHeight: 24,
    },
});

export default GrammarChecker;