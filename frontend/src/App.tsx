import Layout from './components/Layout';
import AppRoutes from './routes/AppRoutes';

const App = () => (
  <div style={{ width: '100%', margin: 0, padding: 0 }}>
    <Layout>
      <AppRoutes />
    </Layout>
      </div>
);

export default App;
