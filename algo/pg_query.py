import psycopg2
import json
def get_points():
    env = json.load(open("enviroment.config.json", "r"))
    try:
        connection = psycopg2.connect(user=env["postgresqlUser"],
                                      password=env["postgresqlPass"],
                                      host=env["host"],
                                      port=env["postgresqlPort"],
                                      database="postgres")

        cursor = connection.cursor()
        cursor.execute("SELECT * from traces")
        return cursor.fetchall()


    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL", error)
        return "Error while connecting to PostgreSQL"
    finally:
        if connection:
            cursor.close()
            connection.close()
            print("PostgreSQL connection is closed")
