import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const ENV = {
  // Web application settings
  web: {
    baseUrl: process.env.BASE_URL || 'https://example.com',
    headless: process.env.HEADLESS !== 'false',
  },

  // API settings
  api: {
    baseUrl: process.env.API_BASE_URL || process.env.BASE_URL || 'https://api.example.com',
    apiKey: process.env.API_KEY || '',
  },

  // Test credentials
  credentials: {
    standardUser: process.env.TEST_USER_EMAIL || 'user@example.com',
    standardPassword: process.env.TEST_USER_PASSWORD || 'Secret123!',
    adminUser: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
    adminPassword: process.env.TEST_ADMIN_PASSWORD || 'AdminPass123!',
  },

  // CI mode
  isCI: process.env.CI === 'true',
};

export default ENV;
