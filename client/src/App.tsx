import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import WorkflowDetails from "./pages/WorkflowDetails";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/workflowDetails/:template_id"
            element={<WorkflowDetails />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
