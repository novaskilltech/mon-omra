const { Client } = require('pg');

const regions = [
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'ca-central-1', 'sa-east-1', 'ap-northeast-1', 'ap-northeast-2',
  'ap-southeast-1', 'ap-southeast-2', 'ap-south-1'
];

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const client = new Client({
    host,
    port: 6543,
    user: 'postgres.tqbcmcddnohnqmcxvgut',
    password: 'Khouribga111*',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000
  });

  try {
    await client.connect();
    console.log(`🎉 SUCCESS: Found tenant on region: ${region}`);
    await client.end();
    return true;
  } catch (err) {
    if (err.message.includes('not found') && err.message.includes('tenant')) {
      // Tenant not found in this region
      return false;
    } else {
      // Authentication failed or other error, but tenant WAS found!
      console.log(`✨ TENANT FOUND on region: ${region} (Error: ${err.message})`);
      try { await client.end(); } catch(e){}
      return true;
    }
  }
}

async function main() {
  console.log('Searching for Supabase project region...');
  for (const region of regions) {
    const found = await testRegion(region);
    if (found) {
      console.log(`Match found: ${region}`);
      break;
    }
  }
}

main().catch(console.error);
