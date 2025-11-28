'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import type { SurveyFormState } from './actions';
import { submitSurvey } from './actions';

const initialState: SurveyFormState = {};

export const SurveyForm = () => {
  const [state, formAction] = useFormState(submitSurvey, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push('/chat');
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="survey-form">
      <label className="field">
        <span>お名前</span>
        <input name="userName" placeholder="例: 山田 太郎" required />
      </label>
      <label className="field">
        <span>学年</span>
        <select name="grade" defaultValue="" required>
          <option value="" disabled>
            選択してください
          </option>
          {Array.from({ length: 3 }).map((_, index) => {
            const grade = index + 1;
            return (
              <option key={grade} value={grade}>
                高校{grade}年
              </option>
            );
          })}
        </select>
      </label>

      <label className="field">
        <span>興味分野</span>
        <input name="interests" placeholder="例: 情報工学、デザイン" />
      </label>

      <label className="field">
        <span>得意科目</span>
        <input name="favoriteSubjects" placeholder="例: 数学、英語" />
      </label>

      <label className="field">
        <span>得意なこと</span>
        <input name="strengths" placeholder="例: 発表、企画、プログラミング" />
      </label>

      <label className="field">
        <span>不安に感じていること</span>
        <textarea name="concerns" rows={3} placeholder="例: 将来の進路が決まらない"></textarea>
      </label>

      <label className="field">
        <span>将来について考えたことがありますか？</span>
        <select name="futurePlanning" defaultValue="" required>
          <option value="" disabled>選択してください</option>
          <option value="acting">実際に考えていてもう対策している</option>
          <option value="collecting">考えてはいるが、少しづつ情報を集めている</option>
          <option value="uncertain">ぼんやり考えているが、何をすれば分からない</option>
          <option value="not_thinking">全く考えていない</option>
        </select>
      </label>

      <label className="field">
        <span>自由記述</span>
        <textarea name="freeText" rows={3} placeholder="補足したいことがあれば入力してください"></textarea>
      </label>

      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>匿名で内容を保存し、AIチャットの改善に利用することに同意します。</span>
      </label>

      {state.error && <p className="error">{state.error}</p>}

      <SubmitButton />
    </form>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? '送信中…' : '送信してチャットへ'}
    </button>
  );
};
