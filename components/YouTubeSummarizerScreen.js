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

const YouTubeSummarizerScreen = () => {
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSummarize = async () => {
        if (!youtubeUrl.trim()) {
            Alert.alert('Error', 'Please enter a YouTube URL');
            return;
        }

        // Basic YouTube URL validation
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        if (!youtubeRegex.test(youtubeUrl)) {
            Alert.alert('Error', 'Please enter a valid YouTube URL');
            return;
        }

        setIsLoading(true);
        setSummary('');

        try {
            const response = await fetch('http://127.0.0.1:8000/api/yt-video/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: youtubeUrl.trim()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.text();
            setSummary(data);
        } catch (error) {
            console.error('Error summarizing YouTube video:', error);
            Alert.alert(
                'Error', 
                'Failed to summarize the YouTube video. Please check your internet connection and try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setYoutubeUrl('');
        setSummary('');
    };

    const handleCopySummary = () => {   
        if (summary) {
            // In a real app, you would use Clipboard API here
            Alert.alert('Success', 'Summary copied to clipboard!');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                
                {/* Input Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>YouTube URL</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Paste YouTube URL here..."
                        value={youtubeUrl}
                        onChangeText={setYoutubeUrl}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="url"
                    />
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.clearButton]} 
                        onPress={handleClear}
                    >
                        <Ionicons name="trash-outline" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Clear</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.summarizeButton]} 
                        onPress={handleSummarize}
                        disabled={isLoading}
                    >
                        <Ionicons name="play" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Summarize</Text>
                    </TouchableOpacity>
                </View>

                {/* Output Section */}
                {(isLoading || summary) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Video Summary</Text>
                        
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#4a90e2" />
                                <Text style={styles.loadingText}>Summarizing video...</Text>
                            </View>
                        ) : (
                            <View style={styles.outputContainer}>
                                <Text style={styles.outputText}>{summary}</Text>
                                
                                <TouchableOpacity 
                                    style={styles.copyButton} 
                                    onPress={handleCopySummary}
                                >
                                    <Ionicons name="copy-outline" size={20} color="white" />
                                    <Text style={styles.copyButtonText}>Copy</Text>
                                </TouchableOpacity>
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
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    textInput: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        minHeight: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        flex: 1,
    },
    clearButton: {
        backgroundColor: '#ff6b6b',
        marginRight: 8,
    },
    summarizeButton: {
        backgroundColor: '#4a90e2',
        marginLeft: 8,
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
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
        lineHeight: 24,
        color: '#333',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4a90e2',
        padding: 8,
        borderRadius: 8,
        marginTop: 12,
        alignSelf: 'flex-end',
    },
    copyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 4,
    },
});

export default YouTubeSummarizerScreen;