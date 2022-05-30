import GoogleChart from './components/GoogleChart';
import FileLoader from './components/FileLoader';
import Complexity from './components/Complexity';
import About from './components/About';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import {useState} from 'react';



function App() {
  return (
      <div>
        <center>
        <h1>On the Complexity of Traffic Traces and Implications</h1>
        </center>
        <Tabs>
              <TabList>
                <Tab>Complaxity Map</Tab>
                <Tab>File Loader</Tab>
                <Tab>Complexity Calculation</Tab>
                <Tab>About</Tab>
              </TabList>
          
              <TabPanel>
                <div>
                  <center>
                    <h2>Complexity MAP</h2>
                    <GoogleChart/>
                  </center>
                </div>
              </TabPanel>
              <TabPanel>
              <div>
                  <center>
                    <h2>File Loader</h2>
                  </center>
                  <FileLoader/>
                </div>
              </TabPanel>
              <TabPanel>
              <div>
                  <center>
                    <h2>Complexity Calculation</h2>
                  </center>
                  <Complexity/>
                </div>
              </TabPanel>
              <TabPanel>
              <div>
                  <center>
                    <h2>About</h2>
                  </center>
                  <About/>
                </div>
              </TabPanel>
              
        </Tabs>
      </div>

  );
}

//<ApexChart/>

export default App;
