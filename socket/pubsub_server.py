import json
import redis
import gevent
from flask import Flask
from flask import request
from flask_cors import CORS, cross_origin
from flask_sockets import Sockets
import sys

env = json.load(open("environment.config.json", "r"))

redis_url = env["redisURL"]

#connection = redis.StrictRedis.from_url(redis_url, decode_responses=True)
connection= redis.Redis(host=env["host"], password=env["redisPass"], port=env["redisPort"], db=0)

class PubSubListener(object):
    def __init__(self):
        self.clients = []
        self.channel=''
        self.pubsub = connection.pubsub(ignore_subscribe_messages=False)
        #self.pubsub.subscribe(**{channel: self.handler})
        self.thread = self.pubsub.run_in_thread(sleep_time=0.001)

    def register(self, client):
        print("got in register", flush=True,file=sys.stdout)
        self.clients.append(client)

    def handler(self, message):
        _message = message['data']
        print(message, flush=True,file=sys.stdout)
        if type(_message) != int:
            self.send(_message)

    def send(self, data):
        for client in self.clients:
            try:
                print(data)
                client.send(data)
            except Exception:
                self.clients.remove(client)

pslisteners = []

app = Flask(__name__)
sockets = Sockets(app)

@sockets.route('/echo')
def echo_socket(ws):
    print("got in echo", flush=True,file=sys.stdout)
    pslisteners[-1].register(ws) #if someone is not connecting immideatly to the channel there will be problem

    while not ws.closed:
        gevent.sleep(0.1)

@app.route('/setchannel',methods=['GET','POST','OPTIONS'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def setchannel():
    data=json.loads(request.get_data().decode('utf-8'))
    pslistener = PubSubListener()
    pslistener.pubsub.subscribe(**{data["channel"]: pslistener.handler})
    pslisteners.append(pslistener)
    return 'ok'

if __name__ == "__main__":
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler
    print("Started")
    server = pywsgi.WSGIServer(('', env["webSocketPort"]), app, handler_class=WebSocketHandler)
    server.serve_forever()