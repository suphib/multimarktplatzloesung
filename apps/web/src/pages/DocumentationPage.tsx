import { useParams } from 'react-router-dom';
import { DetailLayout } from '../components/templates/DetailLayout';
import { DocumentationPanel } from '../components/organisms/DocumentationPanel';
import { Spinner } from '../components/atoms';
import { useDocumentation } from '../hooks/useDocumentation';

export function DocumentationPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useDocumentation(id ?? '');

  if (isLoading) {
    return (
      <DetailLayout title="Vergabedokumentation" backTo="/search">
        <Spinner size="lg" className="py-12" />
      </DetailLayout>
    );
  }

  if (isError || !data) {
    return (
      <DetailLayout title="Vergabedokumentation" backTo="/search">
        <div className="text-center py-12 text-gray-500">
          <p>Dokumentation nicht gefunden oder noch nicht erstellt.</p>
          <p className="text-sm mt-1">
            Klassifizieren Sie zuerst einen Artikel, um eine Dokumentation zu erzeugen.
          </p>
        </div>
      </DetailLayout>
    );
  }

  return (
    <DetailLayout title="Vergabedokumentation" backTo="/results">
      <DocumentationPanel dokumentation={data} />
    </DetailLayout>
  );
}
