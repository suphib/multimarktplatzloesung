import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
      {t('footer.copyright')} ·{' '}
      <Link to="/impressum" className="hover:text-gray-700 underline-offset-2 hover:underline">
        {t('footer.imprint')}
      </Link>{' '}
      ·{' '}
      <Link to="/datenschutz" className="hover:text-gray-700 underline-offset-2 hover:underline">
        {t('footer.privacy')}
      </Link>{' '}
      · <span className="text-gray-400">{t('footer.prototype')}</span>
    </footer>
  );
}
