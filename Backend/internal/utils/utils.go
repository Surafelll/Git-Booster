package utils

import (
	"fmt"
	"os"
	"time"
	"math/rand"
	"net"
	"git-booster/internal/model"
)

func SeedRandom() {
	rand.Seed(time.Now().UnixNano())
}

func FindAvailablePort(basePort int) int {
	for port := basePort; port < basePort+1000; port++ {
		listen, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
		if err == nil {
			listen.Close()
			return port
		}
	}
	return -1
}

func SetCommitDate(date string, commitIndex int) {
	dateWithHour := fmt.Sprintf("%s %02d:00:00", date, commitIndex%24)
	os.Setenv("GIT_COMMITTER_DATE", dateWithHour)
	os.Setenv("GIT_AUTHOR_DATE", dateWithHour)
}

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

	for date := startDate; !date.After(endDate); date = date.AddDate(0, 0, 1) {
		dates = append(dates, date.Format("2006-01-02"))
	}
	return dates
}
