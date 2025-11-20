import * as fs from 'fs';
import * as path from 'path';

// Create deployments directory if it doesn't exist
const deploymentsDir = path.join(__dirname, '..', 'deployments');

if (!fs.existsSync(deploymentsDir)) {
  fs.mkdirSync(deploymentsDir, { recursive: true });
  console.log('✅ Created deployments directory');
}

