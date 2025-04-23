
# School-Management


## Endpoints


### 1️⃣ Add School
- **Method**: `POST`
- **URL**: `http://localhost:3000/addSchool`
  
#### Request Headers:
- `Content-Type: application/json`

#### Request Body (raw JSON):
```json
{
  "name": "Greenwood High",
  "address": "123 Elm Street, NY",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

#### Expected Response (example):
```json
{
  "message": "School added successfully.",
  "id": 1
}
```
### 2️⃣ List Schools
- **Method**: `GET`
- **URL**: `http://localhost:3000/listSchools?latitude=40.730610&longitude=-73.935242`

#### Expected Response (example):
```json
[
  {
    "id": 1,
    "name": "Greenwood High",
    "address": "123 Elm Street, NY",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "distance": 6.28
  }
]