import { useParams } from 'react-router-dom';
import DocumentViewer from '../components/DocumentViewer';

interface DocumentTypeMapping {
  [key: string]: string;
}

const DOCUMENT_TYPE_NAMES: DocumentTypeMapping = {
  KP: "Kolkata Center HR Policies",
  HZ: "Hospitalization",
};

export default function ViewDocuments() {
  const { documentType = 'KP' } = useParams<{ documentType: string }>();
  const documentTypeName = DOCUMENT_TYPE_NAMES[documentType] || documentType;

  return (
    <DocumentViewer 
      documentType={documentType} 
      documentTypeName={documentTypeName}
    />
  );
}
