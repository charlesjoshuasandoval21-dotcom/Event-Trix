
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (error.response) {
    const { status, data } = error.response;
    if (status === 403) return data?.message || 'You are not allowed to do that.';
    if (status === 429) return 'Too many requests. Please wait a moment and try again.';
    if (status >= 500) return 'The server ran into a problem. Please try again shortly.';
    return data?.message || fallback;
  }
  return 'Cannot reach the server. Check your connection and that the API is running.';
}

export function getFieldErrors(error) {
  const errors = error?.response?.data?.errors;
  if (!errors || error.response.status !== 422) return {};
  return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
}
