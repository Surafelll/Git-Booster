package utils

import (
	"fmt"
	"os"
	"time"
	"math/rand"
	"net"
	"git-booster/internal/model"
)

// SeedRandom initializes the random number generator with the current Unix timestamp
func SeedRandom() {
	rand.Seed(time.Now().UnixNano())
}

// FindAvailablePort checks for an available port starting from the given base port.
// It returns the first available port number.
func FindAvailablePort(basePort int) int {
	for port := basePort; port < basePort+1000; port++ { // Check ports from basePort to basePort+1000
		listen, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
		if err == nil {
			// Port is available
			listen.Close()
			return port
		}
	}
	// No available port found
	return -1
}

// SetCommitDate sets commit dates for GIT_COMMITTER_DATE and GIT_AUTHOR_DATE
func SetCommitDate(date string, commitIndex int) {
	// Format the commit date as "YYYY-MM-DD HH:00:00" based on commit index
	dateWithHour := fmt.Sprintf("%s %02d:00:00", date, commitIndex%24)
	// Set the environment variables for GIT_COMMITTER_DATE and GIT_AUTHOR_DATE
	os.Setenv("GIT_COMMITTER_DATE", dateWithHour)
	os.Setenv("GIT_AUTHOR_DATE", dateWithHour)
}

// GetCommitDates generates commit dates based on the request
func GetCommitDates(req model.CommitRequest) []string {
	var dates []string
	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		fmt.Println("Invalid start date format:", err)
		return nil
	}

	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		fmt.Println("Invalid end date format:", err)
		return nil
	}

	for date := startDate; date.Before(endDate) || date.Equal(endDate); date = date.AddDate(0, 0, 1) {
		dates = append(dates, date.Format("2006-01-02"))
	}
	return dates
}
