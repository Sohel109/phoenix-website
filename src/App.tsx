import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { BubbleMenu } from './components/layout/BubbleMenu';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { IntroAnimation } from './components/layout/IntroAnimation';
import { AuroraBackground } from './components/layout/AuroraBackground';
import { Chatbot } from './components/features/Chatbot';
import { IOSInstallPrompt } from './components/features/IOSInstallPrompt';
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { ProjectMap } from './pages/ProjectMap';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { Partners } from './pages/Partners';
import { Documents } from './pages/Documents';
import { LegalMentions } from './pages/LegalMentions';
import { Contact } from './pages/Contact';

import { ThemeProvider } from './context/ThemeContext';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [showIntro, setShowIntro] = useState(true);

  // Optional: Check session storage to only show intro once per session if desired
  // useEffect(() => {
  //   const hasSeenIntro = sessionStorage.getItem('phoenix_intro_seen');
  //   if (hasSeenIntro) setShowIntro(false);
  // }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    // sessionStorage.setItem('phoenix_intro_seen', 'true');
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
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </main>
            <Footer />
          </div>
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;
