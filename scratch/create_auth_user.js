const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://fw47aqh3.ap-southeast.insforge.app';
const serverKey = 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c';

const insforgeAdmin = createClient({
  baseUrl,
  anonKey: serverKey,
});

async function createAuthUser() {
  const email = `jordan.taylor.${Date.now()}@memelaunch.com`;
  const password = 'Password123!';

  const res = await insforgeAdmin.auth.signUp({ email, password });
  console.log('SignUp result:', JSON.stringify(res, null, 2));

  if (res.data?.user?.id) {
    const uid = res.data.user.id;
    console.log('Got UID:', uid);
  } else if (res.data?.requireEmailVerification) {
    console.log('Need user record lookup or auto-confirm.');
  }
}

createAuthUser();
