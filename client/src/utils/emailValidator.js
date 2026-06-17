const ALLOWED_DOMAINS = new Set([
    'gmail.com',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'yahoo.com',
    'icloud.com',
    'me.com',
    'mac.com',
]);

/**
 * Validates that the email uses one of the allowed domains.
 * @param {string} email
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateEmailDomain(email) {
    const lower = email.toLowerCase().trim();
    const atIdx = lower.lastIndexOf('@');

    if (atIdx === -1) {
        return { valid: false, error: 'Invalid email address.' };
    }

    const domain = lower.slice(atIdx + 1);

    if (!ALLOWED_DOMAINS.has(domain)) {
        return {
            valid: false,
            error: `Only the following email providers are accepted: Gmail, Outlook, Hotmail, Live, Yahoo, iCloud, Me, or Mac.`,
        };
    }

    return { valid: true, error: null };
}
