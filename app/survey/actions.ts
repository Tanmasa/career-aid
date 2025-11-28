'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { summarizeSurvey } from '@/lib/prompt';

import { getOrCreateSessionId } from '@/lib/session';
import { createServerSupabaseClient } from '@/lib/supabase';

const FUTURE_PLANNING_LABELS: Record<string, string> = {
  acting: '実際に考えていてもう対策している',
  collecting: '考えてはいるが、少しづつ情報を集めている',
  uncertain: 'ぼんやり考えているが、何をすれば分からない',
  not_thinking: '全く考えていない'
};

export type SurveyFormState = {
  error?: string;
  success?: boolean;
};

export const submitSurvey = async (
  _prevState: SurveyFormState,
  formData: FormData
): Promise<SurveyFormState> => {
  const consentChecked = formData.get('consent') === 'on';

  if (!consentChecked) {
    return { error: '送信には同意へのチェックが必要です。' };
  }

  const gradeRaw = formData.get('grade');
  const grade = gradeRaw ? Number(gradeRaw) : null;
  const strengths = (formData.get('strengths') || '').toString().trim() || null;
  const interests = (formData.get('interests') || '').toString().trim() || null;
  const favoriteSubjects = (formData.get('favoriteSubjects') || '').toString().trim() || null;
  const concerns = (formData.get('concerns') || '').toString().trim() || null;
  const futurePlanningKey = (formData.get('futurePlanning') || '').toString();
  const futurePlanning = futurePlanningKey ? FUTURE_PLANNING_LABELS[futurePlanningKey] ?? null : null;
  const freeText = (formData.get('freeText') || '').toString().trim() || null;
  const userName = (formData.get('userName') || '').toString().trim();

  if (userName) {
    cookies().set('user_name', userName, { path: '/', maxAge: 60 * 60 * 24 * 30 });
  }

  const supabase = createServerSupabaseClient();
  const sessionId = getOrCreateSessionId();

  const summary = summarizeSurvey({
    grade,
    strengths,
    interests,
    favoriteSubjects,
    concerns,
    futurePlanning,
    freeText
  });

  try {
    const { error: sessionError } = await supabase
      .from('sessions')
      .upsert({
        id: sessionId,
        consent: true,
        grade,
        survey_summary: summary
      })
      .select('id')
      .single();

    if (sessionError) {
      return { error: 'セッション情報の保存に失敗しました。' };
    }

    const { error: surveyError } = await supabase.from('surveys').insert({
      session_id: sessionId,
      strengths,
      interests,
      favorite_subjects: favoriteSubjects,
      concerns,
      future_planning: futurePlanning,
      free_text: freeText,
      user_name: userName
    });

    if (surveyError) {
      return { error: 'アンケート回答の保存に失敗しました。' };
    }

  } catch (err) {
    console.error('Unexpected error:', err);
    return { error: '予期せぬエラーが発生しました。' };
  }

  return { success: true };
};
