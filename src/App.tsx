import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import { ScrollToTop } from './components/layout/ScrollToTop';
import { BubbleMenu } from './components/layout/BubbleMenu';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { IntroAnimation } from './components/layout/IntroAnimation';
import { AuroraBackground } from './components/layout/AuroraBackground';
import { Chatbot } from './components/features/Chatbot';
import { IOSInstallPrompt } from './components/features/IOSInstallPrompt';
import { ThemeProvider } from './context/ThemeContext';

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

// Loader minimaliste pendant le chargement d'une page
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
    </div>
  );
}

function App() {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <AnimatePresence>
          {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
        </AnimatePresence>

        {!showIntro && (
          <div className="flex flex-col min-h-screen font-sans animate-in fade-in duration-1000">
            <AuroraBackground />
            <Header />
            <BubbleMenu />
            <Chatbot />
            <IOSInstallPrompt />
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
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;
