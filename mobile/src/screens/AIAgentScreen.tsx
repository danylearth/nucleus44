import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../lib/theme';
import { useAuth } from '../lib/AuthContext';
import { supabase, callFunction, API_BASE } from '../lib/supabase';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

function TypingIndicator() {
    return (
        <View style={styles.typingContainer}>
            <View style={styles.messageAvatar}>
                <Text style={styles.avatarEmoji}>🧬</Text>
            </View>
            <View style={styles.typingBubble}>
                <Text style={styles.typingDots}>● ● ●</Text>
            </View>
        </View>
    );
}

function ChatBubble({ message }: { message: Message }) {
    const isUser = message.role === 'user';
    return (
        <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
            {!isUser && (
                <View style={styles.messageAvatar}>
                    <Text style={styles.avatarEmoji}>🧬</Text>
                </View>
            )}
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                    {message.content}
                </Text>
            </View>
        </View>
    );
}

interface QuickPromptProps {
    icon: string;
    text: string;
    onPress: () => void;
}

function QuickPrompt({ icon, text, onPress }: QuickPromptProps) {
    return (
        <TouchableOpacity style={styles.quickPrompt} onPress={onPress} activeOpacity={0.7}>
            <Text style={styles.quickPromptIcon}>{icon}</Text>
            <Text style={styles.quickPromptText}>{text}</Text>
            <Text style={styles.quickPromptArrow}>›</Text>
        </TouchableOpacity>
    );
}

export default function AIAgentScreen() {
    const { user, profile } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();

    const firstName = profile?.full_name?.split(' ')[0] || 'there';

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (messageText: string) => {
        if (messageText.trim() === '' || isLoading) return;

        Keyboard.dismiss();
        const newUserMessage: Message = { role: 'user', content: messageText };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(`${API_BASE}/api/llm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Request failed');
            }

            const data = await response.json();
            const assistantMessage: Message = {
                role: 'assistant',
                content: data.response,
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error: any) {
            console.error('AI error:', error);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: `Sorry, I'm having trouble connecting right now. ${error.message || 'Please try again.'}`,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickPrompt = (text: string) => {
        setInput(text);
        sendMessage(text);
    };

    // Welcome screen when no messages
    if (messages.length === 0) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <ScrollView
                    style={styles.welcomeScroll}
                    contentContainerStyle={styles.welcomeContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Hero */}
                    <View style={styles.heroSection}>
                        <View style={styles.aiLogo}>
                            <Text style={styles.aiLogoEmoji}>🧬</Text>
                        </View>
                        <Text style={styles.heroGreeting}>Hey, {firstName}!</Text>
                        <Text style={styles.heroSubtitle}>
                            I'm your Nucleus AI health assistant. Ask me anything about your health data, nutrition, sleep, or fitness.
                        </Text>
                    </View>

                    {/* Quick Prompts */}
                    <View style={styles.promptsSection}>
                        <Text style={styles.promptsLabel}>Try asking me...</Text>
                        <QuickPrompt
                            icon="🩸"
                            text="Explain my recent blood results"
                            onPress={() => handleQuickPrompt('Explain my recent blood results and what I should focus on improving.')}
                        />
                        <QuickPrompt
                            icon="😴"
                            text="How can I improve my sleep?"
                            onPress={() => handleQuickPrompt('Based on my health data, how can I improve my sleep quality?')}
                        />
                        <QuickPrompt
                            icon="🥗"
                            text="Suggest a meal plan for today"
                            onPress={() => handleQuickPrompt('Suggest a healthy meal plan for today based on my health goals.')}
                        />
                        <QuickPrompt
                            icon="💊"
                            text="Review my supplement stack"
                            onPress={() => handleQuickPrompt('Review my current supplements and suggest any changes.')}
                        />
                        <QuickPrompt
                            icon="🏃"
                            text="Create a workout plan"
                            onPress={() => handleQuickPrompt('Create a workout plan for this week based on my activity levels.')}
                        />
                    </View>
                </ScrollView>

                {/* Input Bar */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={0}
                >
                    <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
                        <TextInput
                            style={styles.textInput}
                            value={input}
                            onChangeText={setInput}
                            placeholder="Ask me anything about your health..."
                            placeholderTextColor={colors.textTertiary}
                            multiline
                            maxLength={2000}
                            returnKeyType="send"
                            onSubmitEditing={() => sendMessage(input)}
                            blurOnSubmit
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
                            onPress={() => sendMessage(input)}
                            disabled={!input.trim() || isLoading}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.sendIcon}>↑</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        );
    }

    // Chat interface with messages
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.chatHeader}>
                <TouchableOpacity onPress={() => setMessages([])} style={styles.backButton}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <View style={styles.chatHeaderCenter}>
                    <Text style={styles.chatHeaderTitle}>Nucleus AI</Text>
                    <Text style={styles.chatHeaderSubtitle}>Health Assistant</Text>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            {/* Messages */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={scrollToBottom}
            >
                {messages.map((msg, index) => (
                    <ChatBubble key={index} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
            </ScrollView>

            {/* Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
                    <TextInput
                        style={styles.textInput}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Ask a follow-up..."
                        placeholderTextColor={colors.textTertiary}
                        multiline
                        maxLength={2000}
                        returnKeyType="send"
                        onSubmitEditing={() => sendMessage(input)}
                        blurOnSubmit
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
                        onPress={() => sendMessage(input)}
                        disabled={!input.trim() || isLoading}
                        activeOpacity={0.7}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={colors.textInverse} />
                        ) : (
                            <Text style={styles.sendIcon}>↑</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // Welcome Screen
    welcomeScroll: { flex: 1 },
    welcomeContent: { paddingBottom: spacing.xl },
    heroSection: {
        alignItems: 'center',
        paddingTop: spacing['3xl'],
        paddingHorizontal: spacing['2xl'],
        paddingBottom: spacing.xl,
    },
    aiLogo: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: colors.primaryBg,
        borderWidth: 2,
        borderColor: colors.primary + '30',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    aiLogoEmoji: { fontSize: 32 },
    heroGreeting: {
        fontSize: fontSizes['3xl'],
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    heroSubtitle: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },

    // Quick Prompts
    promptsSection: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
    },
    promptsLabel: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    quickPrompt: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    quickPromptIcon: { fontSize: 20, marginRight: spacing.md },
    quickPromptText: {
        flex: 1,
        fontSize: fontSizes.md,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    quickPromptArrow: {
        fontSize: fontSizes.xl,
        color: colors.textTertiary,
    },

    // Chat Header
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        fontSize: 24,
        fontWeight: '600',
        color: colors.textPrimary,
        marginTop: -2,
    },
    chatHeaderCenter: {
        flex: 1,
        alignItems: 'center',
    },
    chatHeaderTitle: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    chatHeaderSubtitle: {
        fontSize: fontSizes.xs,
        color: colors.textTertiary,
    },
    headerSpacer: { width: 36 },

    // Messages
    messagesContainer: { flex: 1 },
    messagesContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        alignItems: 'flex-end',
    },
    messageRowUser: {
        justifyContent: 'flex-end',
    },
    messageAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    avatarEmoji: { fontSize: 16 },
    messageBubble: {
        maxWidth: '75%',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
    },
    userBubble: {
        backgroundColor: colors.darkest,
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        backgroundColor: colors.surface,
        borderBottomLeftRadius: 4,
        ...shadows.sm,
    },
    messageText: {
        fontSize: fontSizes.md,
        lineHeight: 22,
        color: colors.textPrimary,
    },
    userMessageText: {
        color: colors.textInverse,
    },

    // Typing
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: spacing.md,
    },
    typingBubble: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderBottomLeftRadius: 4,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        ...shadows.sm,
    },
    typingDots: {
        fontSize: fontSizes.sm,
        color: colors.textTertiary,
        letterSpacing: 2,
    },

    // Input Bar
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        gap: spacing.sm,
    },
    textInput: {
        flex: 1,
        backgroundColor: colors.surfaceSecondary,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.lg,
        paddingTop: Platform.OS === 'ios' ? spacing.md : spacing.sm,
        paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.sm,
        fontSize: fontSizes.md,
        color: colors.textPrimary,
        maxHeight: 120,
        minHeight: 44,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.darkest,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: colors.border,
    },
    sendIcon: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textInverse,
    },
});
