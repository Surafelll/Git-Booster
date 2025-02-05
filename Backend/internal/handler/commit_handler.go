package handler

import (
	"encoding/json"
	"fmt"
	"git-booster/internal/service"
	"git-booster/internal/model"
	"net/http"
)

// CommitHandler handles commit requests by processing the commits for the specified repository
func CommitHandler(w http.ResponseWriter, r *http.Request) {
	// Ensure only POST requests are allowed
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST requests allowed", http.StatusMethodNotAllowed)
		return
	}

	// Decode the incoming request body into a CommitRequest model
	var req model.CommitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON data", http.StatusBadRequest)
		return
	}

	// Validate the CommitRequest (optional but recommended)
	if req.RepoURL == "" {
		http.Error(w, "Repository URL is required", http.StatusBadRequest)
		return
	}

	// Calculate the number of days from the commit_dates array
	numDays := len(req.CommitDates)

	// Ensure the number of commit_dates matches the number of commit_messages
	if len(req.CommitMessages) != numDays {
		http.Error(w, fmt.Sprintf("Number of commit messages should be equal to the number of commit dates (%d)", numDays), http.StatusBadRequest)
		return
	}

	// Handle the commit process using the service
	err := service.ProcessCommits(req)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error processing commits: %v", err), http.StatusInternalServerError)
		return
	}

	// Send a success response with the repo URL and status
	w.WriteHeader(http.StatusOK)
	response := map[string]interface{}{
		"status":  "success",
		"repo":    req.RepoURL,
		"message": fmt.Sprintf("Successfully processed commits for %d days.", numDays),
		"dates":   req.CommitDates,
	}
	json.NewEncoder(w).Encode(response)
}
