let urlMapping = {};
let pageRankMapping = {};
let fileData = '';

window.onload = function () {
    fetch('url_mapping.txt')
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            lines.forEach(line => {
                const [number, url] = line.split(': ')
                urlMapping[number] = url;
            });

            fetch('page_rank.txt')
                .then(response => response.text())
                .then(data => {
                    const lines = data.split('\n');
                    lines.forEach(line => {
                        const [number, rank] = line.split('→')
                        pageRankMapping[number] = parseFloat(rank);
                    });

                    fetch('file.txt')
                        .then(response => response.text())
                        .then(data => {
                            fileData = data;
                        });
                });
        });
}

document.getElementById('searchForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const results = document.getElementById('results');
    results.innerHTML = ''; // Clear previous results
    const searchInput = document.getElementById('searchInput');
    const searchQuery = searchInput.value.trim();

    const words = searchQuery.split(' ');
    const numbers = new Set();
    const lines = fileData.split('\n');
    words.forEach(word => {
        lines.forEach(line => {
            if (line.includes(word)) {
                const regex = /→(\d+);/g;
                let match;
                while ((match = regex.exec(line)) !== null) {
                    numbers.add(match[1]);
                }
            }
        });
    });

    const listItems = [];
    numbers.forEach(number => {
        const li = document.createElement('li');
        // Add Tailwind CSS classes to style the list item
        li.classList.add('border', 'border-gray-300', 'rounded-md', 'p-4', 'mb-2', 'hover:shadow-md', 'bg-white');
        const a = document.createElement('a');
        a.href = urlMapping[number] || '#';
        a.textContent = urlMapping[number] || 'URL not found';

        li.appendChild(a);
        listItems.push({ li, rank: pageRankMapping[number] || 0 });
    });
    // Sort list items by rank
    listItems.sort((a, b) => b.rank - a.rank);

    // Append sorted list items to results
    listItems.forEach(item => {
        results.appendChild(item.li);
    });

    // Check if any li elements were added to results
    if (results.children.length === 0) {
        const div = document.createElement('div');
        div.textContent = 'No results found';
        results.appendChild(div);
    }
});