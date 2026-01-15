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
      console.error('[Dify] File upload failed:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.id;
  } catch (e) {
    console.error('[Dify] File upload error:', e);
    return null;
  }
}

export async function uploadFilesToDify(
  uploadUrl: string,
  files: File[],
  user: string,
  headers: Record<string, string>
): Promise<DifyFileInput[]> {
  const difyFiles: DifyFileInput[] = [];

  for (const file of files) {
    const fileId = await uploadFileToDify(uploadUrl, file, user, headers);
    if (fileId) {
      difyFiles.push({
        type: 'image',
        transfer_method: 'local_file',
        upload_file_id: fileId,
      });
    }
  }

  return difyFiles;
}
