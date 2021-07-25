import React,{Component} from "react";
//import ReactDOM from "react-dom";
import Chart from "react-apexcharts";

 class ApexChart extends React.Component {
  constructor(props) {
    super(props);

    this.temporal=null;
    this.nontemporal=null;
    this.color=null;
    this.onTemporalChange=this.onTemporalChange.bind(this);
    this.onNonTemporalChange=this.onNonTemporalChange.bind(this);
    this.onColorChange=this.onColorChange.bind(this);
    this.datablue = [];
    this.datagreen = [];
    this.datayellow = [];
    this.datared = [];
    this.state = {
    
      series: [{
        name: "blue",
        data: this.datablue,
        
      },{
        name: "green",
        data: this.datagreen,
        
      },{
        name: "yellow",
        data: this.datayellow,
        
      },{
        name: "red",
        data: this.datared,
        
      }],
      options: {
        chart: {
          height: 350,
          type: 'scatter',
          zoom: {
            //autoScaleXaxis: true,
            //autoScaleYaxis: true,
            enabled: false,
            type: 'xy'
          }
        },
        xaxis: {
          tickAmount: 10,
          labels: {
            formatter: function(val) {
              return parseFloat(val).toFixed(1)
            }
          }
        },
        yaxis: {
          tickAmount: 7
        }
      },
    
    
    };
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

  generatePoint(){
    if(this.color==="blue")
    {
      this.datablue.push([parseFloat(this.temporal),parseFloat(this.nontemporal),
      parseFloat(this.temporal)*parseFloat(this.nontemporal)*200,{
      min: 0,
      max: 1}]);
    }

    if(this.color==="green")
    {
      this.datagreen.push([parseFloat(this.temporal),parseFloat(this.nontemporal),
      parseFloat(this.temporal)*parseFloat(this.nontemporal)*200,{
      min: 0,
      max: 1}]);
    }

    if(this.color==="yellow")
    {
      this.datayellow.push([parseFloat(this.temporal),parseFloat(this.nontemporal),
      parseFloat(this.temporal)*parseFloat(this.nontemporal)*200,{
      min: 0,
      max: 1}]);
    }

    if(this.color==="red")
    {
      this.datared.push([parseFloat(this.temporal),parseFloat(this.nontemporal),
      parseFloat(this.temporal)*parseFloat(this.nontemporal)*200,{
      min: 0,
      max: 1}]);
    }

    this.setState({
    
      series: [{
        name: "blue",
        data: this.datablue,
        
      },{
        name: "green",
        data: this.datagreen,
        
      },{
        name: "yellow",
        data: this.datayellow,
        
      },{
        name: "red",
        data: this.datared,
        
      }],
      options: {
        chart: {
          height: 350,
          type: 'scatter',
          zoom: {
            //autoScaleXaxis: true,
            //autoScaleYaxis: true,
            enabled: false,
            type: 'xy'
          }
        },
        xaxis: {
          tickAmount: 10,
          labels: {
            formatter: function(val) {
              return parseFloat(val).toFixed(1)
            }
          }
        },
        yaxis: {
          tickAmount: 7
        }
      },
    
  });
  }

  render() {
    return (
      <div>
      <label>Enter Temporal Complexity:</label>
      <input type={Float32Array} onChange={this.onTemporalChange} min='0' max='1' />
      <label> Enter Non-Temporal Complexity:</label>
      <input type={Float32Array} onChange={this.onNonTemporalChange} min='0' max='1' />
      <label> Choose Complexity Color:</label>
      <select onChange={this.onColorChange}>
      <option value=""></option>  
      <option value="blue">Blue</option>
      <option value="green">Green</option>
      <option value="yellow">Yellow</option>
      <option value="red">Red</option>
      </select>
      <button className='btn' onClick={() => this.generatePoint()}>Save</button>
        <div id="chart">
          <Chart options={this.state.options} series={this.state.series} type="scatter" height={350} />
        </div>
        <div id="html-dist"></div>
      </div>
    );
  }
}

//const domContainer = document.querySelector('#app');

//ReactDOM.render(React.createElement(ApexChart), domContainer);

export default ApexChart;