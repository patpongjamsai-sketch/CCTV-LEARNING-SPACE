import { redirect } from 'next/navigation';

export default function LessonPageRedirect() {
  redirect('/assessments');
}
