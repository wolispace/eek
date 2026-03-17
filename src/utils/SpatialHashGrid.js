export class SpatialHashGrid {
    constructor(bounds, dimensions) {
        this.bounds = bounds;
        this.dimensions = dimensions;
        this.cells = new Array(dimensions[0] * dimensions[1]);
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i] = [];
        }
        this.queryId = 0;
        this.seen = new Uint32Array(50000); // Supports up to 50k entities
    }

    _getKey(i, j) {
        return i + j * this.dimensions[0];
    }

    _getCellIndices(x, y, w, h) {
        // Clamp to prevent out-of-bounds indices
        const iStart = Math.min(Math.max(Math.floor((x - this.bounds[0][0]) / (this.bounds[1][0] - this.bounds[0][0]) * this.dimensions[0]), 0), this.dimensions[0] - 1);
        const jStart = Math.min(Math.max(Math.floor((y - this.bounds[0][1]) / (this.bounds[1][1] - this.bounds[0][1]) * this.dimensions[1]), 0), this.dimensions[1] - 1);
        const iEnd = Math.min(Math.max(Math.floor((x + w - this.bounds[0][0]) / (this.bounds[1][0] - this.bounds[0][0]) * this.dimensions[0]), 0), this.dimensions[0] - 1);
        const jEnd = Math.min(Math.max(Math.floor((y + h - this.bounds[0][1]) / (this.bounds[1][1] - this.bounds[0][1]) * this.dimensions[1]), 0), this.dimensions[1] - 1);

        return { iStart, jStart, iEnd, jEnd };
    }

    clear() {
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].length = 0; // Extremely fast, no reallocation
        }
    }

    insert(client, x, y, w, h) {
        const { iStart, jStart, iEnd, jEnd } = this._getCellIndices(x, y, w, h);

        for (let i = iStart; i <= iEnd; i++) {
            for (let j = jStart; j <= jEnd; j++) {
                const key = this._getKey(i, j);
                this.cells[key].push(client);
            }
        }
    }

    findNear(x, y, w, h, outClients) {
        this.queryId++;
        const { iStart, jStart, iEnd, jEnd } = this._getCellIndices(x, y, w, h);
        outClients.length = 0;

        for (let i = iStart; i <= iEnd; i++) {
            for (let j = jStart; j <= jEnd; j++) {
                const key = this._getKey(i, j);
                const cell = this.cells[key];
                for (let k = 0; k < cell.length; k++) {
                    const client = cell[k];
                    // Using queryId makes clearing the seen array unnecessary
                    if (this.seen[client] !== this.queryId) {
                        this.seen[client] = this.queryId;
                        outClients.push(client);
                    }
                }
            }
        }
    }
}
