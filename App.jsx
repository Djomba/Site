import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import AuthPage from './pages/AuthPage.jsx';
import HomePage from './pages/HomePage.jsx';
import TrainersPage from './pages/TrainersPage.jsx';
import TrainerDetailsPage from './pages/TrainerDetailsPage.jsx';
import { trainers } from './data/trainers.js';

const AUTH_STORAGE_KEY = 'spaceAcademyAuth';

const getInitialRoute = () => {
  const hash = window.location.hash.replace('#', '');
  if (hash.startsWith('/trainers/')) {
    return { page: 'trainerDetails', trainerId: hash.split('/')[2] };
  }

  if (hash === '/trainers') {
    return { page: 'trainers', trainerId: null };
  }

  if (hash === '/home') {
    return { page: 'home', trainerId: null };
  }

  return { page: 'auth', trainerId: null };
};

function App() {
  const [authUser, setAuthUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    } catch {
      return null;
    }
  });
  const [route, setRoute] = useState(getInitialRoute);

  const selectedTrainer = useMemo(
    () => trainers.find((trainer) => trainer.id === route.trainerId),
    [route.trainerId],
  );

  useEffect(() => {
    const handleHashChange = () => setRoute(getInitialRoute());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!authUser && route.page !== 'auth') {
      navigate('auth');
    }

    if (authUser && route.page === 'auth') {
      navigate('home');
    }
  }, [authUser, route.page]);

  const navigate = (page, trainerId = null) => {
    const hashMap = {
      auth: '',
      home: '/home',
      trainers: '/trainers',
      trainerDetails: `/trainers/${trainerId}`,
    };

    window.location.hash = hashMap[page];
    setRoute({ page, trainerId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (user) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    setAuthUser(user);
    navigate('home');
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthUser(null);
    navigate('auth');
  };

  if (!authUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-shell">
      <Header activePage={route.page} onNavigate={navigate} onLogout={handleLogout} user={authUser} />
      <main>
        {route.page === 'home' && <HomePage onNavigate={navigate} />}
        {route.page === 'trainers' && <TrainersPage trainers={trainers} onNavigate={navigate} />}
        {route.page === 'trainerDetails' && selectedTrainer && (
          <TrainerDetailsPage trainer={selectedTrainer} onNavigate={navigate} user={authUser} />
        )}
        {route.page === 'trainerDetails' && !selectedTrainer && (
          <TrainersPage trainers={trainers} onNavigate={navigate} />
        )}
      </main>
    </div>
  );
}

export default App;
