import React from 'react';
import { CoachingDomain } from '@/lib/coachingPrompt';
import styles from './CoachingSelector.module.css';

type Props = {
    currentMode: CoachingDomain;
    onSelectMode: (mode: CoachingDomain) => void;
};

const MODES: { id: CoachingDomain; label: string; description: string }[] = [
    { id: 'self-awareness', label: '自己認識', description: '強みを見つける' },
    { id: 'info', label: '情報収集', description: '知りたいことを探す' },
    { id: 'goal', label: '目標選択', description: '目標を決める' },
    { id: 'plan', label: '計画作成', description: '行動計画を立てる' },
    { id: 'problem', label: '問題解決', description: '壁を乗り越える' },
];

const getIcon = (id: CoachingDomain) => {
    switch (id) {
        case 'self-awareness': return '🧘';
        case 'info': return '🔍';
        case 'goal': return '🎯';
        case 'plan': return '📅';
        case 'problem': return '🧩';
        default: return '✨';
    }
};

export const CoachingSelector: React.FC<Props> = ({ currentMode, onSelectMode }) => {
    return (
        <div className={styles.container}>
            {MODES.map((mode) => (
                <button
                    key={mode.id}
                    onClick={() => onSelectMode(mode.id)}
                    className={`${styles.cardButton} ${currentMode === mode.id ? styles.cardButtonActive : ''}`}
                >
                    <div className={styles.iconWrapper}>
                        <span className={styles.icon}>{getIcon(mode.id)}</span>
                        <span className={`${styles.label} ${currentMode === mode.id ? styles.labelActive : ''}`}>
                            {mode.label}
                        </span>
                    </div>
                    <div className={`${styles.description} ${currentMode === mode.id ? styles.descriptionActive : ''}`}>
                        {mode.description}
                    </div>
                </button>
            ))}
        </div>
    );
};
