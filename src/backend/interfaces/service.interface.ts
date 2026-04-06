export interface DatabaseConnectionResult {
  status: 'connected' | 'disconnected';
  database?: string;
  timestamp?: string;
  error?: string;
}

export interface CacheResult {
  status: 'connected' | 'disconnected';
  visits?: number;
  timestamp: string;
  error?: string;
}

export interface MailResult {
  status: 'sent' | 'error';
  messageId?: string;
  timestamp: string;
  error?: string;
}
