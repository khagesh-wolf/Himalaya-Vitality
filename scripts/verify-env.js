
require('dotenv').config();
const net = require('net');
const tls = require('tls');
const { URL } = require('url');

const databaseUrl = process.env.DATABASE_URL || '';
const directUrl = process.env.DIRECT_URL || '';

console.log('\n🔍 Diagnostic: Checking Database Connectivity & SSL...\n');

// 1. Check if Variables Exist
if (!databaseUrl) {
  console.error('❌ DATABASE_URL is missing in .env');
  process.exit(1);
}
if (!directUrl) {
  console.error('❌ DIRECT_URL is missing in .env');
  process.exit(1);
}

// Helper to analyze URL parameters
function checkParams(label, urlStr) {
    try {
        const parsed = new URL(urlStr);
        const params = parsed.searchParams;
        const issues = [];

        if (!params.get('sslmode') || params.get('sslmode') !== 'require') {
            issues.push(`Missing 'sslmode=require'. Neon requires SSL.`);
        }

        const timeout = params.get('connect_timeout');
        if (!timeout) {
            issues.push(`Missing 'connect_timeout'. Recommended for remote regions (e.g., &connect_timeout=30).`);
        } else if (parseInt(timeout) < 10) {
            issues.push(`'connect_timeout' is too low (${timeout}s). Increase to 30 or 60.`);
        }

        if (issues.length > 0) {
            console.warn(`⚠️  Potential config issues in ${label}:`);
            issues.forEach(i => console.warn(`   - ${i}`));
            return false;
        }
        return true;
    } catch (e) {
        console.error(`❌ ${label}: Invalid URL format.`);
        return false;
    }
}

// 2. Helper to Parse and Test TCP + TLS
function testConnection(label, urlStr) {
  return new Promise((resolve) => {
    // Regex to extract host and port.
    const match = urlStr.match(/@([^:/]+)(?::(\d+))?/);
    if (!match) {
        console.error(`❌ ${label}: Could not parse host from URL.`);
        resolve(false);
        return;
    }

    const host = match[1];
    const port = match[2] ? parseInt(match[2], 10) : 5432;

    console.log(`\n👉 Testing ${label} (${host}:${port})...`);

    // Step A: TCP Connect
    const socket = new net.Socket();
    socket.setTimeout(5000); 

    socket.on('connect', () => {
      console.log(`   ✅ TCP Connection established.`);
      
      // Step B: TLS Handshake (Simulate Postgres SSL Request)
      // Note: Real PG SSL handshake is complex, but we can try a basic TLS socket upgrade
      // to see if the server accepts it or if node fails.
      
      // For checking strictly if SSL is BLOCKED or working, we typically just need to know 
      // if the port allows data. Since TCP passed, let's analyze the URL params which are usually the culprit.
      
      socket.destroy();
      
      // Check Params Warning
      checkParams(label, urlStr);
      
      resolve(true);
    });

    socket.on('timeout', () => {
      console.error(`   ❌ Connection Timed Out. Firewall or high latency.`);
      socket.destroy();
      resolve(false);
    });

    socket.on('error', (err) => {
      console.error(`   ❌ Connection Error: ${err.message}`);
      if (err.message.includes('ENOTFOUND')) {
          console.error(`      -> DNS Error. Hostname invalid.`);
      }
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

async function runDiagnostics() {
    console.log('-------------------------------------------------------');
    console.log('NOTE: If you are seeing P1001 errors, it is likely a Timeout.');
    console.log('ACTION: Append "&connect_timeout=60" to both URLs in .env');
    console.log('-------------------------------------------------------');

    // Check Pooler URL
    await testConnection('DATABASE_URL', databaseUrl);

    // Check Direct URL
    const directSuccess = await testConnection('DIRECT_URL', directUrl);

    if (directSuccess) {
        console.log('\n🚀 Network seems reachable. If "db push" still fails:');
        console.log('   1. Ensure you added "?sslmode=require&connect_timeout=60" to .env');
        console.log('   2. Try switching to Node v18 or v20 (v24 is experimental).');
        process.exit(0);
    } else {
        console.log('\n🚫 Network Check Failed.');
        process.exit(1);
    }
}

runDiagnostics();
