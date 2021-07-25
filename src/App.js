import Todo from './components/Todo';
import ApexChart from './components/ApexChart';
import {useState} from 'react';


function App() {
  /*
  const [temporal,setTemporal]=useState(null);
  const [nontemporal,setNonTemporal]=useState(null);
  const [data,setData]=useState([]);

  function onTemporalChange(e){
    setTemporal(e.target.value);
  }
 
  function onNonTemporalChange(e){
    setNonTemporal(e.target.value);
  }
*/

  return (

      <div>
        <center>
        <h1>Complexity MAP</h1>
        <ApexChart/>
        </center>
      </div>
  );
}


export default App;
