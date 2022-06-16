import React from "react";
import axios from "axios";
import * as Minio from "minio";
import DataTable from "react-data-table-component";
import LinearProgress from "@material-ui/core/LinearProgress";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import * as env from "../env/environment.config.json";
import {Text} from "react-native";


const columns = [
    {id : 1,
    name: "name",
    selector: (row) => row.name,
    sortable : true,
    maxWidth: '200px',
    reorder : true
  },
  {id : 2,
    name: "creationDate",
    selector: (row) => row.creationDate,
    sortable : true,
    maxWidth: '200px',
    reorder : true
  },
  {id : 3,
    name: "size",
    selector: (row) => row.size,
    sortable : true,
    maxWidth: '200px',
    reorder : true
  }]

  class Complexity extends React.Component {
    constructor(props) {
        super(props);
        this.pairFilter="no";
        this.nodeFilter="no";
        this.windowSize="default"; 
        this.compressionMethod="default"; 

        this.onPairFilterChange=this.onPairFilterChange.bind(this);
        this.onNodeFilterChange=this.onNodeFilterChange.bind(this);
        this.calculateComplexity=this.calculateComplexity.bind(this);
        this.removeBuckets=this.removeBuckets.bind(this);

        this.onWindowSizeChange=this.onWindowSizeChange.bind(this);
        this.onCompressionMethodChange=this.onCompressionMethodChange.bind(this);
        this.webSocketListener=this.webSocketListener.bind(this);

        this.minioClient = new Minio.Client({
            endPoint: env.backendHost,
            port: env.minioPort,
            useSSL: false,
            accessKey: env.minioUser,
            secretKey: env.minioPass
        });

        this.bucketlist=[];
        this.RowsSelection = [];
        this.toggledClearRows=this.state={toggledClearRows:false};
        this.progressPrecentage=[0,0,0,0,0];
        this.waitMessage="";
        this.progressState=0;
        this.status=["","","","",""];
        this.isbold=[{},{},{},{},{}];
        
        this.minioClient.listBuckets().then(
            (data)=>{data.map((i)=>(async ()=> {await this.sumObject(i.name).then((resolve)=>{this.bucketlist=this.bucketlist.concat({"name":i.name,"creationDate":i.creationDate.toString(),"size":resolve});this.setState({selectedFile: null})})})());});
    }
   
    state={
        selectedFile: null
    };

    async sumObject(bucketName){
        var stream=this.minioClient.listObjectsV2(bucketName,'', true,'');
        return new Promise(function(resolve,reject){
        let bucketSize=0;
        stream.on('data', (obj)=>{bucketSize=bucketSize+obj.size;});
        stream.on('end' ,()=>{resolve(bucketSize);});
        });
    }

    onFileChange= event=> {
        this.setState({
            selectedFile: event.target.file[0]
        })
    };

    onPairFilterChange(e){
        this.pairFilter=e.target.value;
    }

    onNodeFilterChange(e){
        this.nodeFilter=e.target.value;
    }

    onWindowSizeChange(e){
        this.windowSize=e.target.value;
    }

    onCompressionMethodChange(e){
        this.compressionMethod=e.target.value;
    }

    webSocketListener(){
        (async () => {
            while(this.status[4]!="compressing randomtrace"){
                await new Promise(r => (async () => {
                    
                    const client = new W3CWebSocket(env.webSocket);
                    client.onopen = () => {
                        console.log('WebSocket Client Connected');
                    };
                    
                    client.onmessage = (message) => {
                        const reader = new FileReader();
                        reader.readAsText(message.data);
                        reader.onload = () => { 
                            switch (this.progressState) {
                                case 0:
                                    this.status[0]=reader.result;
                                    this.progressPrecentage[0]=this.progressPrecentage[0]+(100/(1+(this.nodeFilter=="yes")+(this.pairFilter=="yes")));//env.algoPercentage;
                                    if(this.progressPrecentage[0]>=98)
                                    {    
                                        this.progressState=1;
                                        this.isbold[0]={};
                                        this.isbold[1]={fontWeight: "bold"};
                                    }
                                    break;
                                case 1:
                                    this.status[1]=reader.result;
                                    this.progressPrecentage[1]=this.progressPrecentage[1]+33.3;//env.algoPercentage;
                                    if(this.progressPrecentage[1]>=98)
                                    {    
                                        this.progressState=2;
                                        this.isbold[1]={};
                                        this.isbold[2]={fontWeight: "bold"};
                                        this.isbold[3]={fontWeight: "bold"};
                                    }
                                    break;
                                case 2:
                                    let status=reader.result;
                                    if(status.includes("saving")) 
                                    {
                                        this.status[3]=status;
                                        this.progressPrecentage[3]=this.progressPrecentage[3]+33.3;//env.algoPercentage;
                                        if(this.progressPrecentage[3]>=98)
                                        {  
                                            this.progressState=3;
                                            this.isbold[2]={};
                                            this.isbold[3]={};
                                            this.isbold[4]={fontWeight: "bold"};
                                        }
                                        break;
                                    }
                                    this.status[2]=status;
                                    this.progressPrecentage[2]=this.progressPrecentage[2]+3.225;//env.algoPercentage;
                                    break;
                                case 3:
                                    this.status[4]=reader.result;
                                    this.progressPrecentage[4]=this.progressPrecentage[4]+33.3;//env.algoPercentage;
                                    if(this.progressPrecentage[4]>=98)
                                    {
                                        this.progressState=0;
                                        this.isbold[4]={};
                                        client.close();
                                        
                                        this.waitMessage="";
                                        this.setState({});
                                        (async ()=> {await new Promise(r => setTimeout(r, 1000));  alert("Finished Calculating the Complexity and saving it to DB, You can view the new Complexity at the Complexity Map tab");})();
                                    }
                                    break;
                                default:
                                    break;
                            } 
                            this.setState({});
                        };
                        //console.log(message.data);
                    };
                })())
            };
        })();
    }

    calculateComplexity(){
        const channel=JSON.stringify({"channel":this.RowsSelection[0]["name"].replaceAll('_','-')});
        axios.post(env.pubSub,channel);
        this.progressPrecentage=[0,0,0,0,0]; //initialize
        this.status=["","","","",""]; //initialize
        this.isbold=[{fontWeight: "bold"},{},{},{},{}];//initialize
        this.webSocketListener();
        if(this.RowsSelection.length>1){
            alert('you can only choose one file');
            return;
        }
        if(this.RowsSelection.length==0){
            alert('please select a file');
            return;
        }
        const out=JSON.stringify({"bucketName":this.RowsSelection[0]["name"].replaceAll('_','-'),"objectNumber":10,"traceName":this.RowsSelection[0]["name"],"traceSize":this.RowsSelection[0]["size"],"filter1":this.pairFilter,"filter2":this.nodeFilter,"windowSize":this.windowSize,"compressionMethod":this.compressionMethod});
        axios.post(env.algoURL,out);
        this.waitMessage="The Calculation will take several minutes";
    } 

    async removeBuckets(){
        for(var i=0;i<this.RowsSelection.length;i++)
        {
            for(let counter=0;counter<10;counter++)
                await this.minioClient.removeObject(this.RowsSelection[i]["name"].replaceAll('_','-'), counter.toString());
            await this.minioClient.removeBucket(this.RowsSelection[i]["name"].replaceAll('_','-')); 
        }

        this.setState({toggledClearRows:true});

        this.bucketlist=[];

        this.minioClient.listBuckets().then(
            (data)=>{data.map((i)=>(async ()=> {await this.sumObject(i.name).then((resolve)=>{this.bucketlist=this.bucketlist.concat({"name":i.name,"creationDate":i.creationDate.toString(),"size":resolve});this.setState({selectedFile: null,toggledClearRows:false});})})());this.setState({selectedFile: null,toggledClearRows:false});});
    }

    render = () => {
        return (<div>
            <div id='bucket'> 
            <DataTable title="Files Uploaded" columns={columns} data={this.bucketlist} defaultSirtFieldID={1} pagination selectableRows onSelectedRowsChange={({ selectedRows }) => {this.RowsSelection=selectedRows;}}  clearSelectedRows={this.state.toggledClearRows}/> 
            </div>
            <div id='calculate'>
            <label> Compression Method:</label>
            <select onChange={this.onCompressionMethodChange}>
            <option value="default">default</option>
            <option value="LZMA">LZMA</option>
            <option value="GZIP">GZIP</option>
            <option value="LZMA2">LZMA2</option>
            </select> 
            <br/>
            <label> Window Size:</label>
            <select onChange={this.onWindowSizeChange}>
            <option value="default">default</option>
            <option value="256k">256k</option>
            <option value="16m">16m</option>
            <option value="64m">64m</option>
            </select> 
            <br/>
            <label> Keep only requests that appears more than once:</label>
            <select onChange={this.onPairFilterChange}>
            <option value="no">no</option>
            <option value="yes">yes</option>
            </select>
            <br/>
            <label> Keep only nodes that appears both as source and destination:</label>
            <select onChange={this.onNodeFilterChange}>
            <option value="no">no</option>
            <option value="yes">yes</option>
            </select>
            <br/>
            <button className='btn' onClick={() => this.calculateComplexity()}>Calculate Complexity Parameters</button>
            <button className='btn' onClick={() => this.removeBuckets()}>Remove Buckets</button>
            </div>
            <div id='progress'>
            <Text style={this.isbold[0]}>{"1.Import trace and get trace parameters: ("+this.status[0].toString()+") "+parseInt(Math.ceil(this.progressPrecentage[0])).toString()+"%"}</Text>
            <LinearProgress variant="determinate" value={parseInt(Math.ceil(this.progressPrecentage[0]))} />
            </div>
            <div id='progress2'>
            <Text style={this.isbold[1]}>{"2.Prepare a set of shuffled traces: ("+this.status[1].toString()+") "+parseInt(Math.ceil(this.progressPrecentage[1])).toString()+"%"}</Text>
            <LinearProgress variant="determinate" value={parseInt(Math.ceil(this.progressPrecentage[1]))} />
            </div>
            <div id='progress3'>
            <Text style={this.isbold[2]}>{"3.Standardize traces: ("+this.status[2].toString()+") "+parseInt(Math.ceil(this.progressPrecentage[2])).toString()+"%"}</Text>
            <LinearProgress variant="determinate" value={parseInt(Math.ceil(this.progressPrecentage[2]))} />
            </div>
            <div id='progress4'>
            <Text style={this.isbold[3]}>{"4.Write each trace to memory as a binary file: ("+this.status[3].toString()+") "+parseInt(Math.ceil(this.progressPrecentage[3])).toString()+"%"}</Text>
            <LinearProgress variant="determinate" value={parseInt(Math.ceil(this.progressPrecentage[3]))} />
            </div>
            <div id='progress5'>
            <Text style={this.isbold[4]}>{"5.Compress each trace using the same parameters using an LZ algorithm: ("+this.status[4].toString()+") "+parseInt(Math.ceil(this.progressPrecentage[4])).toString()+"%"}</Text>
            <LinearProgress variant="determinate" value={parseInt(Math.ceil(this.progressPrecentage[4]))} />
            </div>
            <a>{this.waitMessage}</a>
        </div>
        )
    }
}
/*
<label> Choose Complexity Color:</label>
            <select onChange={this.onColorChange}>
            <option value="#0000FF">Blue</option>
            <option value="#00FF00">Green</option>
            <option value="#FFFF00">Yellow</option>
            <option value="#FF0000">Red</option>
            </select> 
*/

export default Complexity;