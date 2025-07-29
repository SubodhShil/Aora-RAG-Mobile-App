import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

const { width } = Dimensions.get('window');

const YouTubeSummarizerScreen = () => {
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [videoPreview, setVideoPreview] = useState(null);

    // Extract video ID from YouTube URL
    const extractVideoId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Get video preview data
    const getVideoPreview = async (videoId) => {
        try {
            // Using YouTube oEmbed API for video info
            const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            if (response.ok) {
                const data = await response.json();
                return {
                    title: data.title,
                    author: data.author_name,
                    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                    videoId: videoId
                };
            }
        } catch (error) {
            console.error('Error fetching video preview:', error);
        }
        return null;
    };

    // Update video preview when URL changes
    useEffect(() => {
        const updatePreview = async () => {
            if (youtubeUrl.trim()) {
                const videoId = extractVideoId(youtubeUrl);
                if (videoId) {
                    const preview = await getVideoPreview(videoId);
                    setVideoPreview(preview);
                } else {
                    setVideoPreview(null);
                }
            } else {
                setVideoPreview(null);
            }
        };

        const debounceTimer = setTimeout(updatePreview, 500);
        return () => clearTimeout(debounceTimer);
    }, [youtubeUrl]);

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
            
            // Try to parse as JSON first, if it fails, use as plain text
            let summaryText = data;
            try {
                const jsonData = JSON.parse(data);
                summaryText = jsonData.summary || jsonData.text || jsonData.content || data;
            } catch (parseError) {
                // If JSON parsing fails, use the raw text
                summaryText = data;
            }
            
            setSummary(summaryText);
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
        setVideoPreview(null);
    };

    const handleCopySummary = async () => {   
        if (summary) {
            try {
                // Try to use Share API as an alternative to clipboard
                await Share.share({
                    message: summary,
                    title: 'YouTube Video Summary'
                });
            } catch (error) {
                console.error('Error sharing summary:', error);
                // Fallback: Show summary in alert for manual copy
                Alert.alert(
                    'Video Summary', 
                    summary.length > 500 ? summary.substring(0, 500) + '...\n\n(Tap and hold to select all text)' : summary,
                    [
                        { text: 'Close', style: 'default' }
                    ]
                );
            }
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                
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
                        multiline={false}
                    />
                </View>

                {/* Video Preview Section */}
                {videoPreview && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Video Preview</Text>
                        <View style={styles.videoPreviewContainer}>
                            <Image 
                                source={{ uri: videoPreview.thumbnail }}
                                style={styles.thumbnail}
                                resizeMode="cover"
                            />
                            <View style={styles.playIconOverlay}>
                                <Ionicons name="play-circle" size={60} color="rgba(255, 255, 255, 0.9)" />
                            </View>
                            <View style={styles.videoInfo}>
                                <Text style={styles.videoTitle} numberOfLines={2}>
                                    {videoPreview.title}
                                </Text>
                                <Text style={styles.videoAuthor}>
                                    by {videoPreview.author}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

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
                        style={[
                            styles.actionButton, 
                            styles.summarizeButton,
                            isLoading && styles.disabledButton
                        ]} 
                        onPress={handleSummarize}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Ionicons name="sparkles" size={20} color="white" />
                        )}
                        <Text style={styles.actionButtonText}>
                            {isLoading ? 'Summarizing...' : 'Summarize'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Output Section */}
                {(isLoading || summary) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Video Summary</Text>
                        
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#4a90e2" />
                                <Text style={styles.loadingText}>Analyzing video content...</Text>
                                <Text style={styles.subLoadingText}>This may take a few moments</Text>
                            </View>
                        ) : (
                            <View style={styles.outputContainer}>
                                <ScrollView 
                                    style={styles.markdownScrollView}
                                    nestedScrollEnabled={true}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <Markdown style={markdownStyles}>
                                        {summary}
                                    </Markdown>
                                </ScrollView>
                                
                                <TouchableOpacity 
                                    style={styles.copyButton} 
                                    onPress={handleCopySummary}
                                >
                                    <Ionicons name="share-outline" size={18} color="white" />
                                    <Text style={styles.copyButtonText}>Share Summary</Text>
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
        backgroundColor: '#f8f9fa',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#1a1a1a',
    },
    textInput: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        minHeight: 54,
        borderWidth: 1,
        borderColor: '#e1e5e9',
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    videoPreviewContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    thumbnail: {
        width: '100%',
        height: (width - 32) * 9 / 16, // 16:9 aspect ratio
        backgroundColor: '#f0f0f0',
    },
    playIconOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    videoInfo: {
        padding: 16,
    },
    videoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
        lineHeight: 22,
    },
    videoAuthor: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    clearButton: {
        backgroundColor: '#ef4444',
    },
    summarizeButton: {
        backgroundColor: '#3b82f6',
    },
    disabledButton: {
        backgroundColor: '#9ca3af',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 16,
    },
    loadingContainer: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    loadingText: {
        marginTop: 16,
        color: '#374151',
        fontSize: 18,
        fontWeight: '500',
    },
    subLoadingText: {
        marginTop: 4,
        color: '#6b7280',
        fontSize: 14,
    },
    outputContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    markdownScrollView: {
        maxHeight: 400,
        padding: 16,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3b82f6',
        padding: 12,
        margin: 16,
        marginTop: 0,
        borderRadius: 8,
    },
    copyButtonText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 6,
        fontSize: 14,
    },
});

const markdownStyles = {
    body: {
        fontSize: 16,
        lineHeight: 24,
        color: '#374151',
        fontFamily: 'System',
    },
    heading1: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 16,
        marginTop: 24,
    },
    heading2: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 12,
        marginTop: 20,
    },
    heading3: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 10,
        marginTop: 16,
    },
    heading4: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginTop: 12,
    },
    paragraph: {
        marginBottom: 16,
        lineHeight: 24,
    },
    strong: {
        fontWeight: '700',
        color: '#1a1a1a',
    },
    em: {
        fontStyle: 'italic',
        color: '#4b5563',
    },
    link: {
        color: '#3b82f6',
        textDecorationLine: 'underline',
    },
    bullet_list: {
        marginBottom: 16,
    },
    ordered_list: {
        marginBottom: 16,
    },
    list_item: {
        marginBottom: 8,
        paddingLeft: 4,
    },
    bullet_list_icon: {
        color: '#3b82f6',
        marginRight: 8,
    },
    code_inline: {
        backgroundColor: '#f3f4f6',
        color: '#dc2626',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 14,
        fontFamily: 'Courier',
    },
    code_block: {
        backgroundColor: '#1f2937',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    fence: {
        backgroundColor: '#1f2937',
        color: '#f9fafb',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        fontFamily: 'Courier',
        fontSize: 14,
    },
    blockquote: {
        backgroundColor: '#f8fafc',
        borderLeftWidth: 4,
        borderLeftColor: '#3b82f6',
        paddingLeft: 16,
        paddingVertical: 12,
        marginBottom: 16,
        borderRadius: 4,
    },
    table: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        marginBottom: 16,
    },
    thead: {
        backgroundColor: '#f9fafb',
    },
    tbody: {
        backgroundColor: 'white',
    },
    th: {
        padding: 12,
        fontWeight: '600',
        color: '#374151',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    td: {
        padding: 12,
        color: '#6b7280',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    hr: {
        backgroundColor: '#e5e7eb',
        height: 1,
        marginVertical: 24,
    },
};

export default YouTubeSummarizerScreen;