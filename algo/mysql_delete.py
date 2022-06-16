import pymysql
import json
import sys

def delete_point(trace_to_delete):
  env = json.load(open("environment.config.json", "r"))
  try:
    connection=pymysql.connect(host=env["host"],port=env["mysqlPort"],user="root",passwd=env["mysqlPass"],db=env["mysqlDB"])
    cursor=connection.cursor()
    cursor.execute("DELETE FROM traces WHERE trace='"+trace_to_delete["trace"]+"';")
    connection.commit()
    return cursor.fetchall()

  except Exception as error:
    print("Error while connecting to MySQL", error,flush=True, file=sys.stdout)
    return "Error while connecting to MySQL"
  finally:
    if connection:
      cursor.close()
      connection.close()
      print("MySQL connection is closed",flush=True, file=sys.stdout)