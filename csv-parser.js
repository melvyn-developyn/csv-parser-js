// I want to:
// - Create a function - "read_csv" that takes the location of a CSV and
//   returns a list of objects where each object in the list is a row from the CSV

// For reference:
// const row = {
//     name: '',
//     description: '',
//     price: '',
//     barcode: '',
//     quantity: 0
// };

// Todo:
// 1. How do I read in a file?
// 2. Once I have the file, how do I split up the rows?
// 3. Once I have the rows, how do I parse each row into an object?


const fs = require('fs/promises');

const read_csv = async file_name => {
    // Read in the file (products.csv)
    const data = await fs.readFile(file_name, { encoding: 'utf8' });
    let rows = data.split('\n');
    rows = rows.map(row => row.replace('\r', ''));

    let rows_split_into_cells = [];
    for (const row of rows) {
        let cells = [];
        let cell = '';
        let has_speech_mark_started = false;
        let ignore_character = false;

        for (const char of row) {
            if (ignore_character) {
                ignore_character = false;
                continue;
            }

            // Capture all characters until we find a comma
            if (char === ',' && !has_speech_mark_started) {
                cells.push(cell);
                cell = '';
            }

            // If we find a speech mark: we need to capture everything in between the start
            // and ending speechmarks
            if (char === '"') {
                // If the speech mark has already started, this must be the end
                if (has_speech_mark_started) {
                    has_speech_mark_started = false;
                    cells.push(cell);
                    cell = '';
                    ignore_character = true;
                } else { // Otherwise, mark that the speechmark has started
                    has_speech_mark_started = true;
                }
            }

            if (char !== '"' && char !== ',')
                cell += char;

        }

        // capture the ending
        if (cell)
            cells.push(cell);

        rows_split_into_cells.push(cells);
    }

    // Convert the cells into objects
    const headers = rows_split_into_cells.shift(); // Grab the first element
    let products = [];

    for (const cells of rows_split_into_cells) {
        let product = {};
        // For each header, pair it up with a cell
        for (let i = 0; i < headers.length; i++) {
            let header = headers[i];
            let cell = cells[i];

            product[header] = header === 'quantity' ? parseInt(cell) : cell;
        }
        products.push(product);
    }

    return products;
}

// Main
(async () => {
    const products = await read_csv('./products.csv');
    console.log(products);
    console.log('Remember to like and subscribe');
})();