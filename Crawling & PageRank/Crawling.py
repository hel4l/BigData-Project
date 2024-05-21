from bs4 import BeautifulSoup
import os
import requests
import re
import collections

class WebCrawler:

    # A web crawler class that crawls websites and saves content.
    def __init__(self, save_directory):
        self.save_directory = save_directory
        self.visited_urls = set()
        self.file_number = self._get_last_file_number()

    # Reads the last file number from the mapping file and returns it.
    def _get_last_file_number(self):
        mapping_file_path = os.path.join(self.save_directory, "url_mapping.txt")
        try:
            with open(mapping_file_path, "r", encoding="utf-8") as f:
                last_line = f.readlines()[-1]
                return int(last_line.split(":")[0])
        except (FileNotFoundError, IndexError):
            return -1

    # Saves the extracted text to a file with proper formatting.
    def _save_text_to_file(self, url, text):
        self.file_number += 1
        filename = f"{self.file_number}.txt"
        filepath = os.path.join(self.save_directory, filename)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(self._format_text(text))

        # Update url mapping file
        with open(os.path.join(self.save_directory, "url_mapping.txt"), "a", encoding="utf-8") as f:
            f.write(f"{self.file_number}: {url}\n")

    # Formats the extracted text by removing whitespace, empty lines, and non-alphabetic characters.
    def _format_text(self, text):
        text = text.strip()
        text = " ".join(text.split())
        text = os.linesep.join([s for s in text.splitlines() if s])
        return text

    # Loads visited URLs from a file and updates the internal set.
    def _load_visited_urls(self):
        visited_urls_file_path = os.path.join(self.save_directory, "visited_urls.txt")
        try:
            with open(visited_urls_file_path, "r", encoding="utf-8") as f:
                self.visited_urls.update(line.strip() for line in f)
        except FileNotFoundError:
            pass

    def _load_adjacency_list(self):
        adjacency_list = {}
        try:
            with open(os.path.join(self.save_directory, "adjacency_list.txt"), "r", encoding="utf-8") as f:
                for line in f:
                    if ":" not in line:  # Skip lines that do not contain a colon
                        continue
                    node, neighbors = line.strip().split(":", 1)  # split at the first colon only
                    adjacency_list[node] = set(neighbors.split(' , '))
        except FileNotFoundError:
            pass
        return adjacency_list

    def _save_adjacency_list(self, adjacency_list):
        # Load the URL mapping from the file
        url_mapping = {}
        with open(os.path.join(self.save_directory, "url_mapping.txt"), "r", encoding="utf-8") as f:
            for line in f:
                number, url = line.strip().split(":", 1)  # split at the first colon only
                url_mapping[url.strip()] = number

        # Save the adjacency list to a file, replacing URLs with numbers
        with open(os.path.join(self.save_directory, "adjacency_list.txt"), "w", encoding="utf-8") as f:
            for node, neighbors in adjacency_list.items():
                # Replace node URL with its corresponding number if it's a URL
                node_number = url_mapping.get(node, node) if node in url_mapping else node
                # Replace neighbor URLs with their corresponding numbers if they are URLs
                neighbors_numbers = [url_mapping.get(neighbor) if neighbor in url_mapping else neighbor for neighbor in neighbors]
                if neighbors_numbers:  # write only if there are valid neighbors
                    f.write(f"{node_number} : {' , '.join(neighbors_numbers)}\n")

    def crawl(self, url, max_pages):
        self._load_visited_urls()
        queue = collections.deque([url])
        processed_pages = 0

        adjacency_list = self._load_adjacency_list()

        while queue and processed_pages < max_pages:
            url = queue.popleft()
            if url not in self.visited_urls:
                try:
                    response = requests.get(url, timeout=10)  # Set timeout to 10 seconds
                    soup = BeautifulSoup(response.text, "html.parser")

                    # Extract and save text
                    text = soup.get_text()
                    self._save_text_to_file(url, text)

                    # Extract links
                    neighbors = set()
                    for link in soup.find_all("a"):
                        href = link.get("href")
                        if href and href.endswith("/"):
                            href = href[:-1]
                        if href and href.startswith("http"):
                            neighbors.add(href)
                            queue.append(href)

                    # Update adjacency list instead of overwriting it
                    if url in adjacency_list:
                        adjacency_list[url].update(neighbors)
                    else:
                        adjacency_list[url] = neighbors

                    self.visited_urls.add(url)
                    print(f"Visited: {url}")

                    # Save visited url to file
                    with open(os.path.join(self.save_directory, "visited_urls.txt"), "a", encoding="utf-8") as f:
                        f.write(url + "\n")

                    # Save adjacency list to file
                    self._save_adjacency_list(adjacency_list)

                    processed_pages += 1
                except requests.exceptions.Timeout:
                    print(f"Skipping {url} due to timeout")
                except Exception as e:
                    print(f"Failed to process {url}: {e}")

if __name__ == "__main__":
    crawler = WebCrawler("D://--//--//CrawledData")
    crawler.crawl("https://news.google.com/home?hl=en-CA&gl=CA&ceid=CA:en", 10)