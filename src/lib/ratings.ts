import { supabase } from './supabaseClient';

export async function fetchUserRatings(userId: string) {
  const { data, error } = await supabase
    .from('ratings')
    .select('*, movies(*)') // 映画情報もJOIN
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
