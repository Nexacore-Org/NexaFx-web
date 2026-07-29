export function stripInvisibleChars(str: string): string {
    return str.replace(/[\u200B-\u200D\uFEFF]/g, '');
}

export function sanitizeInput(value: unknown, key?: string): unknown {
    if (typeof value === 'string') {
        let cleaned = stripInvisibleChars(value).trim();
        if (key && key.toLowerCase().includes('email')) {
            cleaned = cleaned.toLowerCase();
        }
        return cleaned;
    }
    if (Array.isArray(value)) {
        return value.map(v => sanitizeInput(v, key));
    }
    if (value !== null && typeof value === 'object') {
        const result: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) {
            result[k] = sanitizeInput(v, k);
        }
        return result;
    }
    return value;
}
