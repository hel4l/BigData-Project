import numpy as np

def read_adjacency_matrix():
    """
    Reads an adjacency matrix from a text file.

    Args:
        filename: The path to the text file.

    Returns:
        A 2D list representing the adjacency matrix.
    """
    with open("D:\\crawling\\adjacency_list.txt", "r") as f:
        # Read lines and split into lists of strings
        lines = [line.strip().split(" : ") for line in f.readlines()]

    # Find the maximum website index (handles empty mentions as well)
    max_website_index = -1  # Initialize with -1 to ensure at least size 1
    for line in lines:
        try:
            website_index = int(line[0].split(":")[0])
            max_website_index = max(max_website_index, website_index)
        except (IndexError, ValueError):
            pass  # Ignore lines with formatting errors

    # Ensure we have at least 1 website (avoid empty matrix)
    num_websites = max(max_website_index + 1, 1)

    # Initialize the adjacency matrix
    adjacency_matrix = [[0 for _ in range(num_websites)] for _ in range(num_websites)]

    # Fill the matrix with website mentions
    for line in lines:
        try:
            website_index, mentions_str = line
            website_index = int(website_index.split(":")[0])
        except (IndexError, ValueError):
            # Handle lines with only website index (no mentions)
            website_index = int(line[0].split(":")[0])  # Assuming website index is still present
            mentions_str = ""  # Set empty mentions string

        # Handle empty mentions list
        mentions = [] if mentions_str == "" else [int(x) for x in mentions_str.split(",") if x]
        for mentioned_website in mentions:
            if website_index < num_websites and mentioned_website < num_websites:  # Check index validity
                adjacency_matrix[website_index][mentioned_website] = 1

    return adjacency_matrix


def calculate_pagerank(adj_matrix, damping_factor=0.8, max_iterations=1500, tol=1e-10):
    # Number of nodes
    n = adj_matrix.shape[0]

    # Initialize PageRank with equal values
    prev_rank = np.ones(n) / n
    nprev = np.transpose(prev_rank)

    # Iterate for max_iterations or until convergence
    for _ in range(max_iterations):
        new_rank = damping_factor * np.matmul(adj_matrix, nprev) + (1 - damping_factor) / n
        # Check for convergence
        diff = np.linalg.norm(new_rank - nprev)
        if diff < tol:
            break
        nprev = new_rank

    print(new_rank)
    return np.round(new_rank,8)


def write_pagerank_to_file(page_rank, file_path):
    with open(file_path, 'w', encoding='utf-8') as file:
        for i, rank in enumerate(page_rank, start=0):
            file.write(f"{i}→{rank}\n")


def adj_to_transition(adj_matrix):
    """
    This function converts an adjacency matrix to a transition matrix for PageRank.

    Args:
        adj_matrix: A numpy array representing the adjacency matrix.

    Returns:
        A numpy array representing the transition matrix.
    """
    # Ensure the matrix is a numpy array
    adj_matrix = np.array(adj_matrix)
    adj_matrix = np.transpose(adj_matrix)
    # Get the number of rows and columns
    rows, cols = adj_matrix.shape

    # Create an empty transition matrix
    transition_matrix = np.zeros((rows, cols))

    # Loop through each row (website)
    for i in range(rows):
        # Count the number of outgoing links (websites it mentions)
        outgoing_links = np.sum(adj_matrix[i])

        # Check for websites with no outgoing links (dead ends)
        if outgoing_links == 0:
            # Handle dead ends (e.g., distribute weight equally)
            transition_matrix[i] = 1 / cols
        else:
            # Divide each element (1) by the total outgoing links count
            transition_matrix[i] = adj_matrix[i] / outgoing_links

    transition_matrix = np.transpose(transition_matrix)
    return transition_matrix


page_rank_file = r'D:\\crawling\\page_rank.txt'

# Example usage
adjacency_matrix = read_adjacency_matrix()
pinput = adj_to_transition(adjacency_matrix)

page_rank = calculate_pagerank(pinput)
for row in page_rank:
    print(row)

write_pagerank_to_file(page_rank, page_rank_file)
# Now you can use the adjacency_matrix for PageRank or other algorithms
