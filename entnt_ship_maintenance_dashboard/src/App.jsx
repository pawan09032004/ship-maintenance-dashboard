import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ShipsProvider } from './contexts/ShipsContext';
import { ComponentsProvider } from './contexts/ComponentsContext';
import { JobsProvider } from './contexts/JobsContext';
import { CalendarProvider } from './contexts/CalendarContext';
import ProtectedRoute from './components/Authentication/ProtectedRoute';
import Login from './components/Authentication/Login';
import Register from './components/Authentication/Register';
import { Dashboard } from './components/Dashboard';
import ShipList from './components/Ships/ShipList';
import ShipForm from './components/Ships/ShipForm';
import ShipDetails from './components/Ships/ShipDetails';
import ComponentList from './components/Components/ComponentList';
import ComponentForm from './components/Components/ComponentForm';
import ComponentDetails from './components/Components/ComponentDetails';
import JobList from './components/Jobs/JobList';
import JobForm from './components/Jobs/JobForm';
import JobDetails from './components/Jobs/JobDetails';
import Calendar from './components/Calendar/Calendar';
import { Layout } from './components/navigation';
import NotificationDemo from './components/Notifications/NotificationDemo';
import { useEffect } from 'react';
import { initializeLocalStorage } from './utils/localStorageUtils';

function App() {
  useEffect(() => {
    initializeLocalStorage();
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ShipsProvider>
          <ComponentsProvider>
            <JobsProvider>
              <CalendarProvider>
                <Toaster 
                  position="top-right" 
                  toastOptions={{
                    style: {
                      background: 'white',
                      color: 'var(--neutral-900)',
                      border: '1px solid var(--neutral-200)',
                      borderRadius: '0.5rem',
                      boxShadow: 'var(--shadow-md)',
                    },
                    success: {
                      style: {
                        borderLeft: '4px solid var(--success-500)',
                      },
                    },
                    error: {
                      style: {
                        borderLeft: '4px solid var(--error-500)',
                      },
                    },
                    info: {
                      style: {
                        borderLeft: '4px solid var(--primary-500)',
                      },
                    },
                  }}
                />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="ships" element={<ShipList />} />
                    <Route path="ships/new" element={<ShipForm />} />
                    <Route path="ships/:id" element={<ShipDetails />} />
                    <Route path="ships/:id/edit" element={<ShipForm />} />
                    <Route path="ships/:shipId/components" element={<ComponentList />} />
                    <Route path="components" element={<ComponentList />} />
                    <Route path="components/new" element={<ComponentForm />} />
                    <Route path="components/:id" element={<ComponentDetails />} />
                    <Route path="components/:id/edit" element={<ComponentForm />} />
                    <Route path="jobs" element={<JobList />} />
                    <Route path="jobs/new" element={<JobForm />} />
                    <Route path="jobs/:id" element={<JobDetails />} />
                    <Route path="jobs/:id/edit" element={<JobForm />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="notifications" element={<NotificationDemo />} />
                  </Route>
                </Routes>
              </CalendarProvider>
            </JobsProvider>
          </ComponentsProvider>
        </ShipsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
