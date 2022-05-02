import React,{Component} from "react";
//import article from "./htmls/On the Complexity of Traffic Traces and Implications.html"

function About() {
    return (
        <div>
        <h2>
            About the article:
        </h2>
        <p>
        This paper presents a systematic approach to identify and quantify the types of structures featured by packet
traces in communication networks. Our approach leverages an information-theoretic methodology, based on
iterative randomization and compression of the packet trace, which allows us to systematically remove and
measure dimensions of structure in the trace. In particular, we introduce the notion of trace complexity which
approximates the entropy rate of a packet trace. Considering several real-world traces, we show that trace
complexity can provide unique insights into the characteristics of various applications. Based on our approach,
we also propose a traffic generator model able to produce a synthetic trace that matches the complexity levels
of its corresponding real-world trace. Using a case study in the context of datacenters, we show that insights
into the structure of packet traces can lead to improved demand-aware network designs: datacenter topologies
that are optimized for specific traffic patterns.
        </p>
        <a href="https://github.com/osyrus-byte/webtest/raw/main/files/On%20the%20Complexity%20of%20Traffic%20Traces%20and%20Implications.pdf">Article Download</a> 
        </div>
    );
}

export default About;