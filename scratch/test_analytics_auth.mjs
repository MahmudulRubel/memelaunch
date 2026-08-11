import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://fw47aqh3.ap-southeast.insforge.app';
const apiKey = process.env.INSFORGE_SERVER_KEY || 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: apiKey
});

async function verifyAuthLogic() {
  const userId = 'f7eea2d5-5153-4604-bc36-7bed011078e1';

  const superAdminIds = [
    '2ab40b92-175e-4815-8e5f-0d6b58c5c94d',
    '5f844f38-e651-4b83-a6b7-924afd4d95b7',
    'f7eea2d5-5153-4604-bc36-7bed011078e1',
  ];

  const isSuperId = superAdminIds.includes(userId);
  console.log('isSuperId:', isSuperId);

  const { data: user, error } = await insforgeAdmin.database
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .maybeSingle();

  console.log('DB User record:', user, 'Error:', error);
  console.log('isAdminFlag:', user?.is_admin === true);
}

verifyAuthLogic();
