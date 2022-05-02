import pymysql
import json

def get_points():
  env = json.load(open("enviroment.config.json", "r"))
  try:
    connection=pymysql.connect(host=env["host"],port=env["mysqlPort"],user="root",passwd=env["mysqlPass"],db=env["mysqlDB"])
    cursor=connection.cursor()
    cursor.execute("SELECT * FROM traces")
    connection.commit()
    return cursor.fetchall()

  except Exception as error:
    print("Error while connecting to MySQL", error)
    return "Error while connecting to MySQL"
  finally:
    if connection:
      cursor.close()
      connection.close()
      print("MySQL connection is closed")
            