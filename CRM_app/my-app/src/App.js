import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from "./components/utils/UserContext";
import routes from './components/utils/urls';
import Authorization from "./components/Authorization/Authorization";
import Head from "./components/Head/Head";
import Testing from "./components/Testing/Testing";
function App() {
  return (
      <UserProvider>
      <Router>
        <Routes>
          <Route path={routes.login} element={<Authorization />} />
          <Route path={routes.main} element={<Head />} />
          <Route path={routes.exam} element={<Testing />} />

        </Routes>
      </Router>
          </UserProvider>

  );
}

export default App;
