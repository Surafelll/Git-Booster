package main

import (
	"fmt"
	"git-booster/internal/handler"
	"git-booster/internal/utils"
	"log"
	"net/http"
)

func main() {
	// Seed the random number generator
	utils.SeedRandom()

	// Try to find an available port starting from 3000
	basePort := 3000
	port := utils.FindAvailablePort(basePort)
	if port == -1 {
		log.Fatal("Error: No available port found.")
		return
	}

	// Log the chosen port
	fmt.Printf("\n✅ Found an available port: %d\n", port)

	// Start HTTP server
	http.HandleFunc("/commit", handler.CommitHandler)

	// Start listening on the found port
	fmt.Printf("\n🌍 Server is running on port %d... 🌍\n", port)
	log.Printf("Listening on port %d...", port)
	if err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
