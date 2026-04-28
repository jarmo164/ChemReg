export type ApiClientError = Error & {
  status?: number;
  validationErrors?: string[];
};

function createApiClientError(message: string, status?: number, validationErrors?: string[]): ApiClientError {
  const error = new Error(message) as ApiClientError;
  error.status = status;
  if (validationErrors && validationErrors.length > 0) {
    error.validationErrors = validationErrors;
  }
  return error;
}

function normalizeMessage(status: number, message: string, fallback: string): string {
  if (status === 503) {
    return 'ChemReg teenus või andmebaas ei vasta praegu. Proovi natuke aja pärast uuesti.';
  }

  if (status >= 500) {
    return 'ChemReg backend andis vea. Proovi uuesti või kontrolli serveri seisu.';
  }

  return message || fallback;
}

export async function toApiError(response: Response, fallback = 'Request failed'): Promise<ApiClientError> {
  let message = fallback;
  let validationErrors: string[] | undefined;

  try {
    const errorData = (await response.json()) as {
      message?: string;
      error?: string;
      validationErrors?: string[];
    };
    validationErrors = errorData.validationErrors;
    message = normalizeMessage(response.status, errorData.message || errorData.error || fallback, fallback);
  } catch {
    message = normalizeMessage(response.status, response.statusText || fallback, fallback);
  }

  return createApiClientError(message, response.status, validationErrors);
}

export function toNetworkError(cause: unknown, fallback = 'Request failed'): ApiClientError {
  if (cause instanceof Error && 'status' in cause) {
    return cause as ApiClientError;
  }

  return createApiClientError(
    'ChemReg API-ga ei saadud ühendust. Kontrolli, kas backend, andmebaas või võrguühendus on maas.',
    503
  );
}

export function validationErrorsToFieldMap<TField extends string>(
  validationErrors: string[] | undefined,
  allowedFields: readonly TField[]
): Partial<Record<TField, string>> {
  const result: Partial<Record<TField, string>> = {};

  if (!validationErrors) {
    return result;
  }

  const allowed = new Set<string>(allowedFields);

  for (const entry of validationErrors) {
    const [rawField, ...rest] = entry.split(':');
    const field = rawField.trim();
    const message = rest.join(':').trim();
    if (!allowed.has(field) || !message) {
      continue;
    }
    result[field as TField] = message;
  }

  return result;
}
