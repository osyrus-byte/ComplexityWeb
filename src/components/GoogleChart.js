import { render } from "@testing-library/react";
import React,{Component} from "react";
import Chart from "react-google-charts";
import { Modal,ModalManager,Effect} from 'react-dynamic-modal';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import DataTable from "react-data-table-component";
import infoMap from "./images/button_to_save_a_point_to_the_map.png";
import infoPoint from "./images/buttons_for_point_operations_in_map.png";
import infoTable from "./images/buttons_for_db_table_operations_in_the_website_for_the_map.png";
import { Button } from "react-bootstrap";
import * as env from "../env/enviroment.config.json";
//import SortIcon from "@material-ui/icons/ArrowDownward" //sortIcon={<SortIcon/>}

const columns = [
  {id : 1,
  name: "Trace",
  selector: (row) => row.Trace,
  sortable : true,
  maxWidth: '200px',
  reorder : true
},
{id : 2,
  name: "Temporal",
  selector: (row) => row.Temporal,
  sortable : true,
  maxWidth: '200px',
  reorder : true
},
{id : 3,
  name: "Nontemporal",
  selector: (row) => row.Nontemporal,
  sortable : true,
  maxWidth: '200px',
  reorder : true
},
{id : 4,
  name: "CompressionMethod",
  selector: (row) => row.CompressionMethod,
  sortable : true,
  maxWidth: '200px',
  reorder : true
},
{id : 5,
  name: "WindowSize",
  selector: (row) => row.WindowSize,
  sortable : true,
  maxWidth: '200px',
  reorder : true
}
/*{id : 6,
  name: "Color",
  selector: (row) => row.Color,
  sortable : true,
  maxWidth: '200px',
  reorder : true
}*/
]

class GoogleChart extends React.Component {
    constructor(props) {
      super(props);
    this.temporal=null;
    this.nontemporal=null;
    this.color="#0000FF";
    this.colorarr = ['#0000FF'];
    this.Namearr=[];
    this.Name='';
    this.togglearr=[];
    //this.minsize=0;
    //this.maxsize=10;
    this.onColorChange=this.onColorChange.bind(this);
    this.getPointFromDBQuery=this.getPointFromDBQuery.bind(this);
    this.guideOnMap=this.guideOnMap.bind(this);
    this.guideOnTable=this.guideOnTable.bind(this);
    this.exportExcel=this.exportExcel.bind(this);
    this.exportImage=this.exportImage.bind(this);
    this.exportMap=this.exportMap.bind(this);
    this.Wrapper=null;
    this.FirstTime = true;
    this.windowSize="default"; 
    this.compressionMethod="default";
    this.selected=null;
    this.RowsSelection = [];
    this.data=[
       ['Name', 'Temporal', 'NonTemporal', 'Name', 'Size'],
       [null,0,0,null,0],
      ];
    this.options = {
        title:'',
        hAxis: { title: 'Temporal' ,minValue: 0, maxValue: 1},
        vAxis: { title: 'NonTemporal',titleTextStyle: {color:"#000000",fontName: 'Arial'} ,minValue: 0, maxValue: 1 },
        chartArea: {left: 150, top: 10},
        bubble: { textStyle: { fontSize: 11 } },
        colors: this.colorarr,
        sizeAxis: {minValue: this.minsize,  maxSize: this.maxsize},
    }
    this.queryData = [];//{"Trace":"bal","Temporal":4,"Nontemporal":5,"Color":"#0000FF"},{"Trace":"bhj","Temporal":9,"Nontemporal":6,"Color":"#FF0000"}];
}  

//'Compression,WindowSize' methods

  onColorChange(e){
    this.color=e.target.value;
  }

  getPointFromDBQuery(TraceName){
    for(var i=0;i<this.queryData.length;i++){
      if(this.queryData[i]["Trace"]==TraceName)
          return this.queryData[i];
    }
    return null;
  }

  generatePoint(Name,temporal,nontemporal,color){
    if(temporal>1 || temporal<0 || nontemporal>1 || nontemporal<0)
    {
      alert('Point not in range! try again');
      return;
    }
    if(Name=='' || Name=='Name') {
      alert('forbiden name! try again');
      return;
    }
    for(var i=0;i<this.data.length;i++) //check if name already exists
    {
      if(this.data[i][0]==Name) 
      {
        alert('name already exists! try again');
        return;
      }
    }
    
    if(this.FirstTime==true)  {
      this.data = [
        ['Name', 'Temporal', 'NonTemporal', 'Name', 'Size',],
    ];
    this.colorarr = [color];
    this.Namearr=[Name];
    this.togglearr=[true];
    this.FirstTime=false;
    }
    else {
      this.colorarr.push(color);
      this.Namearr.push(Name);
      this.togglearr.push(true);
    }
    
    var size=parseFloat(temporal)*parseFloat(nontemporal);
    
    this.data.push(["",parseFloat(temporal),parseFloat(nontemporal),Name.substring(0,7),size]);
    
    //if(this.maxsize<size*50) this.maxsize=size*50;
    //if(this.minsize>size*50) this.minsize=size*50;
    this.options = {
        title:'',
        hAxis: { title: 'Temporal' ,minValue: 0, maxValue: 1},
        vAxis: { title: 'NonTemporal',titleTextStyle: {color:"#000000",fontName: 'Arial'} ,minValue: 0, maxValue: 1 },
        chartArea: {left: 150, top: 10},
        bubble: { textStyle: { fontSize: 11 } },
        colors: this.colorarr,
        //sizeAxis: {minValue: this.minsize,  maxSize: this.maxsize},

    }
    this.setState({chartData:this.data});
}

handleRemove() {
  if(this.selected != null) {
    if(this.data.length >2 ) { 
      this.colorarr.splice(this.selected[0].row,1);
      this.Namearr.splice(this.selected[0].row,1);
      this.togglearr.splice(this.selected[0].row,1);
      this.data.splice(this.selected[0].row+1,1);
    }
    else 
    {
      this.colorarr = ['#0000FF'];
      this.data = [
        ['Name', 'Temporal', 'NonTemporal', 'Name', 'Size'],
        [null,0,0,null,0],
      ];
      this.FirstTime = true;
      
    }
    this.options = {
      title:'',
      hAxis: { title: 'Temporal' ,minValue: 0, maxValue: 1},
      vAxis: { title: 'NonTemporal',titleTextStyle: {color:"#000000",fontName: 'Arial'} ,minValue: 0, maxValue: 1 },
      chartArea: {left: 150, top: 10},
      bubble: { textStyle: { fontSize: 11 } },
      colors: this.colorarr,
      //sizeAxis: {minValue: this.minsize,  maxSize: this.maxsize},

    }
    this.setState({chartData:this.data});
  }
}     

Toggel(){
  if(this.selected != null) {
    //this.data[this.selected[0].row+1][0]="";
    if(this.togglearr[this.selected[0].row]==true) {
      this.data[this.selected[0].row+1][3]=this.Namearr[this.selected[0].row];
      this.togglearr[this.selected[0].row]=false;
    }
    else{
      this.data[this.selected[0].row+1][3]=this.Namearr[this.selected[0].row].substring(0,7);
      this.togglearr[this.selected[0].row]=true;
    }
    this.options = {
      title:'',
      hAxis: { title: 'Temporal' ,minValue: 0, maxValue: 1},
      vAxis: { title: 'NonTemporal',titleTextStyle: {color:"#000000",fontName: 'Arial'} ,minValue: 0, maxValue: 1 },
      chartArea: {left: 150, top: 10},
      bubble: { textStyle: { fontSize: 11 } },
      colors: this.colorarr,
      //sizeAxis: {minValue: this.minsize,  maxSize: this.maxsize},

    }
    this.setState({chartData:this.data});
  }

}


handleColorChange(){
  if(this.selected != null) { 
    if(this.Name!=null) this.Name=this.Namearr[this.selected[0].row];
    this.temporal=this.data[this.selected[0].row+1][1];
    this.nontemporal=this.data[this.selected[0].row+1][2];
    if(this.data.length >2 ) { 
      this.colorarr.splice(this.selected[0].row,1);
      this.Namearr.splice(this.selected[0].row,1);
      this.togglearr.splice(this.selected[0].row,1);
      this.data.splice(this.selected[0].row+1,1);
    }
    else 
    {
      this.colorNumberGroup=[1];
      this.colorarr = ['#0000FF'];
      this.data = [
        ['Name', 'Temporal', 'NonTemporal', 'Name', 'Size'],
        [null,0,0,null,0],
      ];
      this.FirstTime = true;
      
    }

    this.generatePoint(this.Name,this.temporal,this.nontemporal,this.color);
    this.options = {
      title:'',
      hAxis: { title: 'Temporal' ,minValue: 0, maxValue: 1},
      vAxis: { title: 'NonTemporal',titleTextStyle: {color:"#000000",fontName: 'Arial'} ,minValue: 0, maxValue: 1 },
      chartArea: {left: 150, top: 10},
      bubble: { textStyle: { fontSize: 11 } },
      colors: this.colorarr,
      //sizeAxis: {minValue: this.minsize,  maxSize: this.maxsize},

    }
    this.setState({chartData:this.data});
  }
}

guideOnMap(){
  ModalManager.open(
    <div>
            <Modal
               onRequestClose={() => true}
               effect={Effect.ScaleUp}
               >
               <div>
                 <img src={infoMap} alt="" width="900" height="120"/>
                 <ul>
                   <li>Save: button that add a point to the map based on the name,complexity parameter and color.</li>
                 </ul>
               </div>
            </Modal>
    </div>
  );}

  guideOnTable(){
    ModalManager.open(
      <div>
              <Modal
                 onRequestClose={() => true}
                 effect={Effect.ScaleUp}
                 >
                 <div>
                   <img src={infoTable} alt="" width="540" height="180"/>
                   <ul>
                     <li>Get Points: button that fetch the traces from the server.</li>
                     <li>ADD TO MAP: button that add selected traces from the table below.</li>
                     <li>REMOVE FROM MAP: button that remove selected traces from the table below.</li>
                   </ul>
                 </div>
              </Modal>
      </div>
    );}

  exportExcel(){
    var excel = "name,temporal,nontemporal,color,total complexity size,Compression Method,windowSize\n"
    for(var i=0;i<this.data.length-1;i++){
      var point=this.getPointFromDBQuery(this.Namearr[i]);
      excel=excel+point["Trace"]+","+point["Temporal"]+","+point["Nontemporal"]+","+this.colorarr[i]+","+(parseFloat(point["Temporal"])*parseFloat(point["Nontemporal"])).toFixed(3).toString()+","+point["CompressionMethod"]+","+point["WindowSize"]+"\n";
    }
    const element = document.createElement("a");
    const file = new Blob([excel], {
          type: "text/plain"
    });
    element.href = URL.createObjectURL(file);
    element.download = "ComplexityMap.csv";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  exportImage(chartWrapper){
    const chart = chartWrapper.getChart();
    const element = document.createElement("a");
    element.href = chart.getImageURI();
    element.download = "ComplexityMap.png";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  exportMap(){
    ModalManager.open(
      <div>
              <Modal
                 onRequestClose={() => true}
                 effect={Effect.ScaleUp}
                 >
                 <div>
                   <h3>By which format you want to export the map?</h3>
                   <button className='btn' onClick={()=>{this.exportExcel();ModalManager.close();}}>As Excel</button> 
                   <button className='btn' onClick={()=>{ this.exportImage(this.Wrapper);ModalManager.close();}}>As Png</button>
                 </div>
              </Modal>
      </div>
    );
  }

openDialog(){ 
  this.color='#0000FF';
  var point=this.getPointFromDBQuery(this.Namearr[this.selected[0].row]);
  ModalManager.open(
  <div>
          <Modal
             onRequestClose={() => true}
             effect={Effect.ScaleUp}
          >
          <Tabs>
              <TabList>
                <Tab>Edit</Tab>
                <Tab>Info</Tab>
    
              </TabList>
          
              <TabPanel>
                <div>
             <button className='btn' onClick={()=>{this.Toggel();ModalManager.close();}}>Toggel Name Length</button>
             <select onChange={this.onColorChange}> 
             <option value="#0000FF">Blue</option>
             <option value="#00FF00">Green</option>
             <option value="#FFFF00">Yellow</option>
             <option value="#FF0000">Red</option>
             </select> 
             <button className='btn' onClick={()=>{this.handleColorChange();ModalManager.close();}}>Change Color</button>
             <button className='btn' onClick={()=>{this.handleRemove();ModalManager.close();}}>Remove</button>
             <button className='btn' onClick={ModalManager.close}>Cancel</button>
             <div>
               <h3>name:{point["Trace"]}</h3>
               <h3>temporal:{point["Temporal"]}</h3>
               <h3>nontemporal:{point["Nontemporal"]}</h3>
               <h3>total complexity size:{(parseFloat(point["Temporal"])*parseFloat(point["Nontemporal"])).toFixed(3)}</h3>
               <h3>Compression Method:{point["CompressionMethod"]}</h3>
               <h3>windowSize:{point["WindowSize"]}</h3>
             </div>
              </div>
              </TabPanel>

              <TabPanel>
              <div>
              <img src={infoPoint} alt="" width="450" height="150"/>
                  <ul>
                   <li>ChangeName: button that alternate between short name and full name.</li>
                   <li>ChangeColor: button that change the trace color based on choise from previous scrolling menu.</li>
                   <li>Remove: button that removes the point from the map.</li>
                   <li>Cancel: button that close this opened window (dialog).</li>
                  </ul>
                  <ul></ul>
                  <ul>
                   <li>Name: a string name for a trace that appears on the map.</li>
                   <li>Temporal: the ratio between the compressed original trace and the compressed time-shuffeled trace.</li>
                   <li>NonTemporal: the ratio between the compressed time-shuffeled trace and the compressed uniformly randomized trace.</li>
                   <li>Total Complexity: the ratio between the compressed original trace and the compressed uniformly randomized trace.</li>
                   <li>Compression Method: the compression method used to compresse the traces.</li>
                   <li>Window Size: the size of the window used to compresse the traces.</li>
                  </ul>
               </div>
              </TabPanel>
              
        </Tabs>
        </Modal>
  </div>
  );
  Array.from(document.querySelectorAll("input")).forEach(
    input => (input.value = "")
  );
  this.setState({
    itemvalues: [{}]
  });
}

async get_Points(){
  await fetch(env.DB)
  //.then(response => { response.text();})
  //.then(text => {console.log(text);});
  .then(response => {return response.json();})
  .then(responseData => { this.queryData = responseData.map((i) => ({"Trace":i[0],"Temporal":parseFloat(i[1].toString()).toFixed(3),"Nontemporal":parseFloat(i[2].toString()).toFixed(3),"Color":i[3],"CompressionMethod":i[4],"WindowSize":i[5]})); return responseData;}) //{Trace:"bal",Temporal:4,Nontemporal:5}
  .catch(err => {alert(err.toString() + " could not receive points,maybe database is down");});
  this.setState({data:this.queryData});
  //alert(JSON.stringify(this.queryData));
}

handleAddFromTable(){
    for(var i=0;i<this.RowsSelection.length;i++)
      this.generatePoint(this.RowsSelection[i]["Trace"],this.RowsSelection[i]["Temporal"],this.RowsSelection[i]["Nontemporal"],this.RowsSelection[i]["Color"]);
}

RemovePoint(name) {
  var pointindex = null; //since trace name is unique
  for(var i = 0;i<this.Namearr.length;i++){
    if(this.Namearr[i]==name) {
      pointindex = i;
      break;
    }
  }
  if(pointindex == null) {
    alert("Trace Not Found!");
    return;
  }
  if(this.data.length >2) { 
    this.colorarr.splice(pointindex,1);
    this.Namearr.splice(pointindex,1);
    this.data.splice(pointindex+1,1);
  }
  else 
  {
    this.colorarr = ['#0000FF'];
    this.data = [
      ['Name', 'Temporal', 'NonTemporal', 'Name', 'Size'],
      [null,0,0,null,0],
    ];
    this.FirstTime = true;
    
  }
  this.options = {
    title:'',
    hAxis: { title: 'Temporal' ,minValue: 0, maxValue: 1},
    vAxis: { title: 'NonTemporal' ,minValue: 0, maxValue: 1 },
    bubble: { textStyle: { fontSize: 11 } },
    colors: this.colorarr,
    //sizeAxis: {minValue: this.minsize,  maxSize: this.maxsize},

  }
  this.setState({chartData:this.data});
}     

handleRemoveFromMap(){
  for(var i=0;i<this.RowsSelection.length;i++)
  {
      this.RemovePoint(this.RowsSelection[i]["Trace"]);
  }
}

render(){
return(
    <div>
        <div id="chart">
          <button className='btn' onClick={() => this.exportMap()}>Export Map</button>
          <Chart
  width={'750px'}
  height={'600px'}
  chartType="BubbleChart"
  loader={<div>Loading Chart</div>}
  data={this.data}
  options={this.options}
  rootProps={{ 'data-testid': '1' }}
  chartEvents={[
    {
      eventName: "select",
      callback: ({ chartWrapper, google}) =>{
        const chart = chartWrapper.getChart();
        const temp = chart.getSelection();
        if(temp[0] != undefined) this.selected = temp; 
        this.openDialog();
      }
},
{
  eventName: "ready",
  callback: ({ chartWrapper, google}) =>{
    this.Wrapper=chartWrapper;
  }
}
]}

/>
      </div>
      <div id="datatable">
      <button className='btn' onClick={() => this.get_Points()}>Get Points</button>
      <button className='btn' onClick={() => this.handleAddFromTable()}>ADD TO MAP</button>
      <button className='btn' onClick={() => this.handleRemoveFromMap()}>REMOVE FROM MAP</button>
      <button className="btn_circle" onClick={() => this.guideOnTable()}>?</button>
      <DataTable title="Points From DB" columns={columns} data={this.queryData} defaultSirtFieldID={1} pagination selectableRows onSelectedRowsChange={({ selectedRows }) => {this.RowsSelection=selectedRows;}}/> 
      </div> 
      <div id="html-dist"></div>
    </div>
);}
}

export default GoogleChart;