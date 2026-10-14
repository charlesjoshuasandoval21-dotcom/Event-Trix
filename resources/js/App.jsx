import { Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import { GuestRoute, ProtectedRoute } from './routes/guards';
import ScrollToTop from './routes/ScrollToTop';

import Home from './pages/public/Home';
import Explore from './pages/public/Explore';
import EventDetails from './pages/public/EventDetails';
import About from './pages/public/About';
import NotFound from './pages/public/NotFound';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Settings from './pages/Settings';

import OrganizerOverview from './pages/organizer/Overview';
import ManageEvents from './pages/organizer/ManageEvents';
import EventCreate from './pages/organizer/EventCreate';
import EventEdit from './pages/organizer/EventEdit';
import EventView from './pages/organizer/EventView';
import Registrations from './pages/organizer/Registrations';

import StudentOverview from './pages/student/Overview';
import MyRegistrations from './pages/student/MyRegistrations';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="events" element={<Explore />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="about" element={<About />} />
        </Route>

        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route path="organizer" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<OrganizerOverview />} />
            <Route path="events" element={<ManageEvents />} />
            <Route path="events/new" element={<EventCreate />} />
            <Route path="events/:id" element={<EventView />} />
            <Route path="events/:id/edit" element={<EventEdit />} />
            <Route path="registrations" element={<Registrations />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="student" element={<ProtectedRoute role="student" />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<StudentOverview />} />
            <Route path="registrations" element={<MyRegistrations />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
