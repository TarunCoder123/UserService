import { Request } from 'express';

export interface ExpressRequest extends Request {
    user?: {
        wallet_address?: string;
        access_uuid?: string;
        refresh_uuid?: string;
    };
    session?: {
        mfaVerified: boolean;
    };
}
