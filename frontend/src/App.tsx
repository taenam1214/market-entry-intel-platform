import Layout from './components/Layout';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './auth/AuthContext';

const App = () => (
  <div style={{ width: '100%', margin: 0, padding: 0 }}>
    <AuthProvider>
      <Layout>
        <AppRoutes />
      </Layout>
    </AuthProvider>
  </div>
);

export default App;
