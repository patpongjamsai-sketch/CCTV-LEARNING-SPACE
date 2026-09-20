import { redirect } from 'next/navigation';

export default async function Labs3DIndexPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = searchParams ? await searchParams : {};
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (typeof value === 'string') {
      params.set(key, value);
    }
  }
  const query = params.toString();
  redirect(`/labs/3d/room-101${query ? `?${query}` : ''}`);
}
