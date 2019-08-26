import { Entity } from './dynamo.repo';

export interface StreamConfig extends Entity {
    label: string;
    tags: string[];
    disable_real_time_ingestion?: boolean;
    expires_at?: number;
    expires_at_pretty?: string;
    removed_by?: string;
    removed_at_pretty?: string;
    created_by?: string;
    created_at_pretty?: string;
}