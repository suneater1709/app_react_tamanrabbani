/**
 * Utility to format and sanitize error messages for users.
 * Ensures no technical/database errors leak and always prefixes with a polite 'Maaf, ...'.
 */
export function formatFriendlyErrorMessage(
    err: any,
    fallback: string = 'Maaf, pendaftaran belum dapat diproses. Silakan coba beberapa saat lagi.'
): string {
    if (!err) return fallback;

    // 1. Network / connection lost
    if (!err.response) {
        return 'Maaf, koneksi ke server pendaftaran terputus. Mohon periksa jaringan internet Anda dan coba lagi.';
    }

    const status = err.response.status;
    const rawMessage = err.response.data?.message;

    // 2. HTTP 503 (Service Unavailable)
    if (status === 503) {
        return 'Maaf, sistem pendaftaran sedang melayani antrean yang cukup padat. Mohon tunggu 1-2 menit lalu coba kirim kembali.';
    }

    // 3. Check for technical / database leak strings
    if (typeof rawMessage === 'string') {
        const isTechnicalOrDbLeak = /SQLSTATE|Too many connections|1040|Connection:|select count|table `|database|driver|pdo|QueryException|PDOException|Server Error|syntax error/i.test(rawMessage);
        
        if (isTechnicalOrDbLeak) {
            return 'Maaf, antrean koneksi server sedang sangat padat. Mohon tunggu 1-2 menit lalu coba kirim kembali formulir Anda.';
        }

        // Handle validation errors or user-correctable messages
        const trimmed = rawMessage.trim();
        if (trimmed.length > 0) {
            if (/^maaf/i.test(trimmed)) {
                return trimmed;
            }
            return `Maaf, ${trimmed.charAt(0).toLowerCase() + trimmed.slice(1)}`;
        }
    }

    // 4. Check for nested validation errors (e.g. 422 errors object)
    if (err.response.data?.errors && typeof err.response.data.errors === 'object') {
        const errorKeys = Object.keys(err.response.data.errors);
        if (errorKeys.length > 0) {
            const firstError = err.response.data.errors[errorKeys[0]];
            const firstMsg = Array.isArray(firstError) ? firstError[0] : firstError;
            if (typeof firstMsg === 'string' && firstMsg.trim()) {
                const trimmed = firstMsg.trim();
                if (/^maaf/i.test(trimmed)) {
                    return trimmed;
                }
                return `Maaf, ${trimmed.charAt(0).toLowerCase() + trimmed.slice(1)}`;
            }
        }
    }

    // 5. HTTP 500 fallback
    if (status >= 500) {
        return 'Maaf, server sedang mengalami kendala koneksi. Silakan tunggu sebentar dan coba lagi.';
    }

    return fallback;
}
