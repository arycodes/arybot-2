import React from 'react';
import ChatComponent from './gemini';

import Header from './header';



const App = () => {
  return (<>
    <Header />
    <div className="containermain">
      <ChatComponent />
    </div>
  </>
  );
};

export default App;
