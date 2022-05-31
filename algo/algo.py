import random
import time

import numpy as np
import hashlib
import subprocess
from datetime import datetime
import sys
import redis
import binaryfunctions as bin
import json


def data_parser(data):
    new_data = []
    for entry in data.split("\n"):
        new_data.append(entry)
    return new_data


def remove_outliers(data):  # function to remove outliers from the data
    pair_list = []
    to_remove = []

    # num_of_rows_to_print=10
    # print("csv file data:\n",text[:num_of_rows_to_print],flush=True, file=sys.stdout)

    for entry in data:  # extracting data to list of sources and destinations inorder
        pair_list.append(entry.split(",")[1] + "," + entry.split(",")[2])

    (pair_unique, pair_counts) = np.unique(pair_list, return_counts=True)  # find unique ID's and their amount

    pair_unique = list(pair_unique)
    pair_counts = list(pair_counts)

    for pair in pair_unique:
        if pair_counts[pair_unique.index(pair)]==1: to_remove.append(pair)

    new_data = []
    for entry in data:
        if (entry.split(",")[1] +","+ entry.split(",")[2]) in to_remove: continue
        new_data.append(entry)
    return new_data

def remove_outliers2(data):  # function to remove outliers from the data
    source_ip = []
    dest_ip = []
    common_list = []
    to_remove = []

    # num_of_rows_to_print=10
    # print("csv file data:\n",text[:num_of_rows_to_print],flush=True, file=sys.stdout)

    for entry in data:  # extracting data to list of sources and destinations inorder
        source_ip.append(int(entry.split(",")[1]))
        dest_ip.append(int(entry.split(",")[2]))

    common_list = list(set(source_ip).intersection(dest_ip))
    (source_unique, source_counts) = np.unique(source_ip, return_counts=True)  # find unique ID's and their amount

    source_unique = list(source_unique)
    source_counts = list(source_counts)

    for id in source_unique:
        if id not in common_list:
            to_remove.append(id)
    # for id in source_counts:
    # if source_unique[source_counts.index(id)] not in common_list:
    # to_remove.append(source_unique[source_counts.index(id)])
    # else if id==1:
    # to_remove.append(source_unique[source_counts.index(id)])

    (dest_unique, dest_counts) = np.unique(dest_ip, return_counts=True)  # find unique ID's and their amount

    dest_unique = list(dest_unique)
    dest_counts = list(dest_counts)

    for id in dest_unique:
        if id not in common_list:
            to_remove.append(id)

    # for id in dest_counts:
    # if dest_unique[dest_counts.index(id)] not in common_list:
    # to_remove.append(dest_unique[dest_counts.index(id)])
    # if id == 1:
    # to_remove.append(dest_unique[dest_counts.index(id)])

    new_data = []
    for entry in data:
        if int(entry.split(",")[1]) in to_remove: continue
        if int(entry.split(",")[2]) in to_remove: continue
        new_data.append(entry)
    return new_data

def get_Complexity(data,traceName,windowSize,method,filter1,filter2):  # the function receive data and compute the temporal and nontemporal complexities
    env = json.load(open("enviroment.config.json", "r"))
    r = redis.Redis(host=env["host"], password=env["redisPass"], port=env["redisPort"], db=0)
    r.publish(str(traceName), "Importing trace")
    time.sleep(1)
    data=data_parser(data)
    if(filter1=="yes"):
        r.publish(str(traceName), "Keeping only requests that appears more than once")
        data = remove_outliers(data)
        time.sleep(1) #need to improve pubsub
    if (filter2=="yes"):
        r.publish(str(traceName), "Keeping only nodes that appears both as source and destination")
        data = remove_outliers2(data)
        time.sleep(1) #need to improve pubsub

    if(data==[]):
        print("all data was filered",flush=True,file=sys.stdout)
        raise ValueError("all data was filered")

    num_of_rows_to_print = 10
    # print("csv file data without outliers:\n",data[:num_of_rows_to_print],flush=True, file=sys.stdout)
    originalTrace = []
    rowShuffledTrace = []
    index = 0

    r.publish(str(traceName), "creating original trace")
    time.sleep(1) #need to improve pubsub

    try:
        for entry in data:  # extracting data to list of sources and destinations inorder
            index = index + 1
            originalTrace.append(int(entry.split(",")[1]))
            originalTrace.append(int(entry.split(",")[2]))
    except:
        print("error at csv.file in line:")
        print(index,flush=True,file=sys.stdout)

    # print("originalTrace data:\n",originalTrace[:num_of_rows_to_print],flush=True, file=sys.stdout)

    r.publish(str(traceName), "creating rowshuffeled trace")
    time.sleep(1) #need to improve pubsub

    for entry in data:  # extracting the data to list of lists, each list represent row
        rowShuffledTrace.append([int(entry.split(",")[1]), int(entry.split(",")[2])])
    random.shuffle(rowShuffledTrace)  # shuffling rows to perform a uniform random permutation of the rows
    
    rowShuffledTrace = list(np.concatenate(rowShuffledTrace))  # turning the list of lists to a list
    # print("rowShuffledTrace data:\n",rowShuffledTrace[:num_of_rows_to_print],flush=True, file=sys.stdout)

    r.publish(str(traceName), "creating random trace")
    time.sleep(1) #need to improve pubsub
    (unique, counts) = np.unique(originalTrace, return_counts=True)  # find unique ID's and their amount
    uniqueNodes= len(unique)
    # print(unique)
    randomShuffeledTrace = []
    random.seed()
    for i in originalTrace:  # creating uniform random transformationfrom of the data by choosing uniformly from list of unique id's
        randomShuffeledTrace.append(unique[random.randint(0, len(unique) - 1)])
    # print("randomShuffledTrace data:\n",randomShuffeledTrace[:num_of_rows_to_print],flush=True, file=sys.stdout)

    r.publish(str(traceName), "creating hash mapping")
    time.sleep(1) #need to improve pubsub
    sha512_list = []
    m = int(2 * np.ceil(np.log2(
        len(unique))))  # computing paramter m for the amount of least significant bit's to take from the hash on the unique id's
    number_of_bits = m
    m = int((2 ** m) - 1)
    # print("number_of_bits from lsb to get:",number_of_bits)
    for i in unique:
        hash = hashlib.sha512()
        hash.update(int(i).to_bytes(int(np.ceil(int(i).bit_length() / 8)), 'big'))
        sha512_list.append(int(hash.hexdigest(),
                               16) & m)  # computing the sha512 hash for unique id's with m least significant bit's, 16 for the amount of hexa digits in each hash
    # print("hashing of m bits list:",sha512_list[:num_of_rows_to_print],flush=True, file=sys.stdout)

    '''
    # map file
    mapping = open("mapping.txt", "w")
    for i in range(len(sha512_list)):
        mapping.write(str(str(unique[i]) + ",\"" + str(format(sha512_list[i], 'b').zfill(number_of_bits)) + "\"\n"))
    mapping.close()
    '''
    r.publish(str(traceName), "standarizing random trace")
    time.sleep(1) #need to improve pubsub

    # Replacing each of the original IDs in the trace with the new hashed IDs-standardized traces
    replaced_trace_binary,residue=bin.stringToBinary(format(sha512_list[list(unique).index(randomShuffeledTrace[0])], 'b').zfill(number_of_bits))
    #print_list = []
    index=0

    for i in randomShuffeledTrace[1:]:
        hash,hashresidue=bin.stringToBinary(format(sha512_list[list(unique).index(i)], 'b').zfill(number_of_bits))
        replaced_trace_binary,residue = bin.binaryAdd(residue,replaced_trace_binary,hashresidue,hash)

        index = index + 1
        if (index % int(len(randomShuffeledTrace) / 10) == 0):
            r.publish(str(traceName), "standarizing random trace")
        #print_list.append(sha512_list[list(unique).index(i)])
    # print(replaced_trace)

   # print("uncompressed randomtrace: (not in binary) \n", print_list[:num_of_rows_to_print], flush=True,
          #file=sys.stdout)

    '''
    print("int_array_list: \n", int_array_list[:num_of_rows_to_print], flush=True, file=sys.stdout)
    print("uncompressed randomtrace: (string like binary) \n", replaced_trace[:num_of_rows_to_print * 8], flush=True,
          file=sys.stdout)
    print("uncompressed randomtrace: (binary) \n", bytearray(int_array_list)[:num_of_rows_to_print], flush=True,
          file=sys.stdout)
    '''
    replaced_trace_binary[-1]=(replaced_trace_binary[-1]<<residue)

    r.publish(str(traceName), "saving random trace in memory")
    time.sleep(1) #need to improve pubsub

    file = open("uncompressed_randomtrace.b",
                "wb")  # creating binary file in write mode to save the trace for the compression
    file.write(replaced_trace_binary)
    file.close()

    r.publish(str(traceName), "standarizing rowshuffledtrace")
    time.sleep(1) #need to improve pubsub

    replaced_trace_binary,residue=bin.stringToBinary(format(sha512_list[list(unique).index(rowShuffledTrace[0])], 'b').zfill(number_of_bits))
    #print_list = []
    index = 0

    for i in rowShuffledTrace[1:]:
        hash, hashresidue = bin.stringToBinary(format(sha512_list[list(unique).index(i)], 'b').zfill(number_of_bits))
        replaced_trace_binary, residue = bin.binaryAdd(residue, replaced_trace_binary, hashresidue, hash)

        index = index + 1
        if (index % int(len(rowShuffledTrace) / 10) == 0):
            r.publish(str(traceName), "standarizing rowshuffledtrace")
    # print(replaced_trace)

    #print("uncompressed rowShuffledtrace: (not in binary) \n", print_list[:num_of_rows_to_print], flush=True,
          #file=sys.stdout)

    '''
    print("int_array_list: \n", int_array_list[:num_of_rows_to_print], flush=True, file=sys.stdout)
    print("uncompressed rowshuffledtrace: (string like binary) \n", replaced_trace[:num_of_rows_to_print * 8],
          flush=True, file=sys.stdout)
    print("uncompressed rowshuffledtrace: (binary) \n", bytearray(int_array_list)[:num_of_rows_to_print], flush=True,
          file=sys.stdout)
    '''
    r.publish(str(traceName), "saving rowshuffledtrace in memory")
    time.sleep(1) #need to improve pubsub

    file = open("uncompressed_rowshuffledtrace.b",
                "wb")  # creating binary file in write mode to save the trace for the compression
    file.write(replaced_trace_binary)
    file.close()

    r.publish(str(traceName), "standarizing originaltrace")
    time.sleep(1) #need to improve pubsub

    replaced_trace_binary, residue = bin.stringToBinary(format(sha512_list[list(unique).index(originalTrace[0])], 'b').zfill(number_of_bits))
    #print_list = []
    index=0

    for i in originalTrace[1:]:
        hash, hashresidue = bin.stringToBinary(format(sha512_list[list(unique).index(i)], 'b').zfill(number_of_bits))
        replaced_trace_binary, residue = bin.binaryAdd(residue, replaced_trace_binary, hashresidue, hash)

        index=index+1
        if(index% int(len(originalTrace)/ 10) ==0):
            r.publish(str(traceName), "standarizing originaltrace")

    # print(replaced_trace)

    #print("uncompressed originaltrace: (not in binary) \n", print_list[:num_of_rows_to_print], flush=True,
          #file=sys.stdout)

    '''
    print("int_array_list: \n", int_array_list[:num_of_rows_to_print], flush=True, file=sys.stdout)
    print("uncompressed originaltrace: (string like binary) \n", replaced_trace[:num_of_rows_to_print * 8], flush=True,
          file=sys.stdout)
    print("uncompressed originaltrace: (binary) \n", bytearray(int_array_list)[:num_of_rows_to_print], flush=True,
          file=sys.stdout)
    '''
    r.publish(str(traceName), "saving originaltrace in memory")
    time.sleep(1) #need to improve pubsub

    file = open("uncompressed_originaltrace.b",
                "wb")  # creating binary file in write mode to save the trace for the compression
    file.write(replaced_trace_binary)
    file.close()

    #r.publish(str(traceName), "compressing all traces")
    start_time = datetime.now()  # checking time for compressions

    if(method=="default"): method=""
    else: method="-mm="+method
    if(windowSize=="default"): windowSize=""
    else: windowSize="-md="+windowSize

    r.publish(str(traceName), "compressing originaltrace")
    time.sleep(1) #need to improve pubsub

    subprocess.run(
        ["7za", "a", "-tzip", method, windowSize, "compressed_originaltrace.b", "uncompressed_originaltrace.b"],
        stdout=subprocess.PIPE, universal_newlines=True)  # using subprocess to compress the file with 7zip

    print("time for subprocess of compression original trace=", datetime.now() - start_time, flush=True,
          file=sys.stdout)

    r.publish(str(traceName), "compressing rowshuffledtrace")
    time.sleep(1) #need to improve pubsub

    subprocess.run(["7za", "a", "-tzip", method, windowSize, "compressed_rowshuffledtrace.b",
                    "uncompressed_rowshuffledtrace.b"], stdout=subprocess.PIPE,
                   universal_newlines=True)  # using subprocess to compress the file with 7zip

    print("time for subprocess of compression rowshuffled trace=", datetime.now() - start_time, flush=True,
          file=sys.stdout)

    r.publish(str(traceName), "compressing randomtrace")
    time.sleep(1) #need to improve pubsub

    subprocess.run(
        ["7za", "a", "-tzip", method, windowSize, "compressed_randomtrace.b", "uncompressed_randomtrace.b"],
        stdout=subprocess.PIPE, universal_newlines=True)  # using subprocess to compress the file with 7zip

    print("time for subprocess of compression random trace=", datetime.now() - start_time, flush=True, file=sys.stdout)

    # getting the size of each compressed file from the directory representation of linux
    result = subprocess.run(["ls", "-la"], stdout=subprocess.PIPE, universal_newlines=True)
    result = result.stdout.split()

    size_of_compressed_originaltrace = int(result[result.index("compressed_originaltrace.b") - 4])
    size_of_compressed_rowshuffledtrace = int(result[result.index("compressed_rowshuffledtrace.b") - 4])
    size_of_compressed_randomtrace = int(result[result.index("compressed_randomtrace.b") - 4])


    # computing the complexities as in the article
    Temporal_Trace_Complexity = size_of_compressed_originaltrace / size_of_compressed_rowshuffledtrace
    Non_Temporal_Trace_Complexity = size_of_compressed_rowshuffledtrace / size_of_compressed_randomtrace

    print(Temporal_Trace_Complexity, Non_Temporal_Trace_Complexity, flush=True, file=sys.stdout)
    if Non_Temporal_Trace_Complexity > 1: Non_Temporal_Trace_Complexity = 1  # dealing with inputs that LZ doesn't compress well

    #r.publish(str(traceName), "finished")

    return Temporal_Trace_Complexity, Non_Temporal_Trace_Complexity, uniqueNodes