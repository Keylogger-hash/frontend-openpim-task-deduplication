import DeleteItems from './components/DeleteItems';
import Index from './components/Index';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Reports from './components/Reports';
import ReadyForDelete from './components/ReadyForDelete';
import SuccessDelete from './components/SuccessDelete';
const App = () => {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/delete-items/:taskId" element={<DeleteItems />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/ready-for-delete/:taskId" element={<ReadyForDelete />} />
        <Route path="/success-delete" element={<SuccessDelete />} />
      </Routes>
    </Router>
  );
};

export default App;
