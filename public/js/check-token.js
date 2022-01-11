var token = localStorage.getItem('token')
var completedMeasurements = localStorage.getItem('completedMeasurements')

if(token && completedMeasurements === 'true') {
    window.location.href = "http://localhost:3001/dashboard.html"
} else if (token && completedMeasurements === 'false') {
    window.location.href = "http://localhost:3001/onboarding.html"
}