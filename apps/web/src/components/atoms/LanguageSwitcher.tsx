import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('en') ? 'en' : 'de';

  return (
    <div className="flex items-center text-sm font-medium">
      <button
        onClick={() => i18n.changeLanguage('de')}
        className={`px-1.5 py-0.5 rounded-l ${
          current === 'de' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
      >
        DE
      </button>
      <span className="text-gray-300 dark:text-gray-600">|</span>
      <button
        onClick={() => i18n.changeLanguage('en')}
        className={`px-1.5 py-0.5 rounded-r ${
          current === 'en' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
      >
        EN
      </button>
    </div>
  );
}
