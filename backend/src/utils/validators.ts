export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateStatus(status: string): boolean {
  const validStatuses = [
    'Open',
    'Ready for Development',
    'In Development',
    'Development Completed',
    'Ready for QA',
    'In QA',
    'QA Passed',
    'QA Failed',
  ];
  return validStatuses.includes(status);
}

export function validatePriority(priority: string): boolean {
  const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
  return validPriorities.includes(priority);
}

export function validateRole(role: string): boolean {
  const validRoles = [
    'Developer',
    'QA Engineer',
    'Project Manager',
    'Business Analyst',
    'Tenant Admin',
  ];
  return validRoles.includes(role);
}
