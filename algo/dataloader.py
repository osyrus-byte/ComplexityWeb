import pymysql
import psycopg2
import algo
import sys
import json
import time
from minio import Minio

def upload(req):
    env=json.load(open("enviroment.config.json","r"))
    try:
        connection = pymysql.connect(host=env["host"], port=env["mysqlPort"], user="root",
                                     passwd=env["mysqlPass"], db=env["mysqlDB"])
        cursor = connection.cursor()
    except Exception as error:
        print("Error while connecting to MySQL", error, flush=True)

    try:
        cursor.execute(
            "CREATE TABLE traces (trace VARCHAR (255) PRIMARY KEY, temporal real,nontemporal real,color VARCHAR (255),compression VARCHAR (255),windowsize VARCHAR (255));")
        connection.commit()
    except Exception as error:
        print("Error while creating table", error, flush=True)

    bucketName=req["bucketName"]
    objectNumber=req["objectNumber"]
    print("bucketName=",bucketName," and objectNumber=",objectNumber,flush=True)

    client=Minio(env["minioURL"],access_key=env["minioUser"],secret_key=env["minioPass"],region="us-east-2",secure=False)

    data=""

    for i in range(objectNumber):
        try:
            res = client.get_object(bucketName,str(i))
        except Exception as error:
            print("Error while getting object from bucket:", error, flush=True)
            continue

        data=data+json.loads(res.read().decode('utf-8'))
        res.close()
        res.release_conn()

    print("Starting algorithms, trace=",req["traceName"],flush=True)
    Temporal_Trace_Complexity,Non_Temporal_Trace_Complexity = algo.get_Complexity(data,req["traceName"],req["windowSize"],req["compressionMethod"])

    full_trace_name=req["traceName"] + "." + req["compressionMethod"] + "." + req["windowSize"]

    cmd = "INSERT INTO traces (trace,temporal,nontemporal,color,compression,windowsize) VALUES (\'" + full_trace_name +"\'," + str(Temporal_Trace_Complexity) +","+str(Non_Temporal_Trace_Complexity)+","+"\'" + req["color"] +"\'"+ ","+"\'" + req["compressionMethod"] +"\'"+","+"\'" + req["windowSize"] +"\'"+");"
    cursor.execute(cmd)
    connection.commit()

    #cursor.execute("SELECT * FROM traces")
    #connection.commit()
    #ans = cursor.fetchall()

    cursor.close()
    connection.close()

    return "200"