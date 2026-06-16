const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = 'C:\\Users\\P C\\.gemini\\antigravity\\brain\\ec5ef82b-cb13-468f-ae80-f1add3597e92\\.system_generated\\logs\\transcript.jsonl';

async function run() {
  if (!fs.existsSync(logPath)) {
    console.error('Log file does not exist');
    return;
  }
  
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    // Only check lines from the previous session (prior to step 1350)
    if (lineNum < 1350) {
      if (line.toLowerCase().includes('kante')) {
        console.log(`Line ${lineNum}: ${line.substring(0, 1000)}`);
      }
    }
  }
}

run();
