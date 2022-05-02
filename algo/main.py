import flask
from flask import make_response,request
from flask_cors import CORS, cross_origin
import json

import pg_query
import mysql_query
import dataloader

env = json.load(open("enviroment.config.json", 'r'))

app = flask.Flask(__name__)
cors = CORS(app, resources={r"/getpoints": {"origins" : "*"}})
app.config['CORE_HEADERS'] = 'Content-Type'

@app.route("/postgresql_getpoints",methods=['GET','POST','OPTIONS'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def postgresql_getpoints():
    #return make_response({'point':str(query.get_points())},200)
    return flask.jsonify(pg_query.get_points())

@app.route("/mysql_getpoints",methods=['GET','POST','OPTIONS'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def mysql_getpoints():
    return flask.jsonify(mysql_query.get_points())

@app.route("/data_upload",methods=['GET','POST','OPTIONS'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def data_upload():
    #print(json.loads(request.get_data().decode('utf-8'))[0],file=sys.stdout,flush=True)
    return flask.jsonify(dataloader.upload(json.loads(request.get_data().decode('utf-8'))))

app.run(host=env["appHost"],port=env["algoPort"])


