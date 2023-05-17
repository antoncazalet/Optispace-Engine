import * as React from "react";
import { useState } from "react";
import uniqueId from "lodash.uniqueid";

export interface IKeyboardShotcutContext {
    subscribe: (key: string, options: Partial<Options>, callback: (event: KeyboardEvent) => void) => () => void;
    unsubscribe: (key: string, callback: (event: KeyboardEvent) => void) => void;
}

const DEFAULT_CONTEXT: IKeyboardShotcutContext = {
    subscribe: () => () => {},
    unsubscribe: () => {},
};

export const KeyboardShotcutContext = React.createContext(DEFAULT_CONTEXT);
export const useKeyboardShotcut = () => React.useContext(KeyboardShotcutContext);

interface Options {
    ctrlKey: boolean;
}

interface Props {
    children: React.ReactNode;
}

interface Subscription {
    uuid: string;
    key: string;
    options: Partial<Options>;
    callback: (event: KeyboardEvent) => void;
}

export const KeyboardShortcutsProvider = ({ children }: Props) => {
    const [_subscriptions, _setSubscriptions] = useState<Subscription[]>([]);
    const subscriptionRef = React.useRef(_subscriptions);

    const getSubscriptions = () => {
        return subscriptionRef.current;
    };

    const setSubscriptions = (data: Subscription[]) => {
        subscriptionRef.current = data;
        _setSubscriptions(data);
    };

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const subscription = getSubscriptions().filter((s) => s.key === event.code);

            if (subscription) {
                subscription.forEach((s) => {
                    for (const key in s.options) {
                        if (s.options[key as keyof Options] !== event[key as keyof KeyboardEvent]) {
                            return;
                        }
                    }

                    s.callback(event);
                });
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const subscribe = (
        key: string,
        options: Partial<Options>,
        callback: (event: KeyboardEvent) => void
    ): (() => void) => {
        const id = uniqueId("event_shortcuts_");

        setSubscriptions([...getSubscriptions(), { uuid: id, key, callback, options: { ...options } }]);

        return () => {
            unsubscribe(key, callback);
        };
    };

    const unsubscribe = (key: string, callback: (event: KeyboardEvent) => void) => {
        setSubscriptions(getSubscriptions().filter((s) => s.key !== key && s.callback !== callback));
    };

    const provider: IKeyboardShotcutContext = {
        subscribe,
        unsubscribe,
    };

    return <KeyboardShotcutContext.Provider value={provider}>{children}</KeyboardShotcutContext.Provider>;
};
