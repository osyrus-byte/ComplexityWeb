import React from "react";
import axios from "axios";
import * as Minio from "minio";
import DataTable from "react-data-table-component";
import LinearProgress from "@material-ui/core/LinearProgress";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import * as env from "../env/enviroment.config.json";

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
  }]/*,
  {id : 3,
    name: "Size",
    selector: (row) => row.Size,
    sortable : true,
    maxWidth: '200px',
    reorder : true
  }]*/

  class Complexity extends React.Component {
    constructor(props) {
        super(props);
        this.color="#0000FF";
        this.windowSize="default"; 
        this.compressionMethod="default"; 
        this.onColorChange=this.onColorChange.bind(this);
        this.calculateComplexity=this.calculateComplexity.bind(this);
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
        this.statusPrecentage=0;
        this.status="Idle";
        (async ()=> {await this.minioClient.listBuckets().then((data)=>{this.bucketlist=data.map((i) => ({"name":i.name,"creationDate":i.creationDate.toString()}));this.setState({selectedFile: null});});})();
    }

    state={
        selectedFile: null
    };

    onFileChange= event=> {
        this.setState({
            selectedFile: event.target.file[0]
        })
    };

    onColorChange(e){
        this.color=e.target.value;
    }

    onWindowSizeChange(e){
        this.windowSize=e.target.value;
    }

    onCompressionMethodChange(e){
        this.compressionMethod=e.target.value;
    }

    webSocketListener(){
        (async () => {
            while(this.status!="finished"){
                await new Promise(r => (async () => {
                    
                    const client = new W3CWebSocket(env.webSocket);
                    client.onopen = () => {
                        console.log('WebSocket Client Connected');
                    };
                    
                    client.onmessage = (message) => {
                        const reader = new FileReader();
                        reader.readAsText(message.data);
                        reader.onload = () => { 
                            this.status=reader.result;
                            this.statusPrecentage=this.statusPrecentage+env.algoPercentage; 
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
        this.webSocketListener();
        if(this.RowsSelection.length>1){
            alert('you can only choose one file');
            return;
        }
        if(this.RowsSelection.length==0){
            alert('please select a file');
            return;
        }
        const out=JSON.stringify({"bucketName":this.RowsSelection[0]["name"].replaceAll('_','-'),"objectNumber":10,"traceName":this.RowsSelection[0]["name"],"color":this.color,"windowSize":this.windowSize,"compressionMethod":this.compressionMethod});
        axios.post("http://ec2-18-118-19-224.us-east-2.compute.amazonaws.com:3500/data_upload",out);
    } 


    render = () => {
        return (<div>
            <div id='bucket'> 
            <DataTable title="Files Uploaded" columns={columns} data={this.bucketlist} defaultSirtFieldID={1} pagination selectableRows onSelectedRowsChange={({ selectedRows }) => {this.RowsSelection=selectedRows;}}/> 
            </div>
            <div id='calculate'>
            <label> Choose Compression Method:</label>
            <select onChange={this.onCompressionMethodChange}>
            <option value="default">default</option>
            <option value="LZMA">LZMA</option>
            <option value="GZIP">GZIP</option>
            <option value="LZMA2">LZMA2</option>
            </select> 
            <label> Choose Window Size:</label>
            <select onChange={this.onWindowSizeChange}>
            <option value="default">default</option>
            <option value="256k">256k</option>
            <option value="16m">16m</option>
            <option value="64m">64m</option>
            </select> 
            <label> Choose Complexity Color:</label>
            <select onChange={this.onColorChange}>
            <option value="#0000FF">Blue</option>
            <option value="#00FF00">Green</option>
            <option value="#FFFF00">Yellow</option>
            <option value="#FF0000">Red</option>
            </select> 
            <button className='btn' onClick={() => this.calculateComplexity()}>Calculate Complexity Parameters</button>
            </div>
            <center>
            <div id='progress'>
            <h1>{parseInt(Math.ceil(this.statusPrecentage)).toString()+"%"}</h1>
            <LinearProgress variant="determinate" value={parseInt(Math.ceil(this.statusPrecentage))} />
            <h1>{this.status.toString()}</h1>
            </div>
            </center>
        </div>
        )
    }
}

export default Complexity;