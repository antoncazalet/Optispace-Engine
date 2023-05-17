import get from "lodash.get";
import React, { createContext, useContext } from "react";
import EnglishLang from "../Langs/english.json";
import FrenchLang from "../Langs/french.json";
import { KeysUnion } from "../Typescript/KeyUnion";

const Langs: Record<string, Record<keyof typeof EnglishLang, unknown>> = {
    fr: FrenchLang,
    "en-US": EnglishLang,
};

export interface LangProviderContext {
    translate: (key: KeysUnion<typeof EnglishLang>, locale?: string) => string;
    translateArray: (key: keyof typeof Langs["en-US"]) => string[];

    changeLocale: (locale: string) => void;

    currentLocale: string;
}

const DEFAULT_CONTEXT: LangProviderContext = {
    translate: () => "",
    translateArray: () => [],

    changeLocale: () => {},

    currentLocale: "",
};

export const LangContext = createContext(DEFAULT_CONTEXT);
export const LangConsumer = LangContext.Consumer;
export const useLang = () => useContext(LangContext);

interface Props {
    children: React.ReactNode;
}

const defaultLocale = "en-US";

const LangProvider = (props: Props) => {
    const { children } = props;
    const [currentLang, setCurrentLang] = React.useState(
        localStorage.getItem("lang")
            ? Langs[localStorage.getItem("lang") as keyof typeof Langs]
            : Langs[defaultLocale as keyof typeof Langs]
    );
    const [currentLocale, setCurrentLocale] = React.useState(
        localStorage.getItem("lang") ? (localStorage.getItem("lang") as string) : defaultLocale
    );

    const translate = (key: KeysUnion<typeof EnglishLang>, locale?: string) =>
        locale ? get(Langs[locale], key) : (get(currentLang, key) as string);

    const translateArray = (key: keyof typeof currentLang): string[] => {
        return (currentLang[key] as string[]) ?? (Langs["en-US"][key as keyof typeof Langs["en-US"]] as string[]);
    };

    const changeLocale = (locale: string) => {
        if (Langs[locale]) {
            setCurrentLang(Langs[locale]);
            setCurrentLocale(locale);
            localStorage.setItem("lang", locale);
        }
    };

    const provider = {
        translate,
        translateArray,
        currentLocale: currentLocale,
        changeLocale,
    };

    // Check if every langages have the same key
    for (const key in Langs) {
        const defaultKey = Langs[defaultLocale];
        const currentKey = Langs[key];

        if (key === defaultLocale) continue;

        for (const k in defaultKey) {
            if (!(k in currentKey)) {
                console.warn(`Missing key ${k} in ${key}`);
            }
        }
    }

    return (
        <LangContext.Provider key={currentLocale} value={provider}>
            {children}
        </LangContext.Provider>
    );
};

export default LangProvider;
