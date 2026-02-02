import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DetailLayout } from '../components/templates/DetailLayout';
import { DocumentationPanel } from '../components/organisms/DocumentationPanel';
import { Spinner } from '../components/atoms';
import { useDocumentation } from '../hooks/useDocumentation';

export function DocumentationPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { data, isLoading, isError } = useDocumentation(id ?? '');

  if (isLoading) {
    return (
      <DetailLayout title={t('documentation.title')} backTo={undefined}>
        <Spinner size="lg" className="py-12" />
      </DetailLayout>
    );
  }

  if (isError || !data) {
    return (
      <DetailLayout title={t('documentation.title')} backTo={undefined}>
        <div className="text-center py-12 text-gray-500">
          <p>{t('documentation.notFound')}</p>
          <p className="text-sm mt-1">
            {t('documentation.notFoundHint')}
          </p>
        </div>
      </DetailLayout>
    );
  }

  return (
    <DetailLayout title={t('documentation.title')} backTo={undefined}>
      <DocumentationPanel dokumentation={data} />
    </DetailLayout>
  );
}
