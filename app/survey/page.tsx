import type { CSSProperties } from 'react';

import { SurveyForm } from './SurveyForm';

const containerStyle: CSSProperties = {
  width: '100%',
  maxWidth: '600px',
  background: '#fff',
  padding: '2rem',
  borderRadius: '12px',
  boxShadow: '0 12px 32px rgba(31, 41, 55, 0.08)',
  display: 'grid',
  gap: '1.5rem'
};

export default function SurveyPage() {
  return (
    <section style={containerStyle}>
      <div>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem' }}>進路状態アンケート</h1>
        <p style={{ margin: 0, color: '#555' }}>
          回答内容は匿名のセッションIDに紐づき、AIチャットの初期コンテキストに利用されます。
        </p>
      </div>
      <SurveyForm />
    </section>
  );
}
