import FloatingAssistant from './components/FloatingAssistant.jsx';
import SwipeToDeploy from './components/SwipeToDeploy.jsx';
import './App.css';

function App() {
  const handleDeploy = () => {
    alert('Deployed successfully!');
  };

  return (
    <div className="app-container">
      <header className="app-header glass-card">
        <h1>Dark Crystal</h1>
        <p>Mobile-First PWA PoC</p>
      </header>

      <main className="app-main">
        <section className="dashboard glass-card">
          <h2>Dashboard</h2>
          <p>Welcome to the Dark Mode Crystal UI. This demonstrates pure CSS glassmorphism.</p>
        </section>

        <div className="action-area">
          <SwipeToDeploy onDeploy={handleDeploy} />
        </div>
      </main>

      <FloatingAssistant />
    </div>
  );
}

export default App;
