// Main application component with routing configuration
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import WorkflowDetails from "./pages/WorkflowDetails";

/**
 * App component - Main application entry point
 * Sets up routing between Dashboard and WorkflowDetails pages
 * Provides consistent layout with gray background and padding
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 p-6">
        <Routes>
          {/* Dashboard page - lists all available workflows */}
          <Route path="/" element={<Dashboard />} />

          {/* Workflow details page - shows individual workflow information */}
          <Route
            path="/workflowDetails/:workflow_id"
            element={<WorkflowDetails />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
