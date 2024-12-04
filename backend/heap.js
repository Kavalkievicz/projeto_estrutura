const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

let heap = [];

const heapifyUp = (heap, index) => {
    const parent = Math.floor((index - 1) / 2);
    if (parent >= 0 && heap[index] < heap[parent]) {
        [heap[index], heap[parent]] = [heap[parent], heap[index]];
        heapifyUp(heap, parent);
    }
};

const heapifyDown = (heap, index) => {
    const left = 2 * index + 1;
    const right = 2 * index + 2;
    let smallest = index;

    if (left < heap.length && heap[left] < heap[smallest]) {
        smallest = left;
    }

    if (right < heap.length && heap[right] < heap[smallest]) {
        smallest = right;
    }

    if (smallest !== index) {
        [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
        heapifyDown(heap, smallest);
    }
};

app.post('/insert', (req, res) => {
    const { value } = req.body;

    heap.push(value);
    heapifyUp(heap, heap.length - 1);
    res.json({ heap });
});

app.post('/remove', (req, res) => {
    if (heap.length === 0) {
        return res.status(400).json({ error: 'Heap is empty' });
    }

    const min = heap[0];

    heap[0] = heap[heap.length - 1];
    heap.pop();
    heapifyDown(heap, 0);
    res.json({ heap, removed: min });
});

app.post('/clear', (req, res) => {
    heap = [];
    res.json({ heap });
});

app.get('/heap', (req, res) => {
    res.json({ heap });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:5000`));