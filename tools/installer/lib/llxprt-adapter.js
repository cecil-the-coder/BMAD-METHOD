const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { extractYamlFromAgent } = require('../../lib/yaml-utils');

/**
 * llxprt-code adapter for BMad-Method
 * Converts BMad agents and workflows to llxprt prompt hierarchy
 */
class LlxprtAdapter {
  constructor() {
    this.llxprtRoot = path.join(os.homedir(), '.llxprt', 'prompts');
    this.bmadToolsDir = path.join(this.llxprtRoot, 'tools', 'bmad');
    this.bmadEnvDir = path.join(this.llxprtRoot, 'env', 'bmad');
    this.bmadServicesDir = path.join(this.llxprtRoot, 'services', 'bmad');
  }

  /**
   * Convert BMad agent to llxprt tool prompt
   */
  convertAgentToToolPrompt(agentContent, agentId) {
    try {
      const yamlConfig = extractYamlFromAgent(agentContent);
      const agent = yamlConfig.agent || {};
      const persona = yamlConfig.persona || {};
      const commands = yamlConfig.commands || [];
      
      // Extract the core prompt content (everything after the YAML block)
      const contentParts = agentContent.split('```');
      const promptContent = contentParts.length > 2 ? contentParts.slice(2).join('```') : '';

      // Build llxprt-compatible tool prompt
      return this.buildToolPrompt({
        agentId,
        agent,
        persona,
        commands,
        promptContent,
        yamlConfig
      });
    } catch (error) {
      console.warn(`Warning: Could not parse agent ${agentId}:`, error.message);
      // Fallback: use raw content with basic wrapper
      return this.buildFallbackToolPrompt(agentContent, agentId);
    }
  }

  /**
   * Build structured llxprt tool prompt
   */
  buildToolPrompt({ agentId, agent, persona, commands, promptContent, yamlConfig }) {
    const toolPrompt = `# BMad ${agent.title || agentId} Tool

## Tool Description
${agent.whenToUse || `Use this tool for ${agentId} related tasks`}

## Context Variables
- {{project_type}} - Current project type (detected from environment)
- {{git_repo}} - Whether this is a git repository
- {{bmad_config}} - BMad core configuration if available
- {{story_files}} - Current story files in development
- {{architecture_docs}} - Available architecture documentation

## Agent Persona
**Role**: ${persona.role || 'Specialized AI Agent'}
**Style**: ${persona.style || 'Professional and helpful'}
**Identity**: ${persona.identity || 'Expert assistant'}
**Focus**: ${persona.focus || 'Task completion'}

## Available Commands
${this.formatCommands(commands)}

## Activation Instructions
When this tool is activated:
1. Adopt the persona defined above
2. Follow the core principles and workflow rules
3. Use the available commands with * prefix (e.g., *help)
4. Stay in character throughout the interaction

## Core Configuration
\`\`\`yaml
${this.extractCoreConfig(yamlConfig)}
\`\`\`

## Extended Instructions
${promptContent}
`;

    return toolPrompt;
  }

  /**
   * Build fallback tool prompt for unparseable agents
   */
  buildFallbackToolPrompt(content, agentId) {
    return `# BMad ${agentId} Tool

## Tool Description
BMad agent for ${agentId} related tasks

## Context Variables
- {{project_type}} - Current project type
- {{git_repo}} - Whether this is a git repository
- {{bmad_config}} - BMad configuration

## Original Agent Content
${content}
`;
  }

  /**
   * Format commands for llxprt display
   */
  formatCommands(commands) {
    if (!commands || commands.length === 0) {
      return '- *help: Show available commands';
    }

    if (Array.isArray(commands)) {
      return commands.map(cmd => `- *${cmd}: Command description`).join('\n');
    }

    // Handle object format commands
    return Object.entries(commands)
      .map(([cmd, desc]) => {
        if (typeof desc === 'string') {
          return `- *${cmd}: ${desc}`;
        } else if (typeof desc === 'object') {
          return `- *${cmd}: ${desc.description || 'Complex command - see extended instructions'}`;
        }
        return `- *${cmd}: Command available`;
      })
      .join('\n');
  }

  /**
   * Extract core configuration for display
   */
  extractCoreConfig(yamlConfig) {
    const coreConfig = {
      agent: yamlConfig.agent || {},
      persona: yamlConfig.persona || {},
      core_principles: yamlConfig.core_principles || []
    };
    
    return JSON.stringify(coreConfig, null, 2)
      .replace(/^/gm, '  '); // Indent for YAML block
  }

  /**
   * Convert BMad agent to llxprt service (command)
   */
  convertAgentToServicePrompt(agentContent, agentId) {
    try {
      const yamlConfig = extractYamlFromAgent(agentContent);
      const agent = yamlConfig.agent || {};
      const persona = yamlConfig.persona || {};
      
      // Build llxprt service prompt for slash commands
      return `# /${agentId} Command Service

## Command Description
Activates the ${agent.title || agent.name || agentId} agent persona for specialized assistance.

## Usage
\`/${agentId}\` - Switch to ${agent.title || agentId} mode

## When to Use
${agent.whenToUse || `Use this command when you need ${agentId} expertise`}

## Agent Activation
When this command is executed, the assistant will:

1. **Adopt Persona**: ${persona.role || 'Specialized expert role'}
2. **Communication Style**: ${persona.style || 'Professional and focused'}
3. **Primary Focus**: ${persona.focus || 'Task completion and quality'}

## Context Integration
This command automatically loads:
- **Project Context**: {{project_type}} and {{git_repo}} status
- **BMad Configuration**: {{bmad_config}} if available
- **Development State**: Current stories and progress
- **Architecture**: Available documentation and standards

## Full Agent Definition
${agentContent}

## Command Behavior
After using \`/${agentId}\`, all subsequent interactions will be handled by this specialized agent until you switch to another mode or reset.
`;
    } catch (error) {
      console.warn(`Warning: Could not parse agent ${agentId} for service:`, error.message);
      return this.buildFallbackServicePrompt(agentContent, agentId);
    }
  }

  /**
   * Build fallback service prompt
   */
  buildFallbackServicePrompt(content, agentId) {
    return `# /${agentId} Command Service

## Command Description
BMad ${agentId} agent command

## Usage
\`/${agentId}\` - Activate ${agentId} agent

## Agent Content
${content}
`;
  }

  /**
   * Convert BMad task to llxprt service (command)
   */
  convertTaskToServicePrompt(taskContent, taskId) {
    return `# /${taskId} Command Service

## Command Description
Executes the BMad ${taskId} task workflow.

## Usage
\`/${taskId}\` - Run ${taskId} task

## Context Integration
- **Project Root**: {{project_root}}
- **BMad Config**: {{bmad_config}}
- **Current State**: {{dev_context}}

## Task Workflow
${taskContent}

## Command Behavior
This command executes a structured BMad task workflow. Follow the task instructions step by step.
`;
  }

  /**
   * Convert BMad workflow to llxprt environment prompt
   */
  convertWorkflowToEnvPrompt(workflowContent, workflowId) {
    return `# BMad ${workflowId} Environment

## Environment Description
This environment is configured for BMad ${workflowId} workflow execution.

## Context Detection
- Automatically detects project structure
- Loads BMad core configuration
- Identifies current epic and story status
- Provides access to architecture documents

## Workflow Configuration
${workflowContent}

## Environment Variables
- BMAD_WORKFLOW=${workflowId}
- BMAD_CORE_CONFIG={{bmad_config}}
- PROJECT_ROOT={{project_root}}

## Available Tools
When in this environment, you have access to all BMad tools:
{{enabledTools}}
`;
  }

  /**
   * Install BMad prompts to llxprt structure
   */
  async installToLlxprt(bmadCorePath) {
    console.log('Installing BMad prompts to llxprt structure...');

    // Ensure directories exist
    await fs.ensureDir(this.bmadToolsDir);
    await fs.ensureDir(this.bmadEnvDir);
    await fs.ensureDir(this.bmadServicesDir);

    // Install agents as tools
    await this.installAgentsAsTools(bmadCorePath);

    // Install agents as services (commands)
    await this.installAgentsAsServices(bmadCorePath);

    // Install tasks as services (commands)
    await this.installTasksAsServices(bmadCorePath);

    // Install workflows as environments
    await this.installWorkflowsAsEnvironments(bmadCorePath);

    console.log(`✅ BMad prompts installed to ${this.llxprtRoot}`);
    console.log(`   - Tools: ${this.bmadToolsDir}`);
    console.log(`   - Commands: ${this.bmadServicesDir}`);
    console.log(`   - Environments: ${this.bmadEnvDir}`);
  }

  /**
   * Install BMad agents as llxprt tools
   */
  async installAgentsAsTools(bmadCorePath) {
    const agentsDir = path.join(bmadCorePath, 'agents');
    
    if (!(await fs.pathExists(agentsDir))) {
      console.warn('BMad agents directory not found');
      return;
    }

    const agentFiles = await fs.readdir(agentsDir);
    
    for (const agentFile of agentFiles) {
      if (!agentFile.endsWith('.md')) continue;
      
      const agentId = path.basename(agentFile, '.md');
      const agentPath = path.join(agentsDir, agentFile);
      const agentContent = await fs.readFile(agentPath, 'utf8');
      
      const toolPrompt = this.convertAgentToToolPrompt(agentContent, agentId);
      const outputPath = path.join(this.bmadToolsDir, `${agentId}.md`);
      
      await fs.writeFile(outputPath, toolPrompt);
      console.log(`   ✓ Agent ${agentId} → tool prompt`);
    }
  }

  /**
   * Install BMad agents as llxprt services (commands)
   */
  async installAgentsAsServices(bmadCorePath) {
    const agentsDir = path.join(bmadCorePath, 'agents');
    
    if (!(await fs.pathExists(agentsDir))) {
      console.warn('BMad agents directory not found');
      return;
    }

    const agentFiles = await fs.readdir(agentsDir);
    
    for (const agentFile of agentFiles) {
      if (!agentFile.endsWith('.md')) continue;
      
      const agentId = path.basename(agentFile, '.md');
      const agentPath = path.join(agentsDir, agentFile);
      const agentContent = await fs.readFile(agentPath, 'utf8');
      
      const servicePrompt = this.convertAgentToServicePrompt(agentContent, agentId);
      const outputPath = path.join(this.bmadServicesDir, `${agentId}.md`);
      
      await fs.writeFile(outputPath, servicePrompt);
      console.log(`   ✓ Agent ${agentId} → /${agentId} command`);
    }
  }

  /**
   * Install BMad tasks as llxprt services (commands)
   */
  async installTasksAsServices(bmadCorePath) {
    const tasksDir = path.join(bmadCorePath, 'tasks');
    
    if (!(await fs.pathExists(tasksDir))) {
      console.warn('BMad tasks directory not found');
      return;
    }

    const taskFiles = await fs.readdir(tasksDir);
    
    for (const taskFile of taskFiles) {
      if (!taskFile.endsWith('.md')) continue;
      
      const taskId = path.basename(taskFile, '.md');
      const taskPath = path.join(tasksDir, taskFile);
      const taskContent = await fs.readFile(taskPath, 'utf8');
      
      const servicePrompt = this.convertTaskToServicePrompt(taskContent, taskId);
      const outputPath = path.join(this.bmadServicesDir, `${taskId}.md`);
      
      await fs.writeFile(outputPath, servicePrompt);
      console.log(`   ✓ Task ${taskId} → /${taskId} command`);
    }
  }

  /**
   * Install BMad workflows as llxprt environments
   */
  async installWorkflowsAsEnvironments(bmadCorePath) {
    const workflowsDir = path.join(bmadCorePath, 'workflows');
    
    if (!(await fs.pathExists(workflowsDir))) {
      console.warn('BMad workflows directory not found');
      return;
    }

    const workflowFiles = await fs.readdir(workflowsDir);
    
    for (const workflowFile of workflowFiles) {
      if (!workflowFile.endsWith('.yaml')) continue;
      
      const workflowId = path.basename(workflowFile, '.yaml');
      const workflowPath = path.join(workflowsDir, workflowFile);
      const workflowContent = await fs.readFile(workflowPath, 'utf8');
      
      const envPrompt = this.convertWorkflowToEnvPrompt(workflowContent, workflowId);
      const outputPath = path.join(this.bmadEnvDir, `${workflowId}.md`);
      
      await fs.writeFile(outputPath, envPrompt);
      console.log(`   ✓ Workflow ${workflowId} → environment prompt`);
    }
  }

  /**
   * Create base llxprt configuration for BMad
   */
  async createBaseConfig() {
    const configContent = `# BMad Method Configuration for llxprt-code

This directory contains BMad Method prompts adapted for llxprt-code.

## Structure
- \`tools/bmad/\` - BMad agents as llxprt tools
- \`env/bmad/\` - BMad workflows as llxprt environments

## Usage
BMad agents are available as tools in any llxprt-compatible IDE. Simply reference
the agent name and llxprt will load the appropriate persona and capabilities.

## Integration
BMad's structured approach to agile development integrates seamlessly with
llxprt's context-aware prompt system, providing:
- Dynamic environment detection
- Context-specific agent activation
- Workflow-aware prompt resolution
`;

    const readmePath = path.join(this.llxprtRoot, 'bmad-README.md');
    await fs.writeFile(readmePath, configContent);
  }
}

module.exports = LlxprtAdapter;