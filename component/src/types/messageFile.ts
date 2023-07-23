export type MessageFileType = 'image' | 'gif' | 'audio' | 'any';

export type MessageFile = {src?: string; name?: string; type?: MessageFileType};

export type MessageFiles = MessageFile[];
