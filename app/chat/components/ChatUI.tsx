'use client';

import React, { useState } from 'react';
import { CoachingDomain } from '@/lib/coachingPrompt';
import { CoachingSelector } from './CoachingSelector';
import styles from './ChatUI.module.css';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

type Evaluation = {
    isGoalMet: boolean;
    missingElements: string[];
};

export const ChatUI = () => {
    const [mode, setMode] = useState<CoachingDomain>('self-awareness');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'こんにちは！進路について一緒に考えましょう。まずは取り組みたいテーマを選んでください。' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastEvaluation, setLastEvaluation] = useState<Evaluation | null>(null);
    const [turnCount, setTurnCount] = useState(0);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsLoading(true);

        // Increment turn count
        const currentTurnCount = turnCount + 1;
        setTurnCount(currentTurnCount);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, mode, messages, turnCount: currentTurnCount }), // Send turnCount
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'API Error');
            }

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            setLastEvaluation(data.evaluation);

        } catch (error: any) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: `エラー: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Define welcome messages for each mode - Coaching Style
    const getWelcomeMessage = (m: CoachingDomain) => {
        switch (m) {
            case 'self-awareness':
                return `【自己認識】のテーマですね！
まずはリラックスして考えてみましょう。
最近、学校生活や趣味の中で「これは楽しかったな」とか「自分、結構やるじゃん」と思えた瞬間はありましたか？些細なことでも大丈夫ですよ。`;
            case 'info':
                return `【情報収集】のテーマですね！
世の中には色々な仕事や学校がありますよね。
今、ふと気になっている「キーワード」や「分野」はありますか？「なんとなく」でも構いません。`;
            case 'goal':
                return `【目標選択】のテーマですね！
少し先の未来を想像してみましょう。
高校を卒業する時、あるいは次の学年に上がる時、「どうなっていたい」ですか？`;
            case 'plan':
                return `【計画作成】のテーマですね！
千里の道も一歩からです。
目標に近づくために、「今週」できそうな小さなアクションを一緒に考えてみませんか？`;
            case 'problem':
                return `【問題解決】のテーマですね！
不安や悩みは、言葉にすると軽くなることがあります。
今、進路について「ちょっと気が重いな」と感じていることや、壁に感じていることはありますか？`;
            default:
                return 'テーマを選んでください。';
        }
    };

    // Define mission requirements for each mode
    const getMissionRequirements = (m: CoachingDomain) => {
        switch (m) {
            case 'self-awareness': return ['強みを見つける', '具体的なエピソード'];
            case 'info': return ['知りたいこと(3つ)', '調べ方'];
            case 'goal': return ['期限', '具体的な目標'];
            case 'plan': return ['今週やること', '日時'];
            case 'problem': return ['不安・障害', '対策(2つ)'];
            default: return [];
        }
    };

    const missionItems = getMissionRequirements(mode);

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.headerTitle}>✨ AIキャリアコーチ</h1>
            </div>

            {/* Mode Selector */}
            <div className={styles.modeSelectorContainer}>
                <CoachingSelector currentMode={mode} onSelectMode={(m) => {
                    setMode(m);
                    setMessages(prev => [...prev, { role: 'assistant', content: getWelcomeMessage(m) }]);
                    setLastEvaluation(null);
                    setTurnCount(0); // Reset turn count
                }} />
            </div>

            {/* Mission Progress Card */}
            <div className={styles.missionCard}>
                <div className={styles.missionHeader}>
                    <span className="text-blue-500">🎯</span>
                    <span>Current Mission</span>
                </div>
                <div className={styles.missionList}>
                    {missionItems.map((item, idx) => {
                        const isMissing = lastEvaluation?.missingElements?.some(m => m.includes(item.split('(')[0])) ?? false;
                        const isDone = lastEvaluation && !isMissing;

                        return (
                            <div key={idx} className={`${styles.missionItem} ${isDone ? styles.missionItemDone : styles.missionItemPending}`}>
                                <span className="text-[10px]">{isDone ? '✨' : '○'}</span>
                                <span className="font-bold text-[10px]">{item}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className={styles.chatArea}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`${styles.messageRow} ${msg.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant}`}>
                        <div className={`${styles.messageBubble} ${msg.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start w-full">
                        <div className={styles.loadingBubble}>
                            入力中...
                        </div>
                    </div>
                )}

                {/* Feedback Area */}
                {lastEvaluation?.isGoalMet && (
                    <div className={styles.feedbackContainer}>
                        <div className={styles.feedbackBadge}>
                            <span>🎉</span>
                            <span>ミッションコンプリート！</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className={styles.inputArea}>
                <div className={styles.inputWrapper}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        className={styles.inputField}
                        placeholder="メッセージを入力..."
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading}
                        className={styles.sendButton}
                    >
                        送信
                    </button>
                </div>
            </div>
        </div>
    );
};
