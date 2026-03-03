export interface ContactRequestBody {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  status: 'sent' | 'error';
  message?: string;
  error?: string;
  timestamp: string;
}
