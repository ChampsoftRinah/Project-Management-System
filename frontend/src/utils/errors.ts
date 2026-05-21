export function getFriendlyErrorMessage(error: any): string {
  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  const apiMessage = error?.response?.data?.error?.message || error?.message || '';
  if (typeof apiMessage !== 'string' || apiMessage.trim() === '') {
    return 'Something went wrong. Please try again.';
  }

  const lowerMessage = apiMessage.toLowerCase();
  if (
    lowerMessage.includes('column') ||
    lowerMessage.includes('sql') ||
    lowerMessage.includes('constraint')
  ) {
    return 'Something went wrong. Please try again.';
  }

  return apiMessage;
}
