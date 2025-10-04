import Layout from './components/Layout';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './auth/AuthContext';
import { DataProvider } from './contexts/DataContext';

const App = () => (
  <div style={{ width: '100%', margin: 0, padding: 0 }}>
    <AuthProvider>
      <DataProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </DataProvider>
    </AuthProvider>
  </div>
);

export default App;
