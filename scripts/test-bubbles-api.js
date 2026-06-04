
// Node 22 has global fetch

async function test() {
    try {
        const response = await fetch('http://localhost:3000/api/bubbles');
        const json = await response.json();
        console.log('Total bubbles:', json.bubbles?.length);
        if (json.bubbles && json.bubbles.length > 0) {
            console.log('Sample bubble:', JSON.stringify(json.bubbles[0], null, 2));
            const missingImages = json.bubbles.filter(b => !b.image).length;
            console.log('Missing images:', missingImages);
        } else {
            console.log('No bubbles found or error:', json);
        }
    } catch (e) {
        console.error('Test failed:', e.message);
    }
}

test();
