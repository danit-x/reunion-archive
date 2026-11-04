import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import SiteLayout from './layouts/SiteLayout';
import Home from './pages/Home';

const Story = lazy(() => import('./pages/Story'));
const EventInfo = lazy(() => import('./pages/EventInfo'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Memories = lazy(() => import('./pages/Memories'));
const Attendees = lazy(() => import('./pages/Attendees'));
const Announcements = lazy(() => import('./pages/Announcements'));
const AnnouncementDetail = lazy(() => import('./pages/AnnouncementDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const Register = lazy(() => import('./pages/Register'));
const Confirmation = lazy(() => import('./pages/Confirmation'));
const Login = lazy(() => import('./pages/account/Login'));
const Signup = lazy(() => import('./pages/account/Signup'));
const Account = lazy(() => import('./pages/account/Account'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminApp = lazy(() => import('./pages/admin/AdminApp'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) { el.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function PageLoader() {
  return <div className="page-loader" role="status" aria-label="Loading page"><span className="spinner" /></div>;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<Home />} />
            <Route path="story" element={<Story />} />
            <Route path="event" element={<EventInfo />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="memories" element={<Memories />} />
            <Route path="attendees" element={<Attendees />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="announcements/:id" element={<AnnouncementDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="register" element={<Register />} />
            <Route path="register/confirmed/:id" element={<Confirmation />} />
            <Route path="ticket/:id" element={<Confirmation />} />
            <Route path="account/login" element={<Login />} />
            <Route path="account/signup" element={<Signup />} />
            <Route path="account" element={<Account />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    </>
  );
}
