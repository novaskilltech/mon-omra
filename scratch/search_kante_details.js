const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\P C\\.gemini\\antigravity\\brain\\ec5ef82b-cb13-468f-ae80-f1add3597e92\\.system_generated\\logs\\transcript.jsonl';

async function run() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    if (line.includes('individual_flight_info') && !line.includes('search_logs_all.js') && !line.includes('find_any_kante_flights.js')) {
      console.log(`Line ${lineNum}: ${line.substring(0, 1500)}`);
    }
  }
}

run();
