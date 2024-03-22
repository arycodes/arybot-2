import React from 'react';
import ChatComponent from './gemini';

import Header from './header';

import ThemeButton from "./switchtheme"



const App = () => {
  return (<>
    <ThemeButton />
    <Header />
    <div className="containermain">
      <ChatComponent />
    </div>
  </>
  );
};

export default App;
