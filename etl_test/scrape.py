import requests
from bs4 import BeautifulSoup

# 1. EXTRACT
url = "https://www.legalzoom.com/business/business-formation/llc-overview.html"
response = requests.get(url)
raw_html = response.text

# 2. TRANSFORM
soup = BeautifulSoup(raw_html, "html.parser")

# Remove obvious junk
for tag in soup(["script", "style", "nav", "footer", "button", "aside"]):
    tag.extract()

# Extract text
clean_text = soup.get_text()

# Normalize whitespace
lines = (line.strip() for line in clean_text.splitlines())
chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
final_text = "\n".join(chunk for chunk in chunks if chunk)

# 3. LOAD (inspect output)
print(final_text[:500])
