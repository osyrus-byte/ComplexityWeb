import { render } from "@testing-library/react";
import React,{Component} from "react";
import Chart from "react-google-charts";
import { Modal,ModalManager,Effect} from 'react-dynamic-modal';

class GoogleChart extends React.Component {
    constructor(props) {
      super(props);
    this.temporal=null;
    this.nontemporal=null;
    this.color="#0000FF";
    this.colorarr = ['#0000FF'];
    this.Namearr=[];
    this.Name='';
    //this.minsize=0;
    //this.maxsize=10;
    this.onTemporalChange=this.onTemporalChange.bind(this);
    this.onNonTemporalChange=this.onNonTemporalChange.bind(this);
    this.onColorChange=this.onColorChange.bind(this);
    this.onNameChange=this.onNameChange.bind(this);
    this.FirstTime = true;
    this.oldcolor="#0000FF";
    this.oldName='';
    this.selected=null;
    this.data=[
       ['Name', 'Temporal', 'NonTemporal', 'Name', 'Size'],
       [null,0,0,null,0],
      ];
    this.options = {
        title:'',
        hAxis: { title: 'Temporal' ,minValue: 0, maxValue: 1},
        vAxis: { title: 'NonTemporal' ,minValue: 0, maxValue: 1 },
        bubble: { textStyle: { fontSize: 11 } },
        colors: this.colorarr,
        sizeAxis: {minValue: this.minsize,  maxSize: this.maxsize},
    }
}   

onTemporalChange(e){
    this.temporal = e.target.value;
  }

  onNonTemporalChange(e){
    this.nontemporal = e.target.value;
  }

  onColorChange(e){
    this.color=e.target.value;
  }

  onNameChange(e){
    this.Name=e.target.value;
  }

  generatePoint(){
    if(this.temporal>1 || this.temporal<0 || this.nontemporal>1 || this.nontemporal<0)
    {
      alert('Point not in range! try again');
      return;
    }
    if(this.Name=='' || this.Name=='Name') {
      alert('forbiden name! try again');
      return;
    }
    for(var i=0;i<this.data.length;i++) //check if name already exists
    {
      if(this.data[i][0]==this.Name) 
      {
        alert('name already exists! try again');
        return;
      }
    }
    
    if(this.FirstTime==true)  {
      this.data = [
        ['Name', 'Temporal', 'NonTemporal', 'Name', 'Size'],
    ];
    this.colorarr = [this.color];
    this.Namearr=[this.Name];
    this.FirstTime=false;
    }
    else {
      this.colorarr.push(this.color);
      this.Namearr.push(this.Name);
    }
    
    var size=parseFloat(this.temporal)*parseFloat(this.nontemporal);
    
    this.data.push([this.Name,parseFloat(this.temporal),parseFloat(this.nontemporal),this.Name,size]);

    //if(this.maxsize<size*50) this.maxsize=size*50;
    //if(this.minsize>size*50) this.minsize=size*50;
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

handleRemove() {
  if(this.selected != null) {
    if(this.data.length >2 ) { 
      this.colorarr.splice(this.selected[0].row,1);
      this.Namearr.splice(this.selected[0].row,1);
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
      vAxis: { title: 'NonTemporal' ,minValue: 0, maxValue: 1 },
      bubble: { textStyle: { fontSize: 11 } },
      colors: this.colorarr,
      //sizeAxis: {minValue: this.minsize,  maxSize: this.maxsize},

    }
    this.setState({chartData:this.data});
  }
}     

handleNameChange(){
  if(this.selected != null) {
    if(this.Name=='' || this.Name=='Name') {
      alert('forbiden name! try again');
      return;
    }
    for(var i=0;i<this.data.length;i++) //check if name already exists
    {
      if(this.data[i][0]==this.Name) 
      {
        alert('name already exists! try again');
        return;
      }
    }
    this.data[this.selected[0].row+1][0]=this.Name;
    this.data[this.selected[0].row+1][3]=this.Name;
    this.Name=this.oldName;
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

}


handleColorChange(){
  if(this.selected != null) {
    if(this.Name!=null) this.Name=this.data[this.selected[0].row+1][0];
    this.temporal=this.data[this.selected[0].row+1][1];
    this.nontemporal=this.data[this.selected[0].row+1][2];
    if(this.data.length >2 ) { 
      this.colorarr.splice(this.selected[0].row,1);
      this.Namearr.splice(this.selected[0].row,1);
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

    this.generatePoint();
    this.data[this.data.length-1][0]=this.Name;
    this.data[this.data.length-1][3]=this.Name;
    this.color=this.oldcolor;
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
}

openDialog(){ 
  this.color='#0000FF';
  ModalManager.open(
  <div>
          <Modal
             onRequestClose={() => true}
             effect={Effect.ScaleUp}
             >
             <input type="string" onChange={this.oldName=this.Name,this.onNameChange} />
             <button className='btn' onClick={()=>{this.handleNameChange();ModalManager.close();}}>Change Name</button>
             <select onChange={this.oldcolor=this.color,this.onColorChange}> 
             <option value="#0000FF">Blue</option>
             <option value="#00FF00">Green</option>
             <option value="#FFFF00">Yellow</option>
             <option value="#FF0000">Red</option>
             </select> 
             <button className='btn' onClick={()=>{this.handleColorChange();ModalManager.close();}}>Change Color</button>
             <button className='btn' onClick={()=>{this.handleRemove();ModalManager.close();}}>Remove</button>
             <button className='btn' onClick={ModalManager.close}>Cancel</button>
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

render(){
return(
    <div>
      <label>Enter Name for the trace:</label>
      <input type="string" onChange={this.onNameChange} />
      <label>Enter Temporal Complexity:</label>
      <input type={Float32Array} onChange={this.onTemporalChange} min='0' max='1' />
      <label> Enter Non-Temporal Complexity:</label>
      <input type={Float32Array} onChange={this.onNonTemporalChange} min='0' max='1' />
      <label> Choose Complexity Color:</label>
      <select onChange={this.onColorChange}>
      <option value="#0000FF">Blue</option>
      <option value="#00FF00">Green</option>
      <option value="#FFFF00">Yellow</option>
      <option value="#FF0000">Red</option>
      </select> 
      <button className='btn' onClick={() => this.generatePoint()}>Save</button>
        <div id="chart">
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
}
]}

/>
        </div>
        <div id="html-dist"></div>
      </div>
);}
}

export default GoogleChart;