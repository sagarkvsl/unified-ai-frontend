#!/usr/bin/env node

/**
 * Environment validation script
 * Validates environment configuration before build/deployment
 */

const fs = require('fs');
const path = require('path');

// Load environment management (Node.js version)
function loadEnvironmentConfig(env) {
  const envFile = path.join(__dirname, '..', `.env.${env}`);
  
  if (!fs.existsSync(envFile)) {
    console.error(`❌ Environment file .env.${env} not found`);
    return null;
  }

  // Parse .env file
  const envContent = fs.readFileSync(envFile, 'utf8');
  const config = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=', 2);
      if (key && value) {
        config[key.trim()] = value.trim();
      }
    }
  });

  return config;
}

function validateEnvironmentConfig(env, config) {
  const errors = [];
  const warnings = [];

  console.log(`\n🔍 Validating environment: ${env}`);
  console.log('================================');

  // Required fields validation
  const requiredFields = [
    'APP_ENV',
    'API_URL',
    'PUBLIC_URL',
    'NEXT_PUBLIC_APP_NAME'
  ];

  requiredFields.forEach(field => {
    if (!config[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // URL validation
  const urlFields = ['API_URL', 'PUBLIC_URL'];
  urlFields.forEach(field => {
    if (config[field]) {
      try {
        new URL(config[field]);
        console.log(`✅ ${field}: ${config[field]}`);
      } catch (e) {
        errors.push(`Invalid URL format for ${field}: ${config[field]}`);
      }
    }
  });

  // Environment-specific validations
  if (env === 'production') {
    // Production-specific validations
    if (config.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      errors.push('DEBUG_MODE should be false in production');
    }

    if (!config.NEXT_PUBLIC_SENTRY_DSN) {
      warnings.push('SENTRY_DSN not configured for production');
    }

    if (!config.NEXT_PUBLIC_GTM_ID) {
      warnings.push('GTM_ID not configured for production');
    }

    // Security checks
    if (!config.API_URL.startsWith('https://')) {
      errors.push('API_URL must use HTTPS in production');
    }

    if (!config.PUBLIC_URL.startsWith('https://')) {
      errors.push('PUBLIC_URL must use HTTPS in production');
    }

    console.log('✅ Production security checks passed');
  }

  if (env === 'local') {
    // Local development validations
    if (!config.API_URL.includes('localhost')) {
      warnings.push('API_URL should point to localhost in local environment');
    }

    console.log('✅ Local development configuration validated');
  }

  // Port configuration
  if (config.PORT) {
    const port = parseInt(config.PORT);
    if (isNaN(port) || port < 1 || port > 65535) {
      errors.push(`Invalid port number: ${config.PORT}`);
    }
  }

  // Boolean field validation
  const booleanFields = ['NEXT_PUBLIC_DEBUG_MODE', 'NEXT_PUBLIC_ENABLE_ANALYTICS'];
  booleanFields.forEach(field => {
    if (config[field] && !['true', 'false'].includes(config[field])) {
      warnings.push(`${field} should be 'true' or 'false', got: ${config[field]}`);
    }
  });

  // Log level validation
  if (config.NEXT_PUBLIC_LOG_LEVEL) {
    const validLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLevels.includes(config.NEXT_PUBLIC_LOG_LEVEL)) {
      errors.push(`Invalid log level: ${config.NEXT_PUBLIC_LOG_LEVEL}. Must be one of: ${validLevels.join(', ')}`);
    }
  }

  // Display results
  console.log('\n📊 Validation Results:');
  console.log('=====================');

  if (errors.length === 0) {
    console.log('✅ All validations passed!');
  } else {
    console.log(`❌ ${errors.length} error(s) found:`);
    errors.forEach(error => console.log(`   - ${error}`));
  }

  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} warning(s):`);
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  console.log('\n📋 Configuration Summary:');
  console.log('========================');
  console.log(`Environment: ${config.APP_ENV || 'undefined'}`);
  console.log(`API URL: ${config.API_URL || 'undefined'}`);
  console.log(`Public URL: ${config.PUBLIC_URL || 'undefined'}`);
  console.log(`Debug Mode: ${config.NEXT_PUBLIC_DEBUG_MODE || 'undefined'}`);
  console.log(`Analytics: ${config.NEXT_PUBLIC_ENABLE_ANALYTICS || 'undefined'}`);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config
  };
}

function main() {
  const args = process.argv.slice(2);
  const env = args[0] || process.env.APP_ENV || 'local';

  console.log('🔧 Unified AI Frontend - Environment Validator');
  console.log('================================================');
  
  const config = loadEnvironmentConfig(env);
  if (!config) {
    process.exit(1);
  }

  const result = validateEnvironmentConfig(env, config);

  if (!result.isValid) {
    console.log('\n❌ Environment validation failed!');
    console.log('Please fix the errors above before proceeding.');
    process.exit(1);
  }

  console.log('\n✅ Environment validation successful!');
  console.log('Ready for build/deployment.');
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = {
  loadEnvironmentConfig,
  validateEnvironmentConfig
};