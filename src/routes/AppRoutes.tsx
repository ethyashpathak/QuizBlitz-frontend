import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Dashboard from '../pages/Dashboard';
import CreateQuiz from '../pages/CreateQuiz';
import QuizWorkspace from '../pages/QuizWorkspace';
import AcceptInvite from '../pages/AcceptInvite';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Layout } from '../components/Layout';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Landing />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/create"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateQuiz />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:quizId"
        element={
          <ProtectedRoute>
            <Layout>
              <QuizWorkspace />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/accept/:token"
        element={
          <ProtectedRoute>
            <Layout>
              <AcceptInvite />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

