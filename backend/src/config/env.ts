import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  mysql: {
    host: required('MYSQL_HOST', 'localhost'),
    port: Number(process.env.MYSQL_PORT ?? 3306),
    database: required('MYSQL_DATABASE', 'emergency_db'),
    user: required('MYSQL_USERNAME'),
    password: required('MYSQL_PASSWORD'),
    emergenciesTable: required('MYSQL_EMERGENCIES_TABLE', 'emergencies'),
  },
  port: Number(process.env.PORT ?? 3000),
};
