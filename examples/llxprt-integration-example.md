# BMad-Method llxprt-code Integration Example

This example demonstrates how BMad-Method agents integrate with llxprt-code's prompt system.

## Installation

```bash
# Install BMad with llxprt support
npx bmad-method install --ide llxprt

# Or add llxprt to existing BMad installation
npx bmad-method install
# Then select "llxprt" when prompted for IDE configuration
```

## How It Works

### 1. Agent Conversion
BMad agents (from `.bmad-core/agents/`) are converted to llxprt tools:

**Original BMad Agent** (`dev.md`):
```yaml
agent:
  name: James
  id: dev
  title: Full Stack Developer
  icon: 💻
  whenToUse: "Use for code implementation, debugging, refactoring, and development best practices"

persona:
  role: Expert Senior Software Engineer & Implementation Specialist
  style: Extremely concise, pragmatic, detail-oriented, solution-focused
```

**Converted llxprt Tool** (`~/.llxprt/prompts/tools/bmad/dev.md`):
```markdown
# Full Stack Developer 💻

## Tool Overview
**When to Use**: Use for code implementation, debugging, refactoring, and development best practices
**Agent ID**: dev

## Context Integration
This tool automatically integrates with your development environment:
- **Project Detection**: {{project_type}} - Detected project type
- **Git Repository**: {{git_repo}} - Repository status and branch info  
- **BMad Configuration**: {{bmad_config}} - Core BMad settings if available
- **Development Context**: {{dev_context}} - Current stories, epics, and progress
- **Architecture Docs**: {{architecture_docs}} - Available system documentation

## Agent Persona
**Role**: Expert Senior Software Engineer & Implementation Specialist
**Communication Style**: Extremely concise, pragmatic, detail-oriented, solution-focused
```

### 2. Workflow Integration
BMad workflows become llxprt environments:

**Original Workflow** (`greenfield-fullstack.yaml`):
```yaml
workflow:
  id: greenfield-fullstack
  name: Greenfield Full-Stack Application Development
  description: Agent workflow for building full-stack applications from concept to development
  type: greenfield
  project_types:
    - web-app
    - saas
    - enterprise-app
```

**Converted Environment** (`~/.llxprt/prompts/env/bmad/greenfield-fullstack.md`):
```markdown
# BMad Greenfield Full-Stack Application Development Environment

## Environment Overview
**Type**: greenfield
**Description**: Agent workflow for building full-stack applications from concept to development

## Project Types Supported
- web-app
- saas
- enterprise-app

## Environment Context Variables
- **BMAD_WORKFLOW**: greenfield-fullstack
- **PROJECT_ROOT**: {{project_root}} - Automatically detected project root
- **BMAD_CONFIG**: {{bmad_config}} - BMad core configuration
```

## Directory Structure After Installation

```
~/.llxprt/prompts/
├── tools/bmad/
│   ├── dev.md                 # Developer agent tool
│   ├── pm.md                  # Product Manager agent tool
│   ├── architect.md           # Architect agent tool
│   ├── qa.md                  # QA agent tool
│   ├── sm.md                  # Scrum Master agent tool
│   └── ux-expert.md          # UX Expert agent tool
├── services/bmad/
│   ├── dev.md                 # /dev command
│   ├── pm.md                  # /pm command  
│   ├── architect.md           # /architect command
│   ├── qa.md                  # /qa command
│   ├── sm.md                  # /sm command
│   ├── ux-expert.md          # /ux-expert command
│   ├── create-next-story.md   # /create-next-story command
│   ├── validate-next-story.md # /validate-next-story command
│   └── execute-checklist.md   # /execute-checklist command
├── env/bmad/
│   ├── greenfield-fullstack.md
│   ├── brownfield-fullstack.md
│   ├── greenfield-ui.md
│   └── brownfield-ui.md
└── bmad-README.md            # Integration documentation
```

## Usage Examples

### 1. Using BMad Agents in llxprt-compatible IDEs

In any llxprt-compatible IDE or tool, you can use BMad agents in multiple ways:

#### A. Slash Commands (Services)
```
# Use slash commands to activate agent personas
/dev          # Switches to developer agent mode
/pm           # Switches to product manager mode  
/architect    # Switches to architect mode
/qa           # Switches to QA mode

# Use slash commands for specific tasks
/create-next-story     # Runs BMad story creation workflow
/validate-next-story   # Validates current story
/execute-checklist     # Runs BMad checklist workflow
```

#### B. Direct Tool References
```
# Direct agent activation as tools
"As the dev agent, implement this user authentication feature..."

# Context-aware usage
"Using the pm agent persona, create a PRD for this project based on {{project_type}}"

# Workflow-specific environment
"In the greenfield-fullstack environment, guide me through the architecture phase"
```

### 2. Environment Detection

llxprt automatically provides context variables that BMad agents can use:

- `{{project_type}}` - Detected from package.json, Cargo.toml, etc.
- `{{git_repo}}` - Current branch and repo status
- `{{bmad_config}}` - BMad core configuration if available
- `{{architecture_docs}}` - Available documentation files

### 3. Tool Coordination

When multiple BMad tools are used together, they share context through llxprt's system:

```
# PM creates requirements
"As pm, draft initial requirements for {{project_type}}"

# Architect designs system  
"As architect, create system design based on the requirements above"

# Developer implements
"As dev, implement the authentication module from the architecture"
```

## Advanced Features

### 1. Dynamic Context Injection
BMad's structured approach enhances llxprt's context system:
- Project-specific agent behavior
- Workflow-aware prompt resolution
- Automatic tool recommendation

### 2. Cross-Environment Compatibility
The same BMad prompts work across:
- VS Code with llxprt
- Cursor with llxprt
- Claude Code with llxprt
- Any llxprt-compatible system

### 3. Gradual Migration
Existing BMad installations can gradually adopt llxprt:
- Keep existing IDE integrations
- Add llxprt support alongside
- Migrate at your own pace

## Troubleshooting

### Check Installation
```bash
# Verify llxprt prompts were created
ls ~/.llxprt/prompts/tools/bmad/
ls ~/.llxprt/prompts/env/bmad/

# Check BMad configuration
cat ~/.llxprt/prompts/bmad-README.md
```

### Re-install Integration
```bash
# Remove existing llxprt prompts
rm -rf ~/.llxprt/prompts/tools/bmad
rm -rf ~/.llxprt/prompts/env/bmad

# Re-run BMad installation with llxprt
npx bmad-method install --ide llxprt
```

## Benefits

1. **Universal Compatibility**: Works with any llxprt-compatible IDE
2. **Context Awareness**: Leverages llxprt's environment detection
3. **Structured Workflows**: BMad's agile methodology enhanced by llxprt
4. **Cross-Platform**: Same prompts work everywhere llxprt is supported
5. **Future-Proof**: Benefits from both BMad and llxprt ecosystem improvements