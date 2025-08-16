#!/usr/bin/env node

/**
 * Test script for BMad-Method llxprt-code integration
 * Verifies that agents can be properly converted to llxprt format
 */

const path = require('path');
const fs = require('fs-extra');
const BmadLlxprtTransformer = require('./tools/installer/lib/bmad-llxprt-transformer');
const LlxprtAdapter = require('./tools/installer/lib/llxprt-adapter');

async function testAgentConversion() {
  console.log('🧪 Testing BMad agent conversion to llxprt format...\n');

  try {
    // Test with the dev agent
    const devAgentPath = path.join(__dirname, 'bmad-core', 'agents', 'dev.md');
    
    if (!(await fs.pathExists(devAgentPath))) {
      console.error('❌ Dev agent not found at:', devAgentPath);
      return false;
    }

    const devAgentContent = await fs.readFile(devAgentPath, 'utf8');
    console.log('✅ Loaded dev agent content');

    // Test transformer
    const transformer = new BmadLlxprtTransformer();
    const converted = transformer.transformAgent(devAgentContent, 'dev');
    
    console.log('✅ Agent transformation successful');
    console.log('📋 Transformed agent metadata:', JSON.stringify(converted.metadata, null, 2));

    // Test adapter
    const adapter = new LlxprtAdapter();
    const toolPrompt = adapter.convertAgentToToolPrompt(devAgentContent, 'dev');
    const servicePrompt = adapter.convertAgentToServicePrompt(devAgentContent, 'dev');
    
    console.log('✅ Adapter conversion successful');
    console.log('📄 Generated tool prompt preview:');
    console.log('---');
    console.log(toolPrompt.substring(0, 300) + '...\n');
    
    console.log('📄 Generated service (/dev command) prompt preview:');
    console.log('---');
    console.log(servicePrompt.substring(0, 300) + '...\n');

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

async function testWorkflowConversion() {
  console.log('🧪 Testing BMad workflow conversion to llxprt format...\n');

  try {
    // Test with greenfield workflow
    const workflowPath = path.join(__dirname, 'bmad-core', 'workflows', 'greenfield-fullstack.yaml');
    
    if (!(await fs.pathExists(workflowPath))) {
      console.error('❌ Workflow not found at:', workflowPath);
      return false;
    }

    const workflowContent = await fs.readFile(workflowPath, 'utf8');
    console.log('✅ Loaded workflow content');

    // Test transformer
    const transformer = new BmadLlxprtTransformer();
    const converted = transformer.transformWorkflow(workflowContent, 'greenfield-fullstack');
    
    console.log('✅ Workflow transformation successful');
    console.log('📋 Transformed workflow metadata:', JSON.stringify(converted.metadata, null, 2));

    // Test adapter
    const adapter = new LlxprtAdapter();
    const envPrompt = adapter.convertWorkflowToEnvPrompt(workflowContent, 'greenfield-fullstack');
    
    console.log('✅ Adapter conversion successful');
    console.log('📄 Generated environment prompt preview:');
    console.log('---');
    console.log(envPrompt.substring(0, 500) + '...\n');

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

async function testConfigurationGeneration() {
  console.log('🧪 Testing llxprt configuration generation...\n');

  try {
    const adapter = new LlxprtAdapter();
    await adapter.createBaseConfig();
    
    console.log('✅ Base configuration created successfully');
    return true;
  } catch (error) {
    console.error('❌ Configuration test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 BMad-Method llxprt-code Integration Test Suite\n');
  console.log('=' .repeat(60));

  let allPassed = true;

  // Test agent conversion
  const agentTest = await testAgentConversion();
  allPassed = allPassed && agentTest;

  console.log('=' .repeat(60));

  // Test workflow conversion  
  const workflowTest = await testWorkflowConversion();
  allPassed = allPassed && workflowTest;

  console.log('=' .repeat(60));

  // Test configuration generation
  const configTest = await testConfigurationGeneration();
  allPassed = allPassed && configTest;

  console.log('=' .repeat(60));

  // Final results
  if (allPassed) {
    console.log('🎉 All tests passed! BMad-llxprt integration is working correctly.');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npx bmad-method install --ide llxprt');
    console.log('   2. Check: ~/.llxprt/prompts/tools/bmad/');
    console.log('   3. Use BMad agents in any llxprt-compatible IDE');
  } else {
    console.log('❌ Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testAgentConversion,
  testWorkflowConversion, 
  testConfigurationGeneration
};