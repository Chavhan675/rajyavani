import fs from "fs";

async function run() {
  const opDataStr = `{"title":"टेस्ट टायटल","summary":"टेस्ट सारांश","content":"टेस्ट आशय","status":"PUBLISHED","authorId":"system-automator","authorName":"Rajyavani System","category":"तंत्रज्ञान","district":"","taluka":"","village":"","tags":["तंत्रज्ञान"],"publishedAt":1723896593574,"createdAt":1723896593574,"updatedAt":1723896593574,"isDeveloping":false,"aiGenerated":true,"sourceUrl":"https://example.com","imageUrl":null,"imagePrompt":"test prompt","imageAlt":"test alt","requiresHumanReview":false}`;
  const data = JSON.parse(opDataStr);
  console.log(data);
}
run();
