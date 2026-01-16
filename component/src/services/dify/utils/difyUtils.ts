import {DifyFileInput} from '../../../types/dify';

export async function uploadFileToDify(
  uploadUrl: string,
  file: File,
  user: string,
  headers: Record<string, string>
): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user', user);

  try {
    const requestHeaders = {...headers};
    delete requestHeaders['Content-Type'];

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Dify] File upload failed (${response.status}):`, errorText);
      return null;
    }

    const data = await response.json();
    return data.id;
  } catch (e) {
    console.error('[Dify] File upload network error:', e);
    return null;
  }
}

export async function uploadFilesToDify(
  uploadUrl: string,
  files: File[],
  user: string,
  headers: Record<string, string>
): Promise<DifyFileInput[]> {
  const uploadPromises = files.map(async (file) => {
    const fileId = await uploadFileToDify(uploadUrl, file, user, headers);
    if (!fileId) return null;

    const type = file.type.startsWith('image/') ? 'image' : 'file';

    return {
      type: type,
      transfer_method: 'local_file',
      upload_file_id: fileId,
    } as DifyFileInput;
  });

  const results = await Promise.all(uploadPromises);

  return results.filter((item): item is DifyFileInput => item !== null);
}
