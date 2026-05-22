# 🤝 Contributing to StudyFlow

Thank you for your interest in contributing to StudyFlow! This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:

- Age, body size, disability, ethnicity, gender identity and expression
- Level of experience, education, socio-economic status
- Nationality, personal appearance, race, religion, or sexual identity and orientation

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A Supabase account
- A Google Gemini API key
- Basic knowledge of Next.js, React, and TypeScript

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/your-username/studyflow.git
cd studyflow
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/original-owner/studyflow.git
```

### Install Dependencies

```bash
npm install
```

### Set Up Environment

1. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

2. Fill in your credentials in `.env.local`

3. Set up the database:
   - Create a Supabase project
   - Run the SQL schema from `docs/BACKEND.md`

### Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation changes
- `refactor/` — Code refactoring
- `test/` — Adding tests
- `chore/` — Maintenance tasks

### 2. Make Changes

- Write clean, readable code
- Follow the coding standards (see below)
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Run type check
npm run type-check

# Run tests
npm test

# Build to verify
npm run build
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add task priority filter"
```

See [Commit Guidelines](#commit-guidelines) below.

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use type inference where appropriate

```typescript
// ✅ Good
interface Task {
  id: string;
  title: string;
  due_date: string;
}

function createTask(data: Omit<Task, 'id'>): Task {
  return { id: generateId(), ...data };
}

// ❌ Bad
function createTask(data: any): any {
  return { id: generateId(), ...data };
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types

```tsx
// ✅ Good
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}

// ❌ Bad
export function Button(props: any) {
  return <button {...props} />;
}
```

### File Organization

```
app/
├── (routes)/
│   ├── dashboard/
│   │   └── page.tsx
│   └── chat/
│       └── page.tsx
├── api/
│   └── parse-task/
│       └── route.ts
└── layout.tsx

components/
├── ui/              # Reusable UI components
│   ├── Button.tsx
│   └── Input.tsx
└── features/        # Feature-specific components
    ├── TaskCard.tsx
    └── CalendarGrid.tsx

lib/
├── supabase.ts      # Client utilities
├── gemini.ts        # AI utilities
└── utils.ts         # Helper functions

hooks/
├── useNotifications.ts
└── useTasks.ts

types/
├── database.ts
└── api.ts
```

### Naming Conventions

- **Components:** PascalCase (`TaskCard.tsx`)
- **Hooks:** camelCase with `use` prefix (`useNotifications.ts`)
- **Utilities:** camelCase (`formatDate.ts`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_TASKS`)
- **Types/Interfaces:** PascalCase (`TaskStatus`)

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in objects/arrays
- Use semicolons
- Max line length: 100 characters

```typescript
// ✅ Good
const task = {
  id: '1',
  title: 'Math homework',
  status: 'pending',
};

// ❌ Bad
const task = {
  id: "1",
  title: "Math homework",
  status: "pending"
}
```

### Comments

- Write self-documenting code
- Add comments for complex logic
- Use JSDoc for functions

```typescript
/**
 * Parses natural language input and extracts tasks using Gemini AI
 * @param message - User's natural language input
 * @param currentDate - Reference date for relative date parsing
 * @returns Array of parsed tasks
 */
export async function parseTasksFromMessage(
  message: string,
  currentDate: Date = new Date()
): Promise<ParsedTask[]> {
  // Implementation
}
```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `style` — Code style changes (formatting, etc.)
- `refactor` — Code refactoring
- `test` — Adding or updating tests
- `chore` — Maintenance tasks
- `perf` — Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(chat): add task priority detection"

# Bug fix
git commit -m "fix(calendar): correct date calculation for leap years"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Breaking change
git commit -m "feat(api): change task status enum values

BREAKING CHANGE: Task status values changed from 'todo/done' to 'pending/completed'"
```

### Commit Message Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- First line should be 50 characters or less
- Reference issues and PRs when applicable

## 🔀 Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Builds successfully

### PR Title

Follow the same format as commit messages:

```
feat(chat): add voice input support
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] Added tests
- [ ] Tests pass
- [ ] No console errors
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited

## 🧪 Testing

### Unit Tests

```bash
npm test
```

Write tests for:
- Utility functions
- Custom hooks
- API routes
- Complex components

```typescript
// Example: __tests__/lib/utils.test.ts
import { formatDate } from '@/lib/utils';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2025-05-21');
    expect(formatDate(date)).toBe('May 21, 2025');
  });
});
```

### Integration Tests

Test user flows:

```typescript
// Example: __tests__/features/task-creation.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ChatPage from '@/app/chat/page';

describe('Task Creation Flow', () => {
  it('creates task from chat input', async () => {
    render(<ChatPage />);
    
    const input = screen.getByPlaceholderText('Type your tasks...');
    fireEvent.change(input, { value: 'Math homework due tomorrow' });
    fireEvent.submit(input);
    
    expect(await screen.findByText(/Added 1 task/)).toBeInTheDocument();
  });
});
```

### E2E Tests (Optional)

Use Playwright for end-to-end testing:

```bash
npm install -D @playwright/test
npx playwright test
```

## 📚 Documentation

### When to Update Docs

- Adding new features
- Changing APIs
- Updating dependencies
- Fixing bugs that affect usage

### Documentation Structure

- `README.md` — Project overview
- `docs/FRONTEND.md` — Frontend guide
- `docs/BACKEND.md` — Backend guide
- `docs/PWA.md` — PWA guide
- `docs/UI.md` — UI/UX guide
- `docs/AI.md` — AI integration
- `docs/NOTIFICATIONS.md` — Notifications
- `docs/DEPLOYMENT.md` — Deployment
- `docs/CONTRIBUTING.md` — This file

### Code Comments

```typescript
// ✅ Good: Explains WHY
// Use exponential backoff to avoid overwhelming the API
await retry(fetchData, { maxAttempts: 3, backoff: 'exponential' });

// ❌ Bad: Explains WHAT (obvious from code)
// Call the retry function
await retry(fetchData);
```

## 🎨 Design Contributions

### UI/UX Improvements

- Follow the design system in `docs/UI.md`
- Maintain consistency with existing components
- Ensure accessibility (WCAG 2.1 AA)
- Test on multiple devices and browsers

### Adding Icons

- Use [Lucide Icons](https://lucide.dev/)
- Keep icon size consistent (20-24px)
- Add proper aria-labels

## 🐛 Bug Reports

### Before Reporting

- Check if the bug has already been reported
- Try to reproduce on the latest version
- Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
Clear description of what you want to happen

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Mockups, examples, etc.
```

## 🏆 Recognition

Contributors will be:
- Listed in `CONTRIBUTORS.md`
- Credited in release notes
- Mentioned in the README (for significant contributions)

## 📞 Getting Help

- **Questions:** Open a GitHub Discussion
- **Bugs:** Open a GitHub Issue
- **Security:** Email security@studyflow.app (if applicable)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to StudyFlow! 🎉
