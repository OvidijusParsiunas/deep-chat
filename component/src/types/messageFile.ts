export type MessageFileType = 'image' | 'audio' | 'any';

export type MessageFile = {src?: string; name?: string; type?: MessageFileType; ref?: File};

export type MessageFiles = MessageFile[];
