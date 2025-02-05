package handler

import (
	"encoding/json"
	"fmt"
	"git-booster/internal/model"
	"git-booster/internal/service"
	"math/rand"
	"net/http"
	"os"
	"time"
)

// CommitHandler handles commit requests by processing the commits for the specified repository
func CommitHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST requests allowed", http.StatusMethodNotAllowed)
		return
	}

	var req model.CommitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON data", http.StatusBadRequest)
		return
	}

	if req.RepoURL == "" {
		http.Error(w, "Repository URL is required", http.StatusBadRequest)
		return
	}
	if req.StartDate == "" || req.EndDate == "" {
		http.Error(w, "Both start and end dates are required", http.StatusBadRequest)
		return
	}

	defaultMessages, err := readDefaultCommitMessages()
	if err != nil {
		http.Error(w, fmt.Sprintf("Error reading default commit messages: %v", err), http.StatusInternalServerError)
		return
	}

	commitDates, err := generateDateRange(req.StartDate, req.EndDate)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error generating date range: %v", err), http.StatusBadRequest)
		return
	}

	fmt.Printf("Generated commit dates: %v\n", commitDates)

	commitMessages := req.CommitMessages

	// Auto-fill commit messages if not enough are provided
	for len(commitMessages) < len(commitDates) {
		commitMessages = append(commitMessages, defaultMessages[rand.Intn(len(defaultMessages))])
	}

	if len(commitMessages) != len(commitDates) {
		http.Error(w, fmt.Sprintf("Number of commit messages should be equal to the number of commit dates (%d)", len(commitDates)), http.StatusBadRequest)
		return
	}

	err = service.ProcessCommits(req, commitDates, commitMessages)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error processing commits: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	response := map[string]interface{}{
		"status":  "success",
		"repo":    req.RepoURL,
		"message": fmt.Sprintf("Successfully processed commits for %d days.", len(commitDates)),
		"dates":   commitDates,
	}
	json.NewEncoder(w).Encode(response)
}

func generateDateRange(startDate string, endDate string) ([]string, error) {
	var dates []string

	start, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		return nil, fmt.Errorf("error parsing start date: %v", err)
	}
	end, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		return nil, fmt.Errorf("error parsing end date: %v", err)
	}

	if start.After(end) {
		return nil, fmt.Errorf("start date cannot be after end date")
	}

	for current := start; !current.After(end); current = current.AddDate(0, 0, 1) {
		dates = append(dates, current.Format("2006-01-02"))
	}

	if len(dates) == 0 {
		return nil, fmt.Errorf("no commit dates generated")
	}

	return dates, nil
}

func readDefaultCommitMessages() ([]string, error) {
	configFilePath := "internal/configs/commit_messages.json"

	file, err := os.Open(configFilePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open commit_messages.json: %v", err)
	}
	defer file.Close()

	var configData map[string][]string
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&configData); err != nil {
		return nil, fmt.Errorf("failed to decode commit_messages.json: %v", err)
	}

	defaultMessages, ok := configData["default_commit_messages"]
	if !ok {
		return nil, fmt.Errorf("missing default_commit_messages key in the config file")
	}

	return defaultMessages, nil
}
