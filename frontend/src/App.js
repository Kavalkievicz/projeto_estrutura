import React, { useState, useEffect } from "react";
import Tree from "react-d3-tree";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App = () => {
    const [heap, setHeap] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [highlightedNodes, setHighlightedNodes] = useState([]);
    const [heapType] = useState("min");

    const fetchHeap = async () => {
        try {
            const response = await fetch("http://localhost:5000/heap");
            const data = await response.json();
            setHeap(data.heap);
        } catch (error) {
            console.error("Erro ao buscar o heap:", error);
        }
    };

    const insertValue = async () => {
        if (!inputValue.trim()) return;

        try {
            const response = await fetch("http://localhost:5000/insert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value: parseInt(inputValue) }),
            });

            const data = await response.json();
            const newHeap = data.heap;
            const changedIndices = getChangedIndices(heap, newHeap);

            setHeap(newHeap);
            setHighlightedNodes(changedIndices);

            setInputValue("");
            setTimeout(() => setHighlightedNodes([]), 2000);
        } catch (error) {
            console.error("Erro ao inserir valor:", error);
        }
    };

    const removeMinMax = async () => {
        try {
            const response = await fetch(`http://localhost:5000/remove`, { method: "POST" });
            const data = await response.json();
            const newHeap = data.heap;
            const changedIndices = getChangedIndices(heap, newHeap);

            setHeap(newHeap);
            setHighlightedNodes(changedIndices);

            setTimeout(() => setHighlightedNodes([]), 2000);
        } catch (error) {
            console.error("Erro ao remover o valor:", error);
        }
    };

    const clearHeap = async () => {
        try {
            const response = await fetch("http://localhost:5000/clear", { method: "POST" });
            const data = await response.json();
            setHeap(data.heap);
            setHighlightedNodes([]);
        } catch (error) {
            console.error("Erro ao limpar o heap:", error);
        }
    };

    useEffect(() => {
        fetchHeap();
    }, []);

    const getChangedIndices = (oldHeap, newHeap) => {
        const changed = [];

        for (let i = 0; i < Math.max(oldHeap.length, newHeap.length); i++) {
            if (oldHeap[i] !== newHeap[i]) {
            changed.push(i);
            }
        }

        return changed;
    };

    const buildTreeData = () => {
        const buildTree = (index) => {
            if (index >= heap.length) return null;

            return {
                name: `${heap[index]}`,
                children: [
                    buildTree(2 * index + 1),
                    buildTree(2 * index + 2),
                ].filter(Boolean),
            };
        };

        return buildTree(0);
    };

    return (
        <div className="App container mt-5">
            <h1 className="text-center mb-4">Heap</h1>
            <div className="d-flex justify-content-center mb-4">
                <div className="dropdown">
                    <button
                        className="btn btn-secondary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        Heap: {heapType === "min" ? "Min-Heap" : "Max-Heap"}
                    </button>
                </div>
            </div>

            <div className="d-flex justify-content-center mb-4">
                <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Digite um número"
                    className="form-control w-25 me-2"
                />
                <button className="btn btn-primary me-2" onClick={insertValue}>
                    Inserir
                </button>
                <button className="btn btn-warning me-2" onClick={removeMinMax}>
                    Remover Menor
                </button>
                <button className="btn btn-danger" onClick={clearHeap}>
                    Limpar Heap
                </button>
            </div>

            <div className="mb-4">
                <h2>Grid de Números</h2>
                <div className="d-flex flex-wrap justify-content-start">
                    {heap.map((value, index) => (
                        <div
                            key={index}
                            className="d-flex flex-column justify-content-center align-items-center me-2 mb-2"
                            style={{
                                width: "60px",
                                height: "80px",
                                border: "2px solid black",
                                borderRadius: "8px",
                                backgroundColor: "#f4f4f4",
                                fontWeight: "bold",
                            }}
                        >
                            <div>{value}</div>
                            <div style={{ fontSize: "12px", color: "#777" }}>{index}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div id="treeWrapper" className="tree-container" style={{ width: '100%', height: '800px', position: 'relative' }}>
                {heap.length > 0 ? (
                    <Tree
                        data={buildTreeData()}
                        orientation="vertical"
                        pathFunc="elbow"
                        nodeSize={{ x: 200, y: 100 }}
                        separation={{ siblings: 1, nonSiblings: 2 }}
                        renderCustomNodeElement={(rd3tProps) => {
                            const { nodeDatum } = rd3tProps;
                            const nodeIndex = heap.indexOf(parseInt(nodeDatum.name));
                            const isHighlighted = highlightedNodes.includes(nodeIndex);

                            return (
                                <g>
                                    <circle
                                        r="30"
                                        style={{
                                            fill: isHighlighted ? "#ff0000" : "#fff",
                                            stroke: "black",
                                            strokeWidth: "2px",
                                        }}
                                    />
                                    <text
                                        fill="black"
                                        stroke="none"
                                        x="0"
                                        y="0"
                                        textAnchor="middle"
                                        alignmentBaseline="central"
                                        style={{ fontWeight: isHighlighted ? "bold" : "normal" }}
                                    >
                                        {nodeDatum.name}
                                    </text>
                                </g>
                            );
                        }}
                    translate={{ x: 1250, y: 50 }}
                    />
                ) : (
                    <p className="text-center">O heap está vazio.</p>
                )}
            </div>
        </div>
    );
};

export default App;