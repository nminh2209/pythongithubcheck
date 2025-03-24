import requests
import matplotlib.pyplot as plt
import time
from datetime import datetime
from collections import defaultdict

# Replace with your organization name and GitHub personal access token
org_name = "cos30049-suvhn"  # Replace with your organization name
github_token = 'GITHUB_TOKEN'  # Replace with your personal GitHub token

# Set up headers for GitHub API requests    
headers = {
    "Authorization": f"token {github_token}",
    "Accept": "application/vnd.github.v3+json"
}

# Function to fetch repositories with pagination handling
def fetch_repositories():
    repos = []
    page = 1
    while True:
        repos_url = f"https://api.github.com/orgs/{org_name}/repos?page={page}&per_page=100"
        repos_response = requests.get(repos_url, headers=headers)
        
        if repos_response.status_code != 200:
            print(f"Failed to fetch repositories: {repos_response.status_code}")
            exit()

        page_repos = repos_response.json()
        if not page_repos:
            break
        
        repos.extend(page_repos)
        page += 1
        time.sleep(1)  # Sleep to avoid hitting rate limits

    return repos

# Function to fetch commits for each repository
def fetch_commits_for_repo(repo_name):
    commits = []
    page = 1
    while True:
        commits_url = f"https://api.github.com/repos/{org_name}/{repo_name}/commits?page={page}&per_page=100"
        commits_response = requests.get(commits_url, headers=headers)
        
        if commits_response.status_code != 200:
            print(f"Failed to fetch commits for {repo_name}: {commits_response.status_code}")
            break
        
        page_commits = commits_response.json()
        if not page_commits:
            break
        
        commits.extend(page_commits)
        page += 1
        time.sleep(1)  # Sleep to avoid hitting rate limits

    return commits

# Function to fetch commit details, including lines added/deleted
def fetch_commit_details(repo_name, commit_sha):
    commit_url = f"https://api.github.com/repos/{org_name}/{repo_name}/commits/{commit_sha}"
    commit_response = requests.get(commit_url, headers=headers)
    
    if commit_response.status_code != 200:
        print(f"Failed to fetch commit details for {commit_sha}: {commit_response.status_code}")
        return None
    
    commit_data = commit_response.json()
    
    # Get the list of files changed in the commit, including lines added and deleted
    files = commit_data.get('files', [])
    lines_added = 0
    lines_deleted = 0
    
    for file in files:
        lines_added += file.get('additions', 0)
        lines_deleted += file.get('deletions', 0)
    
    return lines_added, lines_deleted, commit_data['commit']['author']['date']

# Get the list of repositories
repos = fetch_repositories()

# Dictionary to store commit counts, lines added, and lines deleted by member
member_commits = defaultdict(int)
member_lines_added = defaultdict(int)
member_lines_deleted = defaultdict(int)

# Dictionary to track commit activity by date
date_commits = defaultdict(int)
date_lines_added = defaultdict(int)
date_lines_deleted = defaultdict(int)

# Loop through repositories and fetch commits for the specific repository
for repo in repos:
    repo_name = repo['name']
    
    # Only proceed if the repository name matches 'group-project-spr-2025-g12'
    if repo_name == "group-project-spr-2025-g12":
        print(f"Fetching commits for {repo_name}...")

        # Fetch the commits for the repository
        commits = fetch_commits_for_repo(repo_name)

        # Loop through commits and count them by author and track lines added/deleted
        for commit in commits:
            author = commit['commit']['author']['name']
            commit_sha = commit['sha']

            # Fetch commit details to track lines added and deleted
            lines_added, lines_deleted, commit_date = fetch_commit_details(repo_name, commit_sha)

            # Aggregate commit data by author
            member_commits[author] += 1
            member_lines_added[author] += lines_added
            member_lines_deleted[author] += lines_deleted

            # Aggregate commit data by date
            commit_date_obj = datetime.strptime(commit_date, "%Y-%m-%dT%H:%M:%SZ").date()
            date_commits[commit_date_obj] += 1
            date_lines_added[commit_date_obj] += lines_added
            date_lines_deleted[commit_date_obj] += lines_deleted

    else:
        print(f"Skipping {repo_name} as it is not 'group-project-spr-2025-g12'.")

# Display the aggregated commit data by member
print("Commit data by member:")
for member, count in member_commits.items():
    print(f"{member}: {count} commits, {member_lines_added[member]} lines added, {member_lines_deleted[member]} lines deleted")

# Create a pie chart to visualize the commit distribution by member
labels = member_commits.keys()
sizes = member_commits.values()

plt.figure(figsize=(8, 8))
plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90)
plt.axis('equal')
plt.title(f"Commit Distribution by Member in {org_name}")
plt.show()

# Create a line chart to visualize the fluctuation of commits over time
dates = sorted(date_commits.keys())
commit_counts = [date_commits[date] for date in dates]
lines_added_values = [date_lines_added[date] for date in dates]
lines_deleted_values = [date_lines_deleted[date] for date in dates]

# Plot the data
plt.figure(figsize=(10, 6))
plt.plot(dates, commit_counts, label='Commits', color='b', marker='o')
plt.plot(dates, lines_added_values, label='Lines Added', color='g', marker='x')
plt.plot(dates, lines_deleted_values, label='Lines Deleted', color='r', marker='s')

plt.xlabel('Date')
plt.ylabel('Count')
plt.title(f"Commit Activity Over Time in {org_name}")
plt.legend()
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()
