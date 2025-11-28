import { cookies } from 'next/headers';
import { ChatUI } from './components/ChatUI';

export default function ChatPage() {
  const cookieStore = cookies();
  const userName = cookieStore.get('user_name')?.value || '';
  return <ChatUI initialUserName={userName} />;
}
