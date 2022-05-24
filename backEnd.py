from tracemalloc import start
from flask import Flask, render_template, Response, jsonify, request
import json
from pandas import reset_option
import random
import requests
import copy
import time

# Classes

# Node Class
class node:
    def __init__(self, id, type, flag, lat, long):
        self.id = id
        self.type = type # 0: car, 1: start, 2:end
        self.isAccessible = flag
        self.lat = lat
        self.long = long

# Edge Class
class edge:
    def __init__(self, id, startNodeId, endNodeId, weight, polyLine):
        self.id = id
        self.startNodeId = startNodeId # start point of an edge
        self.endNodeId = endNodeId # end point of an edge
        self.weight = weight # distance between two points
        self.polyLine = polyLine # google polyline encripted value for this path

# Graph Class
class graph:
    def __init__(self):
        self.adjList = [[]] # list of edges
        self.nodes = [] # list of nodes
        self.nodeCounter = 0 # points to the next free node id
        self.edgeCounter = 0 # points to the next free edge id 
    
    def getNodeFromId(self, nodeId):
        for n in self.nodes:
            if n.id == nodeId:
                return n
    
    def getEdgeFromEdgeNodes(self, node1, node2):
        for e in self.adjList[node1]: # loops over all the edges related to the start node
            if e.endNodeId == node2: # if the edge is equal to the end node return it
                return e
        return -1 # -1 means there is no edge between the two entered nodes 
    
    def addNode(self, type, flag, lat, long):
        self.nodes.append(node(self.nodeCounter, type, flag, lat, long))
        self.nodeCounter += 1
        self.adjList.append([])
    
    def addEdge(self, startNode, endNode, weight, polyline):
        self.adjList[startNode].append(edge(self.edgeCounter, startNode, endNode, weight, polyline))
        self.edgeCounter += 1
    
    def calcEdgeWeight(self, startNode, endNode):
        s = self.getNodeFromId(startNode) # getting the start and end nodes 
        e = self.getNodeFromId(endNode)

        r = requests.get('http://127.0.0.1:5000/route/v1/driving/'+ str(s.long) +','+ str(s.lat) +';'+ str(e.long) +','+ str(e.lat) +'?steps=false') # makes a request using the pos of the start and end nodes
        data = r.json() # converts the json data to a readable format

        return data['routes'][0]['distance'], data['routes'][0]['geometry'] # returns the distance to be used as the weight of an edge and the polyline
    
    def addCar(self, loc):
        self.addNode(0, False, loc[1], loc[0]) # car always has a type value of 0

        for node in self.nodes:
            if node.type == 1: # add a connection from the new car to all the starting nodes 
                w, l = self.calcEdgeWeight(self.nodeCounter-1, node.id)
                self.addEdge(self.nodeCounter-1, node.id, w, l)

    def addTrip(self, start, end):
        self.addNode(1, True, start[1], start[0]) # add the start node of a trip
        self.addNode(2, False, end[1], end[0]) # add the end node of a trip

        for node in self.nodes:
            if node.id != self.nodeCounter-1 and node.id != self.nodeCounter-2: # add an edge from every node to the new start and end nodes 
                w, l = self.calcEdgeWeight(node.id, self.nodeCounter-2)
                self.addEdge(node.id, self.nodeCounter-2, w, l)
                if node.type != 0: # if not a car
                    w, l = self.calcEdgeWeight(node.id, self.nodeCounter-1)
                    self.addEdge(node.id, self.nodeCounter-1, w, l) # add an edge from every node to the new end node (execpt form cars)

            if node.type != 0 and node.id != self.nodeCounter-2: # add an edge from the new start node to all the other start and end nodes
                w, l = self.calcEdgeWeight(self.nodeCounter-2, node.id)
                self.addEdge(self.nodeCounter-2, node.id, w, l)

            if node.type != 0 and node.id != self.nodeCounter-1 and node.id != self.nodeCounter-2: # add an edge from the new end node to all the other end and start nodes
                w, l = self.calcEdgeWeight(self.nodeCounter-1, node.id)
                self.addEdge(self.nodeCounter-1, node.id, w, l)
    
    # Functions for testing 

    def printAdjList(self):
        for x in range(0, len(self.adjList)):
            print(x, ": ", end =" ")
            for y in self.adjList[x]:
                print(y.endNodeId, end =" ")
            print("")

#Tabu Search
carSize = 3
def initSolution2(graph): # used to randomly generate a solution 
    solutions = []
    visited = [False] * len(graph.nodes) # will indicate if a node has been visited yet
    
    nodePointer = 0


    for n in graph.nodes:
        solution = []
        if n.type == 0: # finds a car as the starting point
            solution.append(n.id)
            visited[n.id] = True
            s = 0
            while s < carSize and s < (len(graph.nodes)/2)-1:
                if graph.getNodeFromId(nodePointer).type != 0:
                    solution.append(nodePointer)
                    solution.append(nodePointer + 1)

                    nodePointer += 2
                    s += 1
                else:
                    nodePointer += 1

            solutions.append(solution)

    return solutions

def neighborhood2(solutions, graph): # returns all the possible swaps for a given solution 
    neighborhood = []
    neighborhood2 = []

    for s in range(len(solutions)):
        for x in range(1, len(solutions[s])):
            for y in range(x + 1, len(solutions[s])):
                newSolution = copy.deepcopy(solutions)
                newSolution[s][x], newSolution[s][y] = newSolution[s][y], newSolution[s][x] # swap 2 values 
                if checkSolution(newSolution[s], graph) == True: # check if swap is valid
                    neighborhood.append(newSolution) # if swap is good add it to the list 
        
    for s in range(len(solutions)):
        for pos in range(1, len(solutions[s])):
            if graph.getNodeFromId(solutions[s][pos]).type == 1:
                start = pos
                end = solutions[s].index(graph.getNodeFromId(solutions[s][pos]+1).id)

                for sol in range(s+1, len(solutions)):
                    for index in range(1, len(solutions[s])):
                        if graph.getNodeFromId(solutions[sol][index]).type == 1:
                            newSolution = copy.deepcopy(solutions)
                            temp1, temp2 = newSolution[s][start], newSolution[s][end]
                            newSolution[s][start], newSolution[s][end] = newSolution[sol][index], newSolution[sol][solutions[sol].index(graph.getNodeFromId(solutions[sol][index]+1).id)]
                            newSolution[sol][index], newSolution[sol][solutions[sol].index(graph.getNodeFromId(solutions[sol][index]+1).id)] = temp1, temp2
                            neighborhood2.append(newSolution)


    
    return neighborhood, neighborhood2

def fitnessFunc2(solutions, graph):
    value = 0
    for solution in solutions:
        for n in range(1, len(solution)):
            n1 = solution[n]
            n2 = solution[n-1]
            value += graph.getEdgeFromEdgeNodes(n2, n1).weight # adds up the weight of all the edges in the path
    
    return value

def checkSolution(solution, graph):
    correct = True
    # loop over the whole solution and check if it is possible to get from one node to the next. If it is solution is valid
    for n in range(1, len(solution)): 
        n1 = solution[n]
        n2 = solution[n-1]
        edge = graph.getEdgeFromEdgeNodes(n2, n1) # returns -1 if there is no edge

        if edge == -1:
            return False # the solution is not valid 

        if graph.getNodeFromId(n1).type == 2: # if the point is an end point 
            start = n1 -1
            for x in solution[:n]: # check if its start point is in the list before it
                if x == start:
                    correct = True
                    break
                else:
                    correct = False

        if not correct:
            return False

    return True

def tabuSearch(graph, iterations, tabuSize, s):
    bestSolution = s
    solution = bestSolution
    tabuList = list()
    tabuList2 = list()
    bestCost = fitnessFunc2(bestSolution, graph)
    counter = 1

    while counter <= iterations:
        neighbours, neighbours2 = neighborhood2(solution, graph)
        # print(neighbours)
        found = False # indicates we found a set of different nodes that are not in the tabu list 
        currentBestSolutionIndex = 0
        currentBestSolution = neighbours[currentBestSolutionIndex]

        while not found and currentBestSolutionIndex < len(neighbours) - 1:
            i = 0
            breaks = False
            while i < len(currentBestSolution):
                j = 0
                while j < len(currentBestSolution[i]):
                    if currentBestSolution[i][j] != solution[i][j]: # if the same node position is not equal 
                        firstNode = currentBestSolution[i][j]
                        secondNode = solution[i][j]
                        breaks = True
                        break
                    j += 1
                    if breaks:
                        break
                i += 1

            if [firstNode, secondNode] not in tabuList and [secondNode, firstNode] not in tabuList: # check if the swap is in the tabu list or not 
                tabuList.append([firstNode, secondNode]) # add the set to the tabuList
                found = True 

                solution = currentBestSolution
                cost = fitnessFunc2(currentBestSolution, graph)

                if cost < bestCost: # checks if the new solution is better than the current best 
                    bestCost = cost
                    bestSolution = solution
            
            else:
                currentBestSolutionIndex += 1 # if nothing was found in with the current swap, go the the next one 
                currentBestSolution = neighbours[currentBestSolutionIndex]
        
        if len(tabuList) >= tabuSize:
            tabuList.pop(0) # removes the oldest element in the list

        counter = counter + 1

        if len(neighbours2) > 0:
            found = False
            size = 0
            nextSoluiton = neighbours2[size]

            while not found and size < len(neighbours2) - 1:
                i = 0
                breaks = False
                while i < len(nextSoluiton): 
                    j = 0
                    pointsFound = 0
                    while j < len(nextSoluiton[i]):
                        if nextSoluiton[i][j] != solution[i][j]:
                            if pointsFound == 0:
                                start1 = nextSoluiton[i][j]
                                start2 = solution[i][j]
                                pointsFound += 1
                            else:
                                end1 = nextSoluiton[i][j]
                                end2 = solution[i][j]
                                breaks = True
                                break
                        j += 1
                    if breaks == True:
                        break
                    i += 1

                if [[start1, end1], [start2, end2]] not in tabuList2 and [[start2, end2], [start1, end1]] not in tabuList2:
                    tabuList2.append([[start1, end1], [start2, end2]])
                    found = True 

                    solution = nextSoluiton
                    cost = fitnessFunc2(solution, graph)

                    if cost < bestCost: # checks if the new solution is better than the current best 
                        bestCost = cost
                        bestSolution = solution
                else:
                    size += 1 # if nothing was found in with the current swap, go the the next one 
                    nextSoluiton = neighbours2[size]

                if len(tabuList2) >= tabuSize:
                    tabuList2.pop(0) # removes the oldest element in the list
    
    return bestSolution, bestCost

# Flask setup 
app = Flask(__name__)

@app.route("/", methods=["POST", "GET"])
def home():
    return render_template('index.html')

# @app.route("/getCars")
# def getCars():
#     cars = []
#     for node in pickupNetwork.nodes:
#         if node.type == 0:
#             cars.append([node.lat, node.long])
#     return Response(json.dumps(cars), mimetype='application/json')

# @app.route("/getStartPoints")
# def getStartPoints():
#     startPoints = []
#     for node in pickupNetwork.nodes:
#         if node.type == 1:
#             startPoints.append([node.lat, node.long])
#     return Response(json.dumps(startPoints), mimetype='application/json')

# @app.route("/getEndPoints")
# def getEndPoints():
#     endPoints = []
#     for node in pickupNetwork.nodes:
#         if node.type == 2:
#             endPoints.append([node.lat, node.long])
#     return Response(json.dumps(endPoints), mimetype='application/json')

# @app.route("/getPolyline")
# def getPolyline():
#     polylines = []
#     for x in range(1, len(bestSolution)):
#         polylines.append(pickupNetwork.getEdgeFromEdgeNodes(bestSolution[x-1], bestSolution[x]).polyLine)
#     return Response(json.dumps(polylines), mimetype='application/json')

@app.route("/loadSet", methods=["Post", "GET"])
def loadSet():
    pickupNetwork = graph()

    cars = request.values.getlist('car[0][]')
    carCounter = 0
    while cars:
        cars = request.values.getlist('car['+ str(carCounter) +'][]')
        if cars:
            pickupNetwork.addCar([cars[0], cars[1]])
            carCounter += 1

    trips = request.values.getlist('trip[0][0][]')
    tripCounter = 0
    while trips:
        trips2 = request.values.getlist('trip['+ str(tripCounter) +'][1][]')
        pickupNetwork.addTrip([trips[0], trips[1]], [trips2[0], trips2[1]])
        tripCounter += 1
        trips = request.values.getlist('trip['+ str(tripCounter) +'][0][]')
    
    iterations = request.values.get('iter')
    start_time = time.time()
    solution, cost = tabuSearch(pickupNetwork, int(iterations), 14, initSolution2(pickupNetwork))
    totalTime = time.time() - start_time
    print("My program took", totalTime, "to run")



    polylines = {}
    x = 0
    for x in range(0, len(solution)):
        polyline = []
        for y in range(1, len(solution[x])):
            polyline.append(pickupNetwork.getEdgeFromEdgeNodes(solution[x][y-1], solution[x][y]).polyLine)
        polylines[x] = polyline

    polylines[x+1] = totalTime
    return polylines


if __name__ == "__main__":
    app.run(debug = True, host = '0.0.0.0', port=8000)