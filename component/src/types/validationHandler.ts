import {UserContentI} from './messagesInternal';

export type ValidationHandler = (programmatic?: UserContentI) => Promise<boolean | null>;
