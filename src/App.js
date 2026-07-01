import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from "./pages/Login"
import Form from "./pages/Form";
import Users from "./pages/Users"
import Page404 from "./pages/Page404"
import Navbar from './components/Navbar';
import PrivateRoute from "./components/PrivateRoute";
import { AuthContextProvider } from './context/authContext';
import { ClientContextProvider } from "./context/clientContext";
import { AppProvider } from './context/AppContext';
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <AuthContextProvider>
      <ClientContextProvider>
        <AppProvider>
          <Router>
            <Navbar />
            <div id='wrapper' className="d-flex vh-100 overflow-auto p-0">
              <Routes>
                <Route path='/' element={<Navigate to="/login" />} />
                <Route path='/login' element={<Login />} />
                <Route path='/form' element={<PrivateRoute component={Form} />} />
                <Route path='/form/:id' element={<PrivateRoute component={Form} />} />
                <Route path='/usuarios' element={<PrivateRoute component={Users} />} />
                <Route path='*' element={<Page404 />} />
              </Routes>
            </div>
          </Router>
        </AppProvider>
      </ClientContextProvider>
    </AuthContextProvider>
  );
}

export default App;
