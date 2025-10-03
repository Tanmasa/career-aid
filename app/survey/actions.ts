'use server';

import { redirect } from 'next/navigation';

import { summarizeSurvey } from '@/lib/prompt';
import { getOrCreateSessionId } from '@/lib/session';
import { createServerSupabaseClient } from '@/lib/supabase';

export type SurveyFormState = {
  error?: string;
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
  const freeText = (formData.get('freeText') || '').toString().trim() || null;

  const supabase = createServerSupabaseClient();
  const sessionId = getOrCreateSessionId();

  const summary = summarizeSurvey({
    grade,
    strengths,
    interests,
    favoriteSubjects,
    concerns,
    freeText
  });

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
    free_text: freeText
  });

  if (surveyError) {
    return { error: 'アンケート回答の保存に失敗しました。' };
  }

  redirect('/chat');
};
