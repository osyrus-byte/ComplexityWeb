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
        # Executing a SQL query to insert data into  table
        #insert_query = """ INSERT INTO mobile (ID, MODEL, PRICE) VALUES (1, 'Iphone12', 1100)"""
        #cursor.execute(insert_query)
        #connection.commit()
        #print("1 Record inserted successfully")
        # Fetch result
        cursor.execute("SELECT * from traces")
        return cursor.fetchall()
        #print("Result ", record)

        # Executing a SQL query to update table
        #update_query = """Update mobile set price = 1500 where id = 1"""
        #cursor.execute(update_query)
        #connection.commit()
        #count = cursor.rowcount
        #print(count, "Record updated successfully ")
        # Fetch result
        #cursor.execute("SELECT * from mobile")
        #print("Result ", cursor.fetchall())

        # Executing a SQL query to delete table
        #delete_query = """Delete from mobile where id = 1"""
        #cursor.execute(delete_query)
        #connection.commit()
        #count = cursor.rowcount
        #print(count, "Record deleted successfully ")
        # Fetch result
        #cursor.execute("SELECT * from mobile")
        #print("Result ", cursor.fetchall())

    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL", error)
        return "Error while connecting to PostgreSQL"
    finally:
        if connection:
            cursor.close()
            connection.close()
            print("PostgreSQL connection is closed")
