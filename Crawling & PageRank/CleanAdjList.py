import re

def clear_large_files(directory_path):
    for filename in os.listdir(directory_path):
        file_path = os.path.join(directory_path, filename)
        if os.path.isfile(file_path):
            file_size_kb = os.path.getsize(file_path) / 1024
            if file_size_kb > 50:
                with open(file_path, 'w') as file:
                    file.write('')

# Use the function
# Solution 1: Using double backslashes
clear_large_files('D:\\Collage\\Projects\\BigData-Project\\CrawledData')
# Open the file and read its content
# Open the file and read its content
with open(r'D:\--\--\CrawledData\adjacency_list.txt', 'r', encoding='utf-8') as file:
    lines = file.readlines()

new_lines = []
for line in lines:
    # Remove any URLs from the line
    line = re.sub(r'http\S+|www.\S+', '', line)

    # Remove any comma that doesn't have a number before it
    line = re.sub(r',', '', line)

    # Remove extra spaces without removing endlines
    line = re.sub(r' +', ' ', line)

    # Split the line into a list of numbers
    numbers = re.findall(r'\d+', line)

    # Join the numbers back together with commas
    line = ' , '.join(numbers)

    # Replace the first comma with a colon
    line = line.replace(',', ':', 1)

    if len(numbers) == 1:
        line += ' : '

    new_lines.append(line)

# Write the cleaned content back to the file
# Write the cleaned content back to the file
with open(r'D:\--\--\CrawledData\adjacency_list.txt', 'w', encoding='utf-8') as file:
    file.write('\n'.join(line.rstrip('\n') for line in new_lines))