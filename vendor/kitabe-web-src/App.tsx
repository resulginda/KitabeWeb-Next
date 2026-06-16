import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { PlacesProvider } from './contexts/PlacesContext';
import { CategoriesProvider } from './contexts/CategoriesContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { FiltreProvider } from './contexts/FiltreContext';
import { RouteProvider } from './contexts/RouteContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { PhotoSubmissionProvider } from './contexts/PhotoSubmissionContext';
import { RatingProvider } from './contexts/RatingContext';
import { VisitedPlacesProvider } from './contexts/VisitedPlacesContext';
import ScrollToTop from './components/ScrollToTop';
import { AdSenseLoader } from './components/AdSenseLoader';
import { MetaPixelLoader } from './components/MetaPixelLoader';
import { IconFontLoader } from './components/IconFontLoader';
import { MainLayout } from './components/MainLayout';
import { SpaSeoMeta } from './components/SpaSeoMeta';
import { SeoHubRedirect } from './components/SeoHubRedirect';
import { ensureI18n } from './i18n';
import { getInitialAppLanguage } from './utils/detectLocale';
void ensureI18n(getInitialAppLanguage());
import './App.css';
import './styles/kitabe-ui.css';
import './styles/pages-shared.css';
import './styles/page-ads.css';
import './styles/member-pages.css';
import { AuthRequired } from './components/AuthRequired';

import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import ListPage from './pages/ListPage';
import NearbyPage from './pages/NearbyPage';
import TripRoutePage from './pages/TripRoutePage';
import AccountPage from './pages/AccountPage';
import FavoritesPage from './pages/FavoritesPage';
import SuggestionPage from './pages/SuggestionPage';
import MySuggestionsPage from './pages/MySuggestionsPage';
import EditorPanelPage from './pages/EditorPanelPage';
import AdminPanelPage from './pages/AdminPanelPage';
import AdminPushBroadcastPage from './pages/AdminPushBroadcastPage';
import AdminPushLogsPage from './pages/AdminPushLogsPage';
import AdminContactFormsPage from './pages/AdminContactFormsPage';
import AdminHubPage from './pages/AdminHubPage';
import UserManagementPage from './pages/UserManagementPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StatsPage from './pages/StatsPage';
import LegalPage from './pages/LegalPage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import DeleteAccountPage from './pages/DeleteAccountPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotificationPage from './pages/NotificationPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import PhotoApprovalPage from './pages/PhotoApprovalPage';
import RatingApprovalPage from './pages/RatingApprovalPage';
import UserProfilePage from './pages/UserProfilePage';
import LanguageSelectionPage from './pages/LanguageSelectionPage';
import EditSuggestionPage from './pages/EditSuggestionPage';
import LandingPage from './pages/LandingPage';
import './styles/desktop-density.css';

function AppContent() {
  return (
    <>
      <IconFontLoader />
      <AdSenseLoader />
      <MetaPixelLoader />
      <ScrollToTop />
      <SpaSeoMeta />
      <Routes>
        <Route path="/app" element={<LandingPage />} />
        <Route path="/" element={<SeoHubRedirect />} />
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/list" element={<ListPage />} />
          <Route path="/nearby" element={<AuthRequired><NearbyPage /></AuthRequired>} />
          <Route path="/detail/:id" element={<DetailPage />} />
          <Route path="/route" element={<AuthRequired><TripRoutePage /></AuthRequired>} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/suggestion" element={<SuggestionPage />} />
          <Route path="/edit-suggestion/:placeId" element={<EditSuggestionPage />} />
          <Route path="/my-suggestions" element={<MySuggestionsPage />} />
          <Route path="/editor-panel" element={<EditorPanelPage />} />
          <Route path="/admin-panel" element={<AdminPanelPage />} />
          <Route path="/admin-hub" element={<AdminHubPage />} />
          <Route path="/admin-push" element={<AdminPushBroadcastPage />} />
          <Route path="/admin-push-logs" element={<AdminPushLogsPage />} />
          <Route path="/admin-contact-forms" element={<AdminContactFormsPage />} />
          <Route path="/user-management" element={<UserManagementPage />} />
          <Route path="/account-settings" element={<AccountSettingsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/hakkimizda" element={<AboutPage />} />
          <Route path="/gizlilik-politikasi" element={<PrivacyPolicyPage />} />
          <Route path="/kullanim-sartlari" element={<TermsPage />} />
          <Route path="/iletisim" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/delete-account" element={<DeleteAccountPage />} />
          <Route path="/hesap-silme" element={<DeleteAccountPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/notification-settings" element={<NotificationSettingsPage />} />
          <Route path="/photo-approval" element={<PhotoApprovalPage />} />
          <Route path="/rating-approval" element={<RatingApprovalPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/language-selection" element={<LanguageSelectionPage />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <LanguageProvider>
          <CategoriesProvider>
            <PlacesProvider>
              <FavoritesProvider>
              <FiltreProvider>
                <RouteProvider>
                  <NotificationProvider>
                    <PhotoSubmissionProvider>
                      <RatingProvider>
                        <VisitedPlacesProvider>
                          <Router>
                            <AppContent />
                          </Router>
                        </VisitedPlacesProvider>
                      </RatingProvider>
                    </PhotoSubmissionProvider>
                  </NotificationProvider>
                </RouteProvider>
              </FiltreProvider>
              </FavoritesProvider>
            </PlacesProvider>
          </CategoriesProvider>
        </LanguageProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
