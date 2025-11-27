import { CoachingDomain } from './coachingPrompt';

export type EvaluationResult = {
    isGoalMet: boolean;
    missingElements: string[];
    feedback?: string;
};

export const evaluateGoal = (domain: CoachingDomain, text: string): EvaluationResult => {
    switch (domain) {
        case 'self-awareness':
            return evaluateSelfAwareness(text);
        case 'info':
            return evaluateInfo(text);
        case 'goal':
            return evaluateGoalSelection(text);
        case 'plan':
            return evaluatePlan(text);
        case 'problem':
            return evaluateProblem(text);
        default:
            return { isGoalMet: false, missingElements: [] };
    }
};

const evaluateSelfAwareness = (text: string): EvaluationResult => {
    const actionKeywords = ["まとめた", "説明した", "提案した", "作成した", "調整した", "企画した", "頑張った", "取り組んだ", "リーダー", "係"];
    const strengthKeywords = ["協調性", "計画性", "主体性", "責任感", "コミュ力", "粘り強さ", "分析力", "優しさ", "真面目", "元気"];

    const hasAction = actionKeywords.some(k => text.includes(k));
    const hasStrength = strengthKeywords.some(k => text.includes(k));

    const missingElements = [];
    if (!hasAction) missingElements.push("具体的な行動");
    if (!hasStrength) missingElements.push("自分の強み");

    return {
        isGoalMet: hasAction && hasStrength,
        missingElements
    };
};

const evaluateInfo = (text: string): EvaluationResult => {
    const questionKeywords = ["知りたい", "わからない", "気になる", "教えて", "疑問"];
    const methodKeywords = ["YouTube", "OB訪問", "大学HP", "パンフ", "検索", "ネット", "先生", "先輩"];

    const hasMethod = methodKeywords.some(k => text.includes(k));
    const hasQuestion = questionKeywords.some(k => text.includes(k)) || text.includes("・") || text.includes("、");

    const missingElements = [];
    if (!hasQuestion) missingElements.push("知りたいこと(3つ程度)");
    if (!hasMethod) missingElements.push("調べ方");

    return {
        isGoalMet: hasMethod && hasQuestion,
        missingElements
    };
};

const evaluateGoalSelection = (text: string): EvaluationResult => {
    const deadlineKeywords = ["今月", "今年", "月まで", "日までに", "夏休み", "冬休み"];
    const contentKeywords = ["決める", "比較する", "選ぶ", "合格", "提出"];

    const hasDeadline = deadlineKeywords.some(k => text.includes(k));
    const hasContent = contentKeywords.some(k => text.includes(k));

    const missingElements = [];
    if (!hasDeadline) missingElements.push("期限");
    if (!hasContent) missingElements.push("目標の内容");

    return {
        isGoalMet: hasDeadline && hasContent,
        missingElements
    };
};

const evaluatePlan = (text: string): EvaluationResult => {
    const actionKeywords = ["見る", "調べる", "聞く", "比較する", "行く", "書く", "申し込む"];
    const dateKeywords = ["金曜", "土曜", "放課後", "日", "今日", "明日", "明後日", "時"];

    const hasAction = actionKeywords.some(k => text.includes(k));
    const hasDate = dateKeywords.some(k => text.includes(k));

    const missingElements = [];
    if (!hasDate) missingElements.push("具体的な日時");
    if (!hasAction) missingElements.push("行動");

    return {
        isGoalMet: hasAction && hasDate,
        missingElements
    };
};

const evaluateProblem = (text: string): EvaluationResult => {
    const problemKeywords = ["時間", "やる気", "情報", "お金", "成績", "親", "自信"];
    const hasProblem = problemKeywords.some(k => text.includes(k));
    const solutionCount = (text.match(/、|。|・|とか|たり/g) || []).length;

    const missingElements = [];
    if (!hasProblem) missingElements.push("障害・壁");
    if (solutionCount < 1) missingElements.push("対策(2つ以上)");

    return {
        isGoalMet: hasProblem && solutionCount >= 1,
        missingElements
    };
};
