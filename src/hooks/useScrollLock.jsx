// hooks/useScrollLock.js
import { useEffect } from "react";

const useScrollLock = (isLocked, onUnlock) => {
    useEffect(() => {
        if (isLocked) {
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";
        } else {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        }
        return () => {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        };
    }, [isLocked]);

    // lg breakpoint = 1024px, বড় screen এ গেলে unlock করো
    useEffect(() => {
        if (!isLocked || !onUnlock) return;

        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                onUnlock();
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isLocked, onUnlock]);
};

export default useScrollLock;