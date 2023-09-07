// https://kit.svelte.dev/docs/hooks#shared-hooks
// https://vercel.com/docs/frameworks/sveltekit#edge-middleware
export async function handleError({error}) {
  console.error('API Error:', error);
  const message = (error as Error)?.message || 'error';
  // Sends response back to Deep Chat using the Result format:
  // https://deepchat.dev/docs/connect/#Result
  return {result: {error: message}} as unknown as Error;
}
