## APIs

### Create a booking

- <b>Endpoint</b>: /api/book
- <b>Method</b>: POST
- <b>Body</b>:
  {
  "responses": {
  "name": "xyz",
  "email": "xxyyzz@gmail.com",
  "location": {
  "value": "link",
  "optionValue": "integrations:google:meet"
  }
  },
  "start": "2024-05-22T14:00:00+05:30",
  "eventTypeId": 791261,
  "timeZone": "Asia/Kolkata",
  "language": "en",
  "metadata": {}
  }

### Find Free Schedule starting from a date
- <b>Endpoint</b>: /api/book/findFreeSchedule
- <b>Method</b>: GET
- <b>Parameters</b>: username and date (YYYY-MM-DD)

### Find Free Schedule on a specific date
- <b>Endpoint</b>: /api/book/findFreeScheduleOnD