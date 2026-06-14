import { Navigate, useParams } from 'react-router-dom';

export default function EditSuggestionPage() {
  const { placeId } = useParams<{ placeId: string }>();
  if (!placeId) return <Navigate to="/suggestion" replace />;
  return <Navigate to={`/suggestion?placeId=${encodeURIComponent(placeId)}`} replace />;
}

