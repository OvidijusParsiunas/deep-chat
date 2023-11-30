import type {StabilityAITextToImageResult} from 'deep-chat/dist/types/stabilityAIResult';
import type {RequestHandler} from '@sveltejs/kit';
import type {MessageContent} from 'deep-chat/dist/types/messages';

export const config = {
  runtime: 'edge',
};

// Make sure to set the STABILITY_API_KEY environment variable

// You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
export const POST: RequestHandler = async ({request}) => {
  // Files are stored inside a form using Deep Chat request FormData format:
  // https://deepchat.dev/docs/connect
  const reqFormData = await request.formData();
  const file = reqFormData.get('files') as Blob;
  const imageToImageFormData = new FormData();
  imageToImageFormData.append('init_image', file);
  // When sending text along with files, it is stored inside the request body using the Deep Chat JSON format:
  // https://deepchat.dev/docs/connect
  const text = (JSON.parse(reqFormData.get('message1') as string) as MessageContent).text as string;
  imageToImageFormData.append('text_prompts[0][text]', text);
  imageToImageFormData.append('text_prompts[0][weight]', '1');

  const result = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-v1-6/image-to-image', {
    // Be careful not to overwrite Content-Type headers as the Boundary header will not be automatically set
    headers: {Authorization: `Bearer ${process.env.STABILITY_API_KEY}`},
    method: 'POST',
    body: imageToImageFormData as unknown as string, // This gets rid of the type error for fetch
  });

  const stabilityAIResult = (await result.json()) as StabilityAITextToImageResult;
  if (stabilityAIResult.message) throw stabilityAIResult.message;
  // Sends response back to Deep Chat using the Response format:
  // https://deepchat.dev/docs/connect/#Response
  return new Response(
    JSON.stringify({
      files: [{type: 'image', src: `data:image/png;base64,${stabilityAIResult.artifacts[0].base64}`}],
    }),
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  );
};
