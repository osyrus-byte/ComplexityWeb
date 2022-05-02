import React from "react";
import * as Minio from "minio";
import LinearProgress from "@material-ui/core/LinearProgress";
import * as env from "../env/enviroment.config.json";

class FileLoader extends React.Component {
    constructor(props) {
        super(props);
        this.text=null;
        this.filetext ="";
        this.Name='';
        this.onNameChange=this.onNameChange.bind(this);
        this.uploadFile=this.uploadFile.bind(this);
        this.minioClient = new Minio.Client({
            endPoint: env.backendHost,
            port: env.minioPort,
            useSSL: false,
            accessKey: env.minioUser,
            secretKey: env.minioPass
        });
    }

    state={
        progress: 0
    };

    onNameChange(e){
        this.Name=e.target.value;
    }

    showFile = async (e) => {
        e.preventDefault()
        const reader = new FileReader()
        reader.onload = async (e) => { 
            this.text = (e.target.result);
            //this.jsonify = this.jsonify.concat(this.text.split("\n").map((i) => ({"seq_nr":Number(i.replace('\r','').split(",")[0]),"srcip":Number(i.replace('\r','').split(",")[1]),"dstip":Number(i.replace('\r','').split(",")[2])}))); 
        }
        reader.readAsText(e.target.files[0]);
        this.filetext=e.target.files[0].name;
        this.setState({});
      }

    uploadFile(){
        
        (async () => {

        this.state.progress=0;
        this.setState({progress: 0});

        await this.minioClient.makeBucket(this.Name.replaceAll('_','-'), 'us-east-2', function(err) {
            if (err) return console.log('Error creating bucket.', err)
            console.log('Bucket created successfully in "us-east-2".')
        })

        const chunkSize = Math.ceil(this.text.length/10);
        //var objectList=this.text.match(new RegExp("[\\s\\S]{1,"+chunkSize.toString()+"}","g")) || [];
        var objectList=[];
        var lastSplit = 0;
        var objectCounter=0;
        while (lastSplit < this.text.length) {
            var limit   = this.text.length - lastSplit > chunkSize ? chunkSize : this.text.length - lastSplit;
            objectList[objectCounter] = this.text.slice(lastSplit, lastSplit + limit);
            lastSplit += limit;
            objectCounter++;
        }

        for(var objectCounter=0;objectCounter<10;objectCounter++){
            (async ()=> {await this.minioClient.putObject(this.Name.replaceAll('_','-'), objectCounter.toString(), JSON.stringify(objectList[objectCounter]), {});
                this.setState({progress: (this.state.progress+10)});
                if(this.state.progress==100) 
                {
                await new Promise(r => setTimeout(r, 1000));
                alert("Done uplodaing file");
                }
            })();
        }
        //(async ()=> {await this.minioClient.listBuckets().then((data)=>{this.bucketlist=data.map((i) => ({"name":i.name,"creationDate":i.creationDate.toString()}));this.setState({selectedFile: null});});})();
        })();
    }
    
    render = () => {
        return (<div>
            <div id='upload'>
            <label>Enter Name for the trace:</label>
            <input type="string" onChange={this.onNameChange} />
            <label className="btn"><input className='fileInput' type="file" onChange={(e) => this.showFile(e)} />Choose file</label>
            <label>{this.filetext}</label>
            <button className='btn' onClick={() => this.uploadFile()}>Upload file</button>
            </div>
            <center>
            <div id='progress'>
            <h1>{this.state.progress.toString()+"%"}</h1>
            <LinearProgress variant="determinate" value={this.state.progress} />
            </div>
            </center>
        </div>
        )
    }
}

export default FileLoader;