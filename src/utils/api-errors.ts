export function parseValidationErrors(error: unknown, fallbackMessage: string): {
  general: string[];
  fields: Record<string, string>;
} {
  const result = {
    general: [] as string[],
    fields: {} as Record<string, string>,
  };

  const responseData = (error as { response?: { data?: { errors?: unknown; message?: string } } })?.response?.data;
  const rawErrors = responseData?.errors;

  if (Array.isArray(rawErrors)) {
    rawErrors.forEach((entry) => {
      const item = entry as {
        property?: string;
        constraints?: string[] | Record<string, string>;
      };

      const constraints = Array.isArray(item.constraints)
        ? item.constraints
        : Object.values(item.constraints ?? {});

      if (item.property && constraints.length > 0) {
        result.fields[item.property] = String(constraints[0]);
      }
    });
  }

  if (Object.keys(result.fields).length === 0) {
    result.general.push(responseData?.message || fallbackMessage);
  }

  return result;
}
