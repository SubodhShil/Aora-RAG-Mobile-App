import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const YoutubeSummarizer = () => {
    const [youtubeLink, setYoutubeLink] = useState('');
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSummarize = async () => {
        if (!youtubeLink.trim()) {
            Alert.alert('Error', 'Please enter a YouTube link to summarize.');
            return;
        }

        setIsLoading(true);
        setSummary('');

        try {
            // Replace with your actual API endpoint
            const response = await fetch('http://127.0.0.1:5000/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    video_url: youtubeLink,
                }),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            setSummary(data.summary || 'No summary returned from the API.');
        } catch (error) {
            console.error('Error calling summarization API:', error);
            Alert.alert('Error', 'Failed to summarize the video. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearText = () => {
        setYoutubeLink('');
        setSummary('');
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Input Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>YouTube Link</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter YouTube link..."
                        value={youtubeLink}
                        onChangeText={setYoutubeLink}
                    />
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.clearButton]}
                        onPress={handleClearText}
                    >
                        <Ionicons name="trash-outline" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Clear</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.summarizeButton]}
                        onPress={handleSummarize}
                        disabled={isLoading}
                    >
                        <Ionicons name="refresh" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Summarize</Text>
                    </TouchableOpacity>
                </View>

                {/* Output Section */}
                {(isLoading || summary) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Summary</Text>

                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#4a90e2" />
                                <Text style={styles.loadingText}>Summarizing...</Text>
                            </View>
                        ) : (
                            <View style={styles.outputContainer}>
                                <Text style={styles.outputText}>{summary}</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    textInput: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        justifyContent: 'center',
    },
    clearButton: {
        backgroundColor: '#e74c3c',
        marginRight: 10,
    },
    summarizeButton: {
        backgroundColor: '#2ecc71',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 8,
    },
    loadingContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },
    outputContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    outputText: {
        fontSize: 16,
        color: '#333',
    },
});

export default YoutubeSummarizer;