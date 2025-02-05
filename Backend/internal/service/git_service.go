package service

import (
	"fmt"
	"git-booster/internal/model"
	"git-booster/internal/utils"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

// ProcessCommits handles the commit process based on the commit request
func ProcessCommits(req model.CommitRequest) error {
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
	commitDates := req.CommitDates
	commitMessages := req.CommitMessages

	if len(commitDates) == 0 {
		commitDates = utils.GetCommitDates(req) // Default to today's date if none is provided
	}

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

			// Set the commit date
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
