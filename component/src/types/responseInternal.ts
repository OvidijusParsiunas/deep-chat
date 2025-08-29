import {Response} from './response';

export type ResponseI = Response & {sendUpdate?: boolean; ignoreText?: boolean};
