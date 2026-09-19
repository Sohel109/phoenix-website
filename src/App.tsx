import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import { ScrollToTop } from './components/layout/ScrollToTop';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AuroraBackground } from './components/layout/AuroraBackground';

import { ThemeProvider } from './context/ThemeContext';
import { PlanningProvider, usePlanning } from './context/PlanningContext';

// Pages publiques chargées immédiatement pour navigation 100% instantanée (sans flash blanc ni spinner)
import { Home } from './pages/Home';
import { Association } from './pages/Association';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { Partners } from './pages/Partners';
import { Documents } from './pages/Documents';
import { LegalMentions } from './pages/LegalMentions';
import { Transparency } from './pages/Transparency';
import { Contact } from './pages/Contact';
import { NotFound } from './pages/NotFound';

// Pages lourdes en lazy (code-splitting)
const ProjectMap = lazy(() => import('./pages/ProjectMap').then(m => ({ default: m.ProjectMap })));
const VerifyAttestation = lazy(() => import('./pages/VerifyAttestation').then(m => ({ default: m.VerifyAttestation })));


// Planning module (lazy)
const PlanningLogin = lazy(() => import('./pages/planning/PlanningLogin').then(m => ({ default: m.PlanningLogin })));
const PlanningDashboard = lazy(() => import('./pages/planning/PlanningDashboard').then(m => ({ default: m.PlanningDashboard })));
const PlanningDisponibilites = lazy(() => import('./pages/planning/PlanningDisponibilites').then(m => ({ default: m.PlanningDisponibilites })));
const PlanningHoraire = lazy(() => import('./pages/planning/PlanningHoraire').then(m => ({ default: m.PlanningHoraire })));
const PlanningCompte = lazy(() => import('./pages/planning/PlanningCompte').then(m => ({ default: m.PlanningCompte })));
const PlanningValidation = lazy(() => import('./pages/planning/PlanningValidation').then(m => ({ default: m.PlanningValidation })));
const PlanningRecap = lazy(() => import('./pages/planning/PlanningRecap').then(m => ({ default: m.PlanningRecap })));
const PlanningEventValidation = lazy(() => import('./pages/planning/PlanningEventValidation').then(m => ({ default: m.PlanningEventValidation })));
const PlanningMesEvenements = lazy(() => import('./pages/planning/PlanningMesEvenements').then(m => ({ default: m.PlanningMesEvenements })));
const PlanningNotifications = lazy(() => import('./pages/planning/PlanningNotifications').then(m => ({ default: m.PlanningNotifications })));

// Loader minimaliste pendant le chargement d'une page
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
    </div>
  );
}

// Planning guard: redirects to /planning/login if not authenticated
function PlanningGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = usePlanning();
  const location = useLocation();
  if (!currentUser) {
    return <Navigate to="/planning/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
    <PlanningProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen font-sans bg-[#FFFBF4] bg-bird-pattern">
          <AuroraBackground />
          <Header />
            {/* Popups désactivés à la demande de l'utilisateur */}
            {/* <IOSInstallPrompt /> */}
            {/* <CrowdfundingBanner /> */}
            <main className="flex-grow">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/association" element={<Association />} />
                  <Route path="/projets" element={<Projects />} />
                  <Route path="/projets/:id" element={<ProjectDetail />} />
                  <Route path="/carte-des-projets" element={<ProjectMap />} />
                  <Route path="/evenements" element={<Events />} />
                  <Route path="/evenements/:id" element={<EventDetail />} />
                  <Route path="/partenaires" element={<Partners />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/mentions-legales" element={<LegalMentions />} />
                  <Route path="/transparence" element={<Transparency />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/verifier" element={<VerifyAttestation />} />
                  <Route path="/attestation/verifier" element={<VerifyAttestation />} />
                  {/* Alias / Redirections Association */}
                  <Route path="/qui-sommes-nous" element={<Navigate to="/association" replace />} />
                  <Route path="/histoire" element={<Navigate to="/association" replace />} />
                  <Route path="/valeurs" element={<Navigate to="/association" replace />} />
                  <Route path="/organigramme" element={<Navigate to="/association" replace />} />
                  {/* Redirections SEO / Anciens liens indexés (ex: Wix) */}
                  <Route path="/massa-13" element={<Navigate to="/projets/massa-13" replace />} />
                  <Route path="/massa" element={<Navigate to="/projets/massa-13" replace />} />
                  <Route path="/massa13" element={<Navigate to="/projets/massa-13" replace />} />
                  <Route path="/acse" element={<Navigate to="/projets/acse" replace />} />
                  <Route path="/a-chacun-son-excellence" element={<Navigate to="/projets/acse" replace />} />
                  <Route path="/saint-gabriel" element={<Navigate to="/projets/saint-gabriel" replace />} />
                  <Route path="/st-gabriel" element={<Navigate to="/projets/saint-gabriel" replace />} />
                  <Route path="/apprentis-d-auteuil" element={<Navigate to="/projets/apprentis-d-auteuil" replace />} />
                  <Route path="/apprentis-dauteuil" element={<Navigate to="/projets/apprentis-d-auteuil" replace />} />
                  <Route path="/apprentis" element={<Navigate to="/projets/apprentis-d-auteuil" replace />} />
                  <Route path="/arthur-rimbaud" element={<Navigate to="/projets/arthur-rimbaud" replace />} />
                  <Route path="/rimbaud" element={<Navigate to="/projets/arthur-rimbaud" replace />} />
                  <Route path="/izzo" element={<Navigate to="/projets/izzo" replace />} />
                  <Route path="/jean-claude-izzo" element={<Navigate to="/projets/izzo" replace />} />
                  <Route path="/jules-ferry" element={<Navigate to="/projets/jules-ferry" replace />} />
                  <Route path="/roy-despagne" element={<Navigate to="/projets/roy-despagne" replace />} />
                  <Route path="/roy-d-espagne" element={<Navigate to="/projets/roy-despagne" replace />} />
                  <Route path="/sup-d-om" element={<Navigate to="/projets/sup-d-om" replace />} />
                  <Route path="/supdom" element={<Navigate to="/projets/sup-d-om" replace />} />
                  <Route path="/massalia" element={<Navigate to="/projets" replace />} />
                  <Route path="/simonu" element={<Navigate to="/evenements/simonu" replace />} />
                  <Route path="/simonu-edc" element={<Navigate to="/evenements/simonu" replace />} />
                  <Route path="/olympiades" element={<Navigate to="/evenements/olympiades" replace />} />
                  <Route path="/les-olympiades" element={<Navigate to="/evenements/olympiades" replace />} />
                  <Route path="/jedc" element={<Navigate to="/evenements/jedc" replace />} />
                  <Route path="/journee-mec" element={<Navigate to="/evenements/jedc" replace />} />
                  <Route path="/journee-egalite-des-chances" element={<Navigate to="/evenements/jedc" replace />} />
                  <Route path="/donner" element={<Navigate to="/transparence" replace />} />
                  <Route path="/don" element={<Navigate to="/transparence" replace />} />
                  <Route path="/dons" element={<Navigate to="/transparence" replace />} />
                  <Route path="/soutenir" element={<Navigate to="/transparence" replace />} />
                  <Route path="/plan" element={<Navigate to="/carte-des-projets" replace />} />
                  <Route path="/carte" element={<Navigate to="/carte-des-projets" replace />} />
                  <Route path="/devenir-partenaire" element={<Navigate to="/contact" replace />} />

                  {/* Planning module */}
                  <Route path="/planning/login" element={<PlanningLogin />} />
                  <Route path="/planning" element={<PlanningGuard><PlanningDashboard /></PlanningGuard>} />
                  <Route path="/planning/disponibilites" element={<PlanningGuard><PlanningDisponibilites /></PlanningGuard>} />
                  <Route path="/planning/horaire" element={<PlanningGuard><PlanningHoraire /></PlanningGuard>} />
                  <Route path="/planning/compte" element={<PlanningGuard><PlanningCompte /></PlanningGuard>} />
                  <Route path="/planning/validation" element={<PlanningGuard><PlanningValidation /></PlanningGuard>} />
                  <Route path="/planning/recap" element={<PlanningGuard><PlanningRecap /></PlanningGuard>} />
                  <Route path="/planning/events" element={<PlanningGuard><PlanningEventValidation /></PlanningGuard>} />
                  <Route path="/planning/mes-evenements" element={<PlanningGuard><PlanningMesEvenements /></PlanningGuard>} />
                  <Route path="/planning/notifications" element={<PlanningGuard><PlanningNotifications /></PlanningGuard>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
      </Router>
    </PlanningProvider>
    </ThemeProvider>
  );
}

export default App;
