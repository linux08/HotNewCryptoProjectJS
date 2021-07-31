// client/src/App.js

import React, {useState} from "react";
import logo from "./logo.svg";
import "./App.css";
import Axios from "axios"

Axios.defaults.baseURL = 'http://localhost:3001';

function App() {
  const [data, setData] = useState(null);
  React.useEffect(() => {
    Axios.get("/api")
      .then((data) => console.log(data))
      .catch(err=> console.log(err))
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        Welcome to Hot Crypto Cash
      </header>
    </div>
  );
}

export default App;