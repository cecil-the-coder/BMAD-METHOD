const yaml = require('js-yaml');

/**
 * Transforms BMad agents and workflows into llxprt-compatible prompts
 * Handles the specific conversion logic between BMad's YAML structure and llxprt's format
 */
class BmadLlxprtTransformer {
  
  /**
   * Transform BMad agent to llxprt tool prompt with enhanced context awareness
   */
  transformAgent(agentContent, agentId) {
    const parsed = this.parseAgentContent(agentContent);
    
    return {
      id: agentId,
      type: 'tool',
      content: this.buildLlxprtToolPrompt(parsed),
      metadata: this.extractAgentMetadata(parsed)
    };
  }

  /**
   * Transform BMad workflow to llxprt environment prompt
   */
  transformWorkflow(workflowContent, workflowId) {
    const parsed = this.parseWorkflowContent(workflowContent);
    
    return {
      id: workflowId,
      type: 'environment',
      content: this.buildLlxprtEnvPrompt(parsed),
      metadata: this.extractWorkflowMetadata(parsed)
    };
  }

  /**
   * Parse BMad agent content and extract structured data
   */
  parseAgentContent(content) {
    const lines = content.split('\n');
    let yamlStart = -1;
    let yamlEnd = -1;
    
    // Find YAML block boundaries
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '```yaml') {
        yamlStart = i + 1;
      } else if (lines[i].trim() === '```' && yamlStart !== -1) {
        yamlEnd = i;
        break;
      }
    }

    let yamlConfig = {};
    let remainingContent = content;

    if (yamlStart !== -1 && yamlEnd !== -1) {
      try {
        const yamlContent = lines.slice(yamlStart, yamlEnd).join('\n');
        yamlConfig = yaml.load(yamlContent) || {};
        
        // Remove YAML block from content
        const beforeYaml = lines.slice(0, yamlStart - 1).join('\n');
        const afterYaml = lines.slice(yamlEnd + 1).join('\n');
        remainingContent = beforeYaml + '\n' + afterYaml;
      } catch (error) {
        console.warn('Failed to parse YAML config:', error.message);
      }
    }

    return {
      yamlConfig,
      remainingContent,
      raw: content
    };
  }

  /**
   * Parse BMad workflow content
   */
  parseWorkflowContent(content) {
    try {
      const workflow = yaml.load(content);
      return {
        workflow,
        raw: content
      };
    } catch (error) {
      console.warn('Failed to parse workflow YAML:', error.message);
      return {
        workflow: {},
        raw: content
      };
    }
  }

  /**
   * Build llxprt tool prompt from parsed agent data
   */
  buildLlxprtToolPrompt(parsed) {
    const { yamlConfig, remainingContent } = parsed;
    const agent = yamlConfig.agent || {};
    const persona = yamlConfig.persona || {};
    const commands = yamlConfig.commands || [];
    const dependencies = yamlConfig.dependencies || {};

    return `# ${agent.title || agent.name || 'BMad Agent'} ${agent.icon || '🤖'}

## Tool Overview
**When to Use**: ${agent.whenToUse || 'Specialized agent for specific tasks'}
**Agent ID**: ${agent.id || 'unknown'}

## Context Integration
This tool automatically integrates with your development environment:
- **Project Detection**: {{project_type}} - Detected project type
- **Git Repository**: {{git_repo}} - Repository status and branch info  
- **BMad Configuration**: {{bmad_config}} - Core BMad settings if available
- **Development Context**: {{dev_context}} - Current stories, epics, and progress
- **Architecture Docs**: {{architecture_docs}} - Available system documentation

## Agent Persona
**Role**: ${persona.role || 'AI Assistant'}
**Communication Style**: ${persona.style || 'Professional and helpful'}
**Core Identity**: ${persona.identity || 'Specialized expert'}
**Primary Focus**: ${persona.focus || 'Task completion and quality'}

${this.formatCorePrinciples(yamlConfig.core_principles)}

## Available Commands
All commands use the * prefix for activation:

${this.formatCommandsForLlxprt(commands)}

## Dependencies and Resources
${this.formatDependencies(dependencies)}

## Activation Protocol
When this tool is activated:
1. **State Adoption**: Immediately adopt the defined persona and focus
2. **Context Loading**: Automatically load project and environment context
3. **Capability Announcement**: Greet user and mention *help command
4. **Workflow Engagement**: Follow BMad structured workflow patterns
5. **Character Consistency**: Maintain persona throughout interaction

## Enhanced Workflow Instructions
${remainingContent}

## llxprt Integration Notes
- This tool leverages llxprt's environment detection for project-specific context
- Template variables are automatically resolved based on your current environment
- Commands integrate with llxprt's tool ecosystem for seamless workflow
- BMad's structured approach enhances llxprt's context-aware capabilities
`;
  }

  /**
   * Build llxprt environment prompt from parsed workflow data
   */
  buildLlxprtEnvPrompt(parsed) {
    const { workflow } = parsed;
    const workflowInfo = workflow.workflow || {};

    return `# BMad ${workflowInfo.name || 'Workflow'} Environment

## Environment Overview
**Type**: ${workflowInfo.type || 'general'}
**Description**: ${workflowInfo.description || 'BMad structured workflow environment'}

## Project Types Supported
${this.formatProjectTypes(workflowInfo.project_types)}

## Environment Context Variables
- **BMAD_WORKFLOW**: ${workflowInfo.id || 'unknown'}
- **PROJECT_ROOT**: {{project_root}} - Automatically detected project root
- **BMAD_CONFIG**: {{bmad_config}} - BMad core configuration
- **CURRENT_EPIC**: {{current_epic}} - Active epic if available
- **STORY_STATUS**: {{story_status}} - Current story progress
- **ARCHITECTURE_DOCS**: {{architecture_docs}} - Available documentation

## Workflow Sequence
${this.formatWorkflowSequence(workflowInfo.sequence)}

## Tool Integration
When in this environment, the following BMad tools are optimally configured:
{{enabledTools}}

## Environment Activation
This environment automatically:
1. **Detects Project Context**: Identifies project type and structure
2. **Loads BMad Configuration**: Reads and applies core-config.yaml settings
3. **Initializes Workflow State**: Sets up sequence tracking and progress monitoring
4. **Enables Tool Coordination**: Optimizes tool interactions for workflow efficiency

## Workflow Configuration
\`\`\`yaml
${parsed.raw}
\`\`\`

## llxprt Environment Integration
- Leverages llxprt's environment detection for seamless context switching
- Provides workflow-specific tool recommendations and configurations
- Integrates with llxprt's context variables for dynamic environment adaptation
`;
  }

  /**
   * Format core principles for display
   */
  formatCorePrinciples(principles) {
    if (!principles || principles.length === 0) {
      return '';
    }

    return `## Core Operating Principles
${principles.map(principle => `- ${principle}`).join('\n')}
`;
  }

  /**
   * Format commands for llxprt display
   */
  formatCommandsForLlxprt(commands) {
    if (!commands || commands.length === 0) {
      return '- **\\*help**: Display available commands and usage guidance';
    }

    if (Array.isArray(commands)) {
      return commands.map(cmd => `- **\\*${cmd}**: Available command`).join('\n');
    }

    // Handle object format commands with detailed descriptions
    return Object.entries(commands)
      .map(([cmd, details]) => {
        if (typeof details === 'string') {
          return `- **\\*${cmd}**: ${details}`;
        } else if (typeof details === 'object') {
          const desc = details.description || details.notes || 'Complex workflow command';
          return `- **\\*${cmd}**: ${desc}`;
        }
        return `- **\\*${cmd}**: Command available`;
      })
      .join('\n');
  }

  /**
   * Format dependencies for display
   */
  formatDependencies(dependencies) {
    if (!dependencies || Object.keys(dependencies).length === 0) {
      return 'No specific dependencies required.';
    }

    let formatted = '';
    Object.entries(dependencies).forEach(([category, items]) => {
      if (Array.isArray(items) && items.length > 0) {
        formatted += `**${category.charAt(0).toUpperCase() + category.slice(1)}**:\n`;
        formatted += items.map(item => `- ${item}`).join('\n') + '\n\n';
      }
    });

    return formatted || 'Dependencies dynamically resolved from BMad core.';
  }

  /**
   * Format project types for workflow environment
   */
  formatProjectTypes(projectTypes) {
    if (!projectTypes || projectTypes.length === 0) {
      return '- Universal (all project types)';
    }

    return projectTypes.map(type => `- ${type}`).join('\n');
  }

  /**
   * Format workflow sequence for environment
   */
  formatWorkflowSequence(sequence) {
    if (!sequence || sequence.length === 0) {
      return 'Flexible sequence based on project needs.';
    }

    return sequence.map((step, index) => {
      const agent = step.agent || 'unknown';
      const creates = step.creates || 'output';
      const notes = step.notes || '';
      
      return `${index + 1}. **${agent}** → Creates: ${creates}${notes ? `\n   Notes: ${notes}` : ''}`;
    }).join('\n\n');
  }

  /**
   * Extract metadata for llxprt compatibility
   */
  extractAgentMetadata(parsed) {
    const { yamlConfig } = parsed;
    const agent = yamlConfig.agent || {};
    
    return {
      name: agent.name || agent.id,
      title: agent.title,
      icon: agent.icon,
      whenToUse: agent.whenToUse,
      hasCommands: !!(yamlConfig.commands && Object.keys(yamlConfig.commands).length > 0),
      hasDependencies: !!(yamlConfig.dependencies && Object.keys(yamlConfig.dependencies).length > 0),
      bmadVersion: 'v4.x'
    };
  }

  /**
   * Extract metadata for workflow environments
   */
  extractWorkflowMetadata(parsed) {
    const { workflow } = parsed;
    const workflowInfo = workflow.workflow || {};
    
    return {
      name: workflowInfo.name,
      type: workflowInfo.type,
      projectTypes: workflowInfo.project_types || [],
      hasSequence: !!(workflowInfo.sequence && workflowInfo.sequence.length > 0),
      bmadVersion: 'v4.x'
    };
  }
}

module.exports = BmadLlxprtTransformer;