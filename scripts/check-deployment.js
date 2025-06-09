#!/usr/bin/env node

/**
 * Deployment health check script
 * Verifies that the deployed application is working correctly
 */

import https from 'https';
import http from 'http';

const DEFAULT_URL = 'https://cyberdefensesim.onrender.com';

async function checkEndpoint(url, path = '/health') {
  return new Promise((resolve) => {
    const fullUrl = new URL(path, url);
    const client = fullUrl.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: fullUrl.hostname,
      port: fullUrl.port || (fullUrl.protocol === 'https:' ? 443 : 80),
      path: fullUrl.pathname,
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'Deployment-Health-Check/1.0'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            success: true,
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            url: fullUrl.toString()
          });
        } catch (error) {
          resolve({
            success: false,
            status: res.statusCode,
            headers: res.headers,
            data: data,
            error: 'Invalid JSON response',
            url: fullUrl.toString()
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        url: fullUrl.toString()
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout',
        url: fullUrl.toString()
      });
    });

    req.end();
  });
}

async function runHealthCheck(url = DEFAULT_URL) {
  console.log('🏥 CyberDefenseSim Deployment Health Check');
  console.log('='.repeat(50));
  console.log(`Checking: ${url}`);
  console.log('');

  // Check health endpoint
  console.log('1. Testing health endpoint...');
  const healthResult = await checkEndpoint(url, '/health');
  
  if (healthResult.success && healthResult.status === 200) {
    console.log('✅ Health check passed');
    console.log(`   Status: ${healthResult.status}`);
    console.log(`   Message: ${healthResult.data.message || 'N/A'}`);
    console.log(`   Uptime: ${healthResult.data.uptime || 'N/A'}s`);
  } else {
    console.log('❌ Health check failed');
    console.log(`   Status: ${healthResult.status || 'N/A'}`);
    console.log(`   Error: ${healthResult.error || 'Unknown error'}`);
  }
  
  console.log('');

  // Check static assets
  console.log('2. Testing static asset serving...');
  const staticResult = await checkEndpoint(url, '/');
  
  if (staticResult.success && staticResult.status === 200) {
    console.log('✅ Static assets accessible');
    console.log(`   Status: ${staticResult.status}`);
    console.log(`   Content-Type: ${staticResult.headers['content-type'] || 'N/A'}`);
  } else {
    console.log('❌ Static assets check failed');
    console.log(`   Status: ${staticResult.status || 'N/A'}`);
    console.log(`   Error: ${staticResult.error || 'Unknown error'}`);
  }

  console.log('');
  console.log('='.repeat(50));
  
  const allPassed = healthResult.success && healthResult.status === 200 &&
                   staticResult.success && staticResult.status === 200;
  
  if (allPassed) {
    console.log('🎉 All checks passed! Deployment is healthy.');
  } else {
    console.log('⚠️  Some checks failed. Review the results above.');
  }
  
  return allPassed;
}

// Run the health check
runHealthCheck().catch(console.error);
