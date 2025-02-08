package model

// CommitRequest represents the data structure needed for making commit requests
type CommitRequest struct {
	RepoURL       string   `json:"repoURL"`      // Repository URL
	StartDate     string   `json:"start_date"`     // Start date for commit range
	EndDate       string   `json:"end_date"`       // End date for commit range
	NumDays       int      `json:"num_days"`       // Number of commits to generate (Optional)
	CommitDates   []string `json:"commit_dates"`   // Custom dates for the commits (Optional)
	CommitMessages []string `json:"commit_messages"` // List of commit messages
}