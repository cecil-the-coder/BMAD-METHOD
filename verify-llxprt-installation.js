#!/usr/bin/env node

/**
 * Verification script for BMad llxprt integration
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function checkPath(filePath, description) {
  try {
    const exists = fs.existsSync(filePath);
    if (exists) {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        const files = fs.readdirSync(filePath);
        console.log(`✅ ${description}: ${filePath} (${files.length} files)`);
        if (files.length > 0) {
          console.log(`   Files: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`);
        }
      } else {
        console.log(`✅ ${description}: ${filePath} (file exists)`);
      }
      return true;
    } else {
      console.log(`❌ ${description}: ${filePath} (not found)`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description}: ${filePath} (error: ${error.message})`);
    return false;
  }
}

function verifyLlxprtInstallation() {
  console.log('🔍 Verifying BMad llxprt-code Integration Installation\n');
  
  const llxprtRoot = path.join(os.homedir(), '.llxprt', 'prompts');
  const bmadToolsDir = path.join(llxprtRoot, 'tools', 'bmad');
  const bmadServicesDir = path.join(llxprtRoot, 'services', 'bmad');
  const bmadEnvDir = path.join(llxprtRoot, 'env', 'bmad');
  const bmadReadme = path.join(llxprtRoot, 'bmad-README.md');

  let allGood = true;
  
  // Check main directories
  allGood &= checkPath(llxprtRoot, 'llxprt prompts root');
  allGood &= checkPath(bmadToolsDir, 'BMad tools directory');
  allGood &= checkPath(bmadServicesDir, 'BMad services (commands) directory');
  allGood &= checkPath(bmadEnvDir, 'BMad environments directory');
  allGood &= checkPath(bmadReadme, 'BMad integration README');
  
  console.log('\n' + '='.repeat(60));
  
  if (allGood) {
    console.log('🎉 BMad llxprt integration successfully installed!');
    console.log('\n📋 Usage Examples:');
    console.log('   Slash Commands: /dev, /pm, /architect, /create-next-story');
    console.log('   Tool References: "as dev agent", "using pm persona"');
    console.log('   Environments: automatically detected based on project type');
    console.log('\n🚀 Ready to use in any llxprt-compatible IDE!');
  } else {
    console.log('❌ Installation incomplete. Some components are missing.');
    console.log('\n🔧 Try running the installation again:');
    console.log('   node tools/installer/bin/bmad.js install --ide llxprt');
  }
}

// Example file content check
function showExampleContent() {
  const llxprtRoot = path.join(os.homedir(), '.llxprt', 'prompts');
  const devToolPath = path.join(llxprtRoot, 'tools', 'bmad', 'dev.md');
  const devCommandPath = path.join(llxprtRoot, 'services', 'bmad', 'dev.md');
  
  console.log('\n📄 Example Content Preview:');
  
  if (fs.existsSync(devToolPath)) {
    try {
      const content = fs.readFileSync(devToolPath, 'utf8');
      console.log('\n--- dev.md (Tool) Preview ---');
      console.log(content.substring(0, 300) + '...');
    } catch (error) {
      console.log('Could not read dev tool file');
    }
  }
  
  if (fs.existsSync(devCommandPath)) {
    try {
      const content = fs.readFileSync(devCommandPath, 'utf8');
      console.log('\n--- dev.md (Command) Preview ---');
      console.log(content.substring(0, 300) + '...');
    } catch (error) {
      console.log('Could not read dev command file');
    }
  }
}

// Run verification
verifyLlxprtInstallation();
showExampleContent();