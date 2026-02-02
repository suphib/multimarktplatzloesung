import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      if (opts?.returnObjects) return [];
      if (opts?.count !== undefined) return key;
      return key;
    },
    i18n: {
      language: "de",
      changeLanguage: vi.fn(),
    },
  }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}));
