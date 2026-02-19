package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Message struct {
	Text string `json:"text"`
}

func main() {
	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, Message{
			Text: "Hello from Gin!",
		})
	})

	r.Run(":8080")
}
