declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    VERSION?: string;
    
    // PostgreSQL
    POSTGRES_HOST: string;
    POSTGRES_PORT: string;
    POSTGRES_DB: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    
    // Redis
    REDIS_HOST: string;
    REDIS_PORT: string;
    
    // MailHog
    MAILHOG_HOST: string;
    MAILHOG_PORT?: string;
    MAILHOG_SMTP_PORT: string;
  }
}
