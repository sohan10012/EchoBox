import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { RoomFeedbackPage } from '@/pages/RoomFeedbackPage';
import { PublicFeedbackPage } from '@/pages/PublicFeedbackPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const AppContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#fbfbfb] text-neutral-900 dark:bg-[#090909] dark:text-[#ededed] transition-colors selection:bg-brand-500/20 selection:text-brand-400">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/room/:roomId" element={<RoomFeedbackPage />} />
          <Route path="/room/:roomId/feedback" element={<RoomFeedbackPage />} />
          <Route path="/room/:roomId" element={<PublicFeedbackPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Toaster
        position="top-right"
        theme={theme}
        richColors
        closeButton
        duration={3500}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
