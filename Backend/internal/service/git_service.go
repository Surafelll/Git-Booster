package service

import (
	"encoding/json"
	"fmt"
	"git-booster/internal/model"
	"git-booster/internal/utils"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

// ProcessCommits handles the commit process based on the commit request
func ProcessCommits(req model.CommitRequest, commitDates []string, commitMessages []string) error {
	// Clone the repository (no authentication needed for public repos)
	repoPath, err := cloneRepo(req.RepoURL)
	if err != nil {
		return err
	}

	// Create commit folder to store the commit files
	commitFolder := filepath.Join(repoPath, "commits", time.Now().Format("2006-01-02_15-04-05"))
	if err := os.MkdirAll(commitFolder, os.ModePerm); err != nil {
		return fmt.Errorf("Failed to create commit folder: %v", err)
	}

	// Start the commit process
	commitIndex := 1

	// Loop through each commit date
	for i, commitDate := range commitDates {
		message := "Random commit message" // Default message if none is provided
		if i < len(commitMessages) {
			message = commitMessages[i] // Use user-defined commit message
		}

		for j := 0; j < 10; j++ { // 10 commits per day
			// Create a new commit file
			fileName := filepath.Join(commitFolder, fmt.Sprintf("commit_%d.go", commitIndex))
			file, _ := os.Create(fileName)
			file.WriteString(fmt.Sprintf("package main\n\n// Commit %d on %s\n", commitIndex, commitDate))
			file.Close()

			// Set the commit date using utils
			utils.SetCommitDate(commitDate, commitIndex)

			// Run git commands to add and commit changes
			exec.Command("git", "-C", repoPath, "add", ".").Run()
			exec.Command("git", "-C", repoPath, "commit", "-m", fmt.Sprintf("%s - Commit %d on %s", message, commitIndex, commitDate)).Run()

			commitIndex++
			time.Sleep(200 * time.Millisecond) // Simulate delay between commits
		}
	}

	// Push all commits to the remote repository
	exec.Command("git", "-C", repoPath, "push").Run()
	return nil
}

// cloneRepo clones the repo if it doesn't exist or resets and pulls the latest changes if it does
func cloneRepo(repoURL string) (string, error) {
	repoName := filepath.Base(repoURL)
	repoPath := filepath.Join("repos", repoName)

	// Check if the repo exists
	if _, err := os.Stat(repoPath); !os.IsNotExist(err) {
		// Reset repo to discard any local changes
		cmd := exec.Command("git", "-C", repoPath, "reset", "--hard")
		if err := cmd.Run(); err != nil {
			return "", fmt.Errorf("failed to reset repo: %v", err)
		}

		// Pull the latest changes from the main branch
		cmd = exec.Command("git", "-C", repoPath, "pull", "origin", "main")
		if err := cmd.Run(); err != nil {
			return "", fmt.Errorf("failed to pull latest changes: %v", err)
		}
		return repoPath, nil
	}

	// If the repo doesn't exist, clone it
	cmd := exec.Command("git", "clone", repoURL, repoPath)
	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("failed to clone repo: %v", err)
	}
	return repoPath, nil
}

// readDefaultCommitMessages reads the default commit messages from the config file
func readDefaultCommitMessages() ([]string, error) {
	// Define the file path for commit messages JSON
	configFilePath := "internal/configs/commit_messages.json"

	// Open the file
	file, err := os.Open(configFilePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open commit_messages.json: %v", err)
	}
	defer file.Close()

	// Decode the JSON file into a map
	var configData map[string][]string
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&configData); err != nil {
		return nil, fmt.Errorf("failed to decode commit_messages.json: %v", err)
	}

	// Retrieve the default commit messages
	defaultMessages, ok := configData["default_commit_messages"]
	if !ok {
		return nil, fmt.Errorf("missing default_commit_messages key in the config file")
	}

	return defaultMessages, nil
}
