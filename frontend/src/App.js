import DeleteItems from './components/DeleteItems';
import Index from './components/Index';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Reports from './components/Reports';
import ReadyForDelete from './components/ReadyForDelete';
const App = () => {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/delete-items" element={<DeleteItems />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/ready-for-delete" element={<ReadyForDelete />} />
      </Routes>
    </Router>
  );
};

export default App;
