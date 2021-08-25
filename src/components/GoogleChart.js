import { render } from "@testing-library/react";
import React,{Component} from "react";
import Chart from "react-google-charts";
import { Modal,ModalManager,Effect} from 'react-dynamic-modal';

class GoogleChart extends React.Component {
    constructor(props) {
      super(props);
    this.temporal=null;
    this.nontemporal=null;
    this.color="#000000";
    this.colorarr = ['#000000'];
    this.colorNumberGroup=[1];
    this.Name=null;
    this.onTemporalChange=this.onTemporalChange.bind(this);
    this.onNonTemporalChange=this.onNonTemporalChange.bind(this);
    this.onColorChange=this.onColorChange.bind(this);
    this.onNameChange=this.onNameChange.bind(this);
    this.FirstTime = true;
    this.oldcolor="#000000";
    this.oldName=null;
    this.selected=null;
    this.data=[
       ['Name', 'Temporal', 'NonTemporal', 'Color', 'Size'],
       ['',0,0,"#000000",0]
      ];
    this.options = {
        title:'',
        hAxis: { title: 'Temporal' ,minValue: 0, maxValue: 1},
        vAxis: { title: 'NonTemporal' ,minValue: 0, maxValue: 1 },
        bubble: { textStyle: { fontSize: 11 } },
        colors: this.colorarr,
        
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
    if(this.temporal>1 || this.temporal<0 || this.nontemporal>1 || this.nontemporal<0) return;
    
    if(this.FirstTime==true)  {
      this.data = [
        ['Name', 'Temporal', 'NonTemporal', 'Color', 'Size']
    ];
    this.colorarr = [this.color];
    this.colorNumberGroup = [1];
    this.FirstTime=false;
    }
    else if (this.colorarr.includes(this.color)==false) {
      this.colorarr.push(this.color);
      this.colorNumberGroup.push(1);
    }
    else {
      this.colorNumberGroup[this.colorarr.indexOf(this.color)] += 1;
    } 
   
    var size=parseFloat(this.temporal)*parseFloat(this.nontemporal);

    this.data.push([this.Name,parseFloat(this.temporal),parseFloat(this.nontemporal),this.color,size]);

    this.options = {
        title:'',
        hAxis: { title: 'Temporal' ,minValue: 0, maxValue: 1},
        vAxis: { title: 'NonTemporal' ,minValue: 0, maxValue: 1 },
        bubble: { textStyle: { fontSize: 11 } },
        colors: this.colorarr,
        
    }
    this.setState({chartData:this.data});
}

handleRemove() {
  if(this.selected != null) {
    if(this.data.length >2 ) {
      if (this.colorNumberGroup[this.colorarr.indexOf(this.data[this.selected[0].row+1][3])] > 1){
        this.colorNumberGroup[this.colorarr.indexOf(this.data[this.selected[0].row+1][3])] -= 1;
      }
      else {
        this.colorNumberGroup.splice(this.colorarr.indexOf(this.data[this.selected[0].row+1][3]),1);
        this.colorarr.splice(this.colorarr.indexOf(this.data[this.selected[0].row+1][3]),1);
      }
      this.data.splice(this.selected[0].row+1,1);
      this.colorarr = [];
      for(var i=1;i<this.data.length;i++) {
         if( this.colorarr.includes(this.data[i][3]) == false) this.colorarr.push(this.data[i][3]);
      }
    }
    else 
    {
      this.colorNumberGroup=[1];
      this.colorarr = ['#000000'];
      this.data = [
        ['Name', 'Temporal', 'NonTemporal', 'Color', 'Size'],
        ["",0,0,'#000000',0]
      ];
      this.FirstTime = true;
      
    }
    this.options = {
      title:'',
      hAxis: { title: 'Temporal' ,minValue: 0, maxValue: 1},
      vAxis: { title: 'NonTemporal' ,minValue: 0, maxValue: 1 },
      bubble: { textStyle: { fontSize: 11 } },
      colors: this.colorarr,
      
    }
    this.setState({chartData:this.data});
  }
}     

handleNameChange(){
  if(this.selected != null) {
    this.data[this.selected[0].row+1][0]=this.Name;
    this.options = {
      title:'',
      hAxis: { title: 'Temporal' ,minValue: 0, maxValue: 1},
      vAxis: { title: 'NonTemporal' ,minValue: 0, maxValue: 1 },
      bubble: { textStyle: { fontSize: 11 } },
      colors: this.colorarr,
      
    }
    this.setState({chartData:this.data});
  }

}


handleColorChange(){
  if(this.selected != null) {
    this.Name=this.data[this.selected[0].row+1][0];
    this.temporal=this.data[this.selected[0].row+1][1];
    this.nontemporal=this.data[this.selected[0].row+1][2];
    if(this.data.length >2 ) {
      if (this.colorNumberGroup[this.colorarr.indexOf(this.data[this.selected[0].row+1][3])] > 1){
        this.colorNumberGroup[this.colorarr.indexOf(this.data[this.selected[0].row+1][3])] -= 1;
      }
      else {
        this.colorNumberGroup.splice(this.colorarr.indexOf(this.data[this.selected[0].row+1][3]),1);
        this.colorarr.splice(this.colorarr.indexOf(this.data[this.selected[0].row+1][3]),1);
      }
      this.data.splice(this.selected[0].row+1,1);
      this.colorarr = [];
      for(var i=1;i<this.data.length;i++) {
         if( this.colorarr.includes(this.data[i][3]) == false) this.colorarr.push(this.data[i][3]);
      }
    }
    else 
    {
      this.colorNumberGroup=[1];
      this.colorarr = ['#000000'];
      this.data = [
        ['Name', 'Temporal', 'NonTemporal', 'Color', 'Size'],
        ["",0,0,'#000000',0]
      ];
      this.FirstTime = true;
      
    }

    this.generatePoint();
    this.data[this.data.length-1][0]=this.Name;
    this.color=this.oldcolor;
    this.options = {
      title:'',
      hAxis: { title: 'Temporal' ,minValue: 0, maxValue: 1},
      vAxis: { title: 'NonTemporal' ,minValue: 0, maxValue: 1 },
      bubble: { textStyle: { fontSize: 11 } },
      colors: this.colorarr,
      
    }
    this.setState({chartData:this.data});
  }
}


openDialog(){ 
  ModalManager.open(
  <div>
          <Modal
             onRequestClose={() => true}
             effect={Effect.ScaleUp}
             >
             <input type="string" onChange={this.oldName=this.Name,this.onNameChange} />
             <button className='btn' onClick={()=>{this.handleNameChange();ModalManager.close();}}>Change Name</button>
             <input type="color" onChange={this.oldcolor=this.color,this.onColorChange} />
             <button className='btn' onClick={()=>{this.handleColorChange();ModalManager.close();}}>Change Color</button>
             <button className='btn' onClick={()=>{this.handleRemove();ModalManager.close();}}>Remove</button>
             <button className='btn' onClick={ModalManager.close}>Cancel</button>
          </Modal>
  </div>
  );
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
      <input type="color" onChange={this.onColorChange} />
      <button className='btn' onClick={() => this.generatePoint()}>Save</button>
        <div id="chart">
          <Chart
  width={'1500px'}
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