import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from "./components/utils/UserContext";
import routes from './components/utils/urls';
import Authorization from "./components/Authorization/Authorization";
import Testing from "./components/Testing/Testing";
import Start from "./components/Start/Start";
import CheckLists from "./components/CheckLists/CheckLists";
import Complaints from "./components/Complaints/Complaints";
function App() {
  return (
      <UserProvider>
      <Router>
        <Routes>
          <Route path={routes.login} element={<Authorization />} />
          <Route path={routes.main} element={<Start />} />
          <Route path={routes.exam} element={<Testing />} />
            <Route path={routes.lists} element={<CheckLists />} />
            <Route path={routes.complaints} element={<Complaints />} />

        </Routes>
      </Router>
          </UserProvider>

  );
}

export default App;
