## APIs

### Create a booking

- <b>Endpoint</b>: /api/book
- <b>Method</b>: POST
- <b>Body</b>:
  ```
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
  "eventTypeSlug": "30min", or 15min or 1-hour-meeting or secret
  "timeZone": "Asia/Kolkata",
  "language": "en",
  "metadata": {}
  }
  ```

### Find all EventTypes and Ids

- <b>Endpoint</b>: /api/findEventTypeId
- <b>Method</b>: GET

### Find Available Slots

- <b>Endpoint</b>: /api/slots
- <b>Method</b>: GET
- <b>Query Params</b>: startTime, endTime (optional), eventTypeId (optional), eventTypeSlug (optional)
- <b>Note</b>: At least one among eventTypeId and eventTypeSlug is required

### Find Free Schedule between 2 dates

- <b>Endpoint</b>: /api/getAvailableSlotRange
- <b>Method</b>: GET
- <b>Parameters</b>: username, startDate (YYYY-MM-DD) and endDate (YYYY-MM-DD)
