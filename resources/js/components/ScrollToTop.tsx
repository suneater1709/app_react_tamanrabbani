import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Automatically scrolls the window to the very top (or to anchor hash)
 * whenever navigation happens in the application.
 */
export default function ScrollToTop() {
    const { pathname, search, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const id = hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                return;
            }
        }
        
        // Instantly scroll window to top for seamless instant focus
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
    }, [pathname, search, hash]);

    return null;
}
