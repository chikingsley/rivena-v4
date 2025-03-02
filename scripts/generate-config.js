/**
 * This script reads environment variables from .env and generates a config.ts file
 * with those values for use in the browser environment.
 */

// Read from .env file and use Bun's API
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { parse } from "dotenv";

// Load environment variables from .env file
const envPath = join(process.cwd(), '.env');
const envContent = readFileSync(envPath, 'utf8');
const envVars = parse(envContent);

// Merge with process.env to get everything
const allEnvVars = { ...process.env, ...envVars };

// Get relevant environment variables
// Only include client-safe variables with VITE_ prefix
const clientEnvVars = Object.fromEntries(
  Object.entries(allEnvVars)
    .filter(([key]) => key.startsWith('VITE_'))
    .map(([key, value]) => [key.replace('VITE_', ''), value])
);

// Add hardcoded fallbacks for critical values if missing
if (!clientEnvVars.CLERK_PUBLISHABLE_KEY) {
  clientEnvVars.CLERK_PUBLISHABLE_KEY = "pk_test_d29ya2luZy1iYXJuYWNsZS0xMS5jbGVyay5hY2NvdW50cy5kZXYk";
  console.log('⚠️ Warning: Using hardcoded fallback for CLERK_PUBLISHABLE_KEY');
}

// Create config file content
const configFileContent = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 * 
 * This file is generated from your .env file and contains
 * environment variables that are safe to use in the browser.
 */

export const config = ${JSON.stringify(clientEnvVars, null, 2)};
`;

// Ensure the src directory exists
const configDir = join(process.cwd(), 'src');
if (!existsSync(configDir)) {
  mkdirSync(configDir, { recursive: true });
}

// Write the config file
const configFilePath = join(configDir, 'config.ts');
writeFileSync(configFilePath, configFileContent);

console.log(`✅ Generated config file at ${configFilePath}`); 