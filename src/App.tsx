import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import { ScrollToTop } from './components/layout/ScrollToTop';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { IntroAnimation } from './components/layout/IntroAnimation';
import { AuroraBackground } from './components/layout/AuroraBackground';

import { ThemeProvider } from './context/ThemeContext';
import { PlanningProvider, usePlanning } from './context/PlanningContext';

// Home chargée immédiatement (page principale)
import { Home } from './pages/Home';

// Pages secondaires en lazy loading (chargées uniquement à la navigation)
const Projects = lazy(() => import('./pages/Projects').then(m => ({ default: m.Projects })));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail').then(m => ({ default: m.ProjectDetail })));
const ProjectMap = lazy(() => import('./pages/ProjectMap').then(m => ({ default: m.ProjectMap })));
const Events = lazy(() => import('./pages/Events').then(m => ({ default: m.Events })));
const EventDetail = lazy(() => import('./pages/EventDetail').then(m => ({ default: m.EventDetail })));
const Partners = lazy(() => import('./pages/Partners').then(m => ({ default: m.Partners })));
const Documents = lazy(() => import('./pages/Documents').then(m => ({ default: m.Documents })));
const LegalMentions = lazy(() => import('./pages/LegalMentions').then(m => ({ default: m.LegalMentions })));
const Transparency = lazy(() => import('./pages/Transparency').then(m => ({ default: m.Transparency })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

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
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <ThemeProvider>
    <PlanningProvider>
      <Router>
        <ScrollToTop />
        <AnimatePresence>
          {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
        </AnimatePresence>

        {!showIntro && (
          <div className="flex flex-col min-h-screen font-sans animate-in fade-in duration-1000 bg-slate-50 text-slate-900">
            <AuroraBackground />
            <Header />
            {/* Popups désactivés à la demande de l'utilisateur */}
            {/* <IOSInstallPrompt /> */}
            {/* <CrowdfundingBanner /> */}
            <main className="flex-grow">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
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
        )}
      </Router>
    </PlanningProvider>
    </ThemeProvider>
  );
}

export default App;
