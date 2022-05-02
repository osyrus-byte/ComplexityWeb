from textwrap import wrap

def stringToBinary(s):
    binary=bytearray()
    s=wrap(s,8)
    for byte in s:
        binary.append(int(byte,2))
    return binary,8-len(s[-1])

def binaryToString(b):
    s=""
    for i in b:
        s=s+format(i,'b').zfill(8)
    return s

def byteShift(b1,b2,shift_number):
    b1=((b1<<shift_number)+(b2>>(8-shift_number)))&0xff
    b2=(b2<<shift_number)&0xff
    b2=b2>>shift_number
    return b1,b2

def binaryAdd(residue1,b1,residue2,b2): #save residue of added binary for next iteration
    newResidue=residue1
    b1[-1],b2[0]=byteShift(b1[-1],b2[0],residue1)

    for i in range(len(b2)-2):
        b2[i],b2[i+1]=byteShift(b2[i],b2[i+1],residue1)
        b1.append(b2[i])

    if(residue2==0): #residue1 is saved
        b2[-2],b2[-1]=byteShift(b2[-2],b2[-1],residue1)
        b1.append(b2[-2])
        b1.append(b2[-1])
    elif((residue1+residue2)>=8):
        b2[-2]=(b2[-2]<<residue1)+b2[-1]#&0xff
        b1.append(b2[-2])
        newResidue=residue1+residue2-8
    elif((residue1+residue2)<8):
        b2[-2] = (b2[-2]<<residue1) + (b2[-1] >> (8-abs(residue1-residue2)))
        b1.append(b2[-2])
        b2[-1]=(((b2[-1]<<(residue1+residue2))&0xff)>>(residue1+residue2)) #save number at the end of residue for next addition, for final need to fix
        b1.append(b2[-1])
        newResidue=residue1+residue2
    return b1,newResidue
