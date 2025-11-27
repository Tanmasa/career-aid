import { evaluateGoal } from '../lib/goalEvaluator';

describe('Goal Evaluator', () => {
    test('Self-Awareness: Success', () => {
        const result = evaluateGoal('self-awareness', '文化祭でリーダーをして、みんなをまとめる協調性が身についた');
        expect(result.isGoalMet).toBe(true);
    });

    test('Self-Awareness: Failure (No Action)', () => {
        const result = evaluateGoal('self-awareness', '私は協調性があります');
        expect(result.isGoalMet).toBe(false);
        expect(result.missingElements).toContain('具体的な行動');
    });

    test('Info: Success', () => {
        const result = evaluateGoal('info', '学費と偏差値と場所について、YouTubeで調べたい');
        expect(result.isGoalMet).toBe(true);
    });

    test('Info: Failure (No Method)', () => {
        const result = evaluateGoal('info', '学費が知りたい');
        expect(result.isGoalMet).toBe(false);
        expect(result.missingElements).toContain('調べ方');
    });

    test('Goal: Success', () => {
        const result = evaluateGoal('goal', '今月中に志望校を決める');
        expect(result.isGoalMet).toBe(true);
    });

    test('Plan: Success', () => {
        const result = evaluateGoal('plan', '土曜日にオープンキャンパスに行く');
        expect(result.isGoalMet).toBe(true);
    });

    test('Problem: Success', () => {
        const result = evaluateGoal('problem', '時間がないから、朝起きるか、隙間時間を使う');
        expect(result.isGoalMet).toBe(true);
    });
});
